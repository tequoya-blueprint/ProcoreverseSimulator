// --- app-d3-helpers.js ---
// VERSION 3: Protects 'tour_preview' mode from accidental resets on mouse move.

/**
 * Generates the SVG path string for a hexagon.
 * @param {number} size - The radius of the hexagon.
 * @returns {string} The SVG path data string.
 */
function generateHexagonPath(size) {
    const points = Array.from({length: 6}, (_, i) => {
        const a = Math.PI / 180 * (60 * i);
        return [size * Math.cos(a), size * Math.sin(a)];
    });
    return "M" + points.map(p => p.join(",")).join("L") + "Z";
}

/**
 * Creates and returns the D3 drag behavior.
 * @param {Object} simulation - The D3 force simulation.
 * @returns {Function} The D3 drag behavior.
 */
function drag(simulation) {
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        hideTooltip(); // From app-utils.js
    }
    
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        // Nodes stay sticky (no fx/fy reset)
    }
    
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

// --- Interaction Handlers ---

/**
 * Handles the click event on a node.
 * @param {Event} event - The D3 click event.
 * @param {Object} d - The node data object.
 */
function nodeClicked(event, d) {
    event.stopPropagation();
    
    // If in a tour or preview, selecting a node shouldn't break the tour
    if (app.interactionState === 'tour' || app.interactionState === 'tour_preview') return;

    if (app.selectedNode === d) {
        resetHighlight();
    } else {
        app.interactionState = 'selected';
        app.selectedNode = d;
        applyHighlight(d);
        showInfoPanel(d); // From app-panel.js
        centerViewOnNode(d);
        d3.select('#graph-container').classed('selection-active', true);
    }
}

/**
 * Handles the mouseover event on a node.
 * @param {Event} event - The D3 mouse event.
 * @param {Object} d - The node data object.
 */
function nodeMouseOver(event, d) {
    // FIX: Don't trigger highlight logic if we are in a tour OR previewing a tour
    if (app.interactionState === 'tour' || app.interactionState === 'tour_preview') return;
    
    showTooltip(event, d); // From app-utils.js
    if (app.interactionState === 'explore') {
        applyHighlight(d);
    }
}

/**
 * Handles the mouseout event on a node.
 */
function nodeMouseOut() {
    // FIX: Don't reset highlight logic if we are in a tour OR previewing a tour
    if (app.interactionState === 'tour' || app.interactionState === 'tour_preview') return;
    
    hideTooltip(); // From app-utils.js
    if (app.interactionState === 'explore') {
        resetHighlight();
    }
}

// --- Highlighting Logic ---

/**
 * Applies highlight effects to the selected node and its connections.
 * @param {Object} d - The node data object.
 */
function applyHighlight(d) {
    const connectedNodeIds = new Set([d.id]);
    const connectedLinks = new Set();

    app.simulation.force("link").links().forEach(l => {
        if (l.source.id === d.id || l.target.id === d.id) {
            connectedNodeIds.add(l.source.id);
            connectedNodeIds.add(l.target.id);
            connectedLinks.add(l);
        }
    });

    const opacity = 0.1; 
    
    app.node.classed("selected", n => app.interactionState === 'selected' && n.id === d.id);
    
    app.node.transition().duration(300)
        .style("opacity", n => connectedNodeIds.has(n.id) ? 1 : opacity);
    
    app.link.transition().duration(300)
        .style("stroke-opacity", l => connectedLinks.has(l) ? 1 : opacity * 0.5)
        .attr("marker-end", l => {
            if (!connectedLinks.has(l)) return null;
            return `url(#arrow-highlighted)`;
        });
}

/**
 * Highlights a single connection (used from info panel hover).
 * @param {HTMLElement} element - The list item element being hovered.
 * @param {Object} d - The main node data object.
 */
function highlightConnection(element, d) {
    const { otherNodeId, type } = element.dataset;

    const specificLink = app.simulation.force("link").links().find(l => 
        (l.source.id === d.id && l.target.id === otherNodeId && l.type === type) ||
        (l.target.id === d.id && l.source.id === otherNodeId && l.type === type)
    );

    const connectedNodeIds = new Set([d.id, otherNodeId]);
    const opacity = 0.1;

    app.node.transition().duration(300)
        .style("opacity", n => connectedNodeIds.has(n.id) ? 1 : opacity);
    
    app.link.transition().duration(300)
        .style("stroke-opacity", l => l === specificLink ? 1 : opacity * 0.5)
        .classed("highlighted", l => l === specificLink)
        .attr("marker-end", l => {
            if (l !== specificLink) return null;
            return `url(#arrow-highlighted)`;
        });
}

/**
 * Resets all highlights and selections.
 * @param {boolean} [hidePanel=true] - Whether to also hide the info panel.
 */
function resetHighlight(hidePanel = true) {
    // FIX: Protect 'tour_preview' as well as 'tour'
    if (app.interactionState === 'tour' || app.interactionState === 'tour_preview') return; 

    app.interactionState = 'explore';
    app.selectedNode = null;
    
    app.node.classed("selected", false);
    app.node.transition().duration(400).style("opacity", 1);
    
    app.link.classed("highlighted", false).classed("pulsing", false);
    app.link.transition().duration(400)
        .style("stroke-opacity", 0.6) 
        .attr("marker-end", d => {
            // Basic logic to restore default arrow heads based on type
            // We read from the global legendData if possible, or default
            if (typeof legendData !== 'undefined') {
                const legend = legendData.find(l => l.type_id === d.type);
                if (legend && legend.visual_style.includes("one arrow")) return `url(#arrow-${d.type})`;
            }
            return null;
        });
        
    if (hidePanel) {
        // Only hide if we really want to (e.g., clicking X)
        // Checking interactionState again just in case
        if (app.interactionState === 'explore') {
            // We need to call hideInfoPanel from app-panel.js
            // Since this is a helper file, we assume that function is global
            if (typeof hideInfoPanel === 'function') hideInfoPanel();
        }
    }
    
    d3.select('#graph-container').classed('selection-active', false);
}


// --- Camera & Zoom Controls ---

function resetZoom() {
    app.svg.transition().duration(1000).ease(d3.easeCubicInOut)
        .call(app.zoom.transform, d3.zoomIdentity);
}

function centerViewOnNode(d) {
    if (d.x == null || d.y == null) return;
    
    const scale = 1.5; 
    const x = app.width / 2 - d.x * scale;
    const y = app.height / 2 - d.y * scale;
    
    app.svg.transition().duration(800).ease(d3.easeCubicInOut)
        .call(app.zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
}
