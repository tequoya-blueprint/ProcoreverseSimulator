// --- app-d3-helpers.js ---
// VERSION 5: Full Code. Includes Sticky Nodes, Tour Protection, and Crash Safety Checks.

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
        // Check if hideTooltip exists before calling to prevent crash
        if (typeof hideTooltip === 'function') hideTooltip(); 
    }
    
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        // FIX: We do NOT set d.fx = null here. 
        // Leaving them set makes the node "Sticky" (it stays where you drop it).
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
    
    // 1. Protect Tour views: Don't let a click disrupt a tour
    if (app.interactionState === 'tour' || app.interactionState === 'tour_preview') return;

    // 2. Toggle selection
    if (app.selectedNode === d) {
        resetHighlight();
    } else {
        app.interactionState = 'selected';
        app.selectedNode = d;
        applyHighlight(d);
        
        // Safety check for app-panel.js availability
        if (typeof showInfoPanel === 'function') {
            showInfoPanel(d);
        }
        
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
    // Protect Tour views
    if (app.interactionState === 'tour' || app.interactionState === 'tour_preview') return;
    
    if (typeof showTooltip === 'function') showTooltip(event, d);
    
    if (app.interactionState === 'explore') {
        applyHighlight(d);
    }
}

/**
 * Handles the mouseout event on a node.
 */
function nodeMouseOut() {
    // Protect Tour views
    if (app.interactionState === 'tour' || app.interactionState === 'tour_preview') return;
    
    if (typeof hideTooltip === 'function') hideTooltip();
    
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
    // Safety Check: Ensure simulation is ready
    if (!app.simulation) return;

    const connectedNodeIds = new Set([d.id]);
    const connectedLinks = new Set();

    // Find all links and 1st-degree nodes
    app.simulation.force("link").links().forEach(l => {
        if (l.source.id === d.id || l.target.id === d.id) {
            connectedNodeIds.add(l.source.id);
            connectedNodeIds.add(l.target.id);
            connectedLinks.add(l);
        }
    });

    const opacity = 0.1; // Fade opacity for non-connected items
    
    // Apply styles
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
    if (!app.simulation) return;

    const { otherNodeId, type } = element.dataset;

    // Find the specific link object
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
    // Protect Tour views
    if (app.interactionState === 'tour' || app.interactionState === 'tour_preview') return; 

    app.interactionState = 'explore';
    app.selectedNode = null;
    
    // Reset Nodes
    if (app.node) {
        app.node.classed("selected", false);
        app.node.transition().duration(400).style("opacity", 1);
    }
    
    // Reset Links
    if (app.link) {
        app.link.classed("highlighted", false).classed("pulsing", false);
        app.link.transition().duration(400)
            .style("stroke-opacity", 0.6) 
            .attr("marker-end", d => {
                // Safety Check: Ensure legendData exists before reading it
                // This prevents the crash you saw earlier if links load slowly
                if (typeof legendData !== 'undefined') {
                     const legend = legendData.find(l => l.type_id === d.type);
                     if (legend && legend.visual_style.includes("one arrow")) return `url(#arrow-${d.type})`;
                }
                return null;
            });
    }
        
    // Reset Panel
    if (hidePanel) {
        // Only hide panel if we are actually resetting explore mode
        if (typeof hideInfoPanel === 'function') hideInfoPanel();
    }
    
    d3.select('#graph-container').classed('selection-active', false);
}


// --- Camera & Zoom Controls ---

/**
 * Resets the zoom and pan to the default view.
 */
function resetZoom() {
    if (app.svg && app.zoom) {
        app.svg.transition().duration(1000).ease(d3.easeCubicInOut)
            .call(app.zoom.transform, d3.zoomIdentity);
    }
}

/**
 * Centers and zooms the view on a specific node.
 * @param {Object} d - The node data object.
 */
function centerViewOnNode(d) {
    // Safety check for coordinates
    if (!d || d.x == null || d.y == null || !app.svg || !app.zoom) return;
    
    const scale = 1.5; 
    const x = app.width / 2 - d.x * scale;
    const y = app.height / 2 - d.y * scale;
    
    app.svg.transition().duration(800).ease(d3.easeCubicInOut)
        .call(app.zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
}
