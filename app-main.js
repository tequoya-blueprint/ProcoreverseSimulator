// --- app-main.js ---
// VERSION 3: Dynamically builds categories and adds legend checkboxes.

// --- Global App State ---
const app = {
    simulation: null,
    svg: null,
    zoom: null,
    g: null,
    linkG: null,
    nodeG: null,
    node: null,
    link: null,
    width: 0,
    height: 0,
    categories: {}, // Will be populated by setupCategories
    categoryFoci: {}, // Will be populated by setFoci
    baseNodeSize: 25,
    nodeSizeCompany: 28,
    nodeCollisionRadius: 60,
    arrowRefX: 34, // nodeSizeCompany + 6
    defaultArrowColor: "#a0a0a0",
    interactionState: 'explore', // 'explore', 'selected', 'tour'
    selectedNode: null,
    currentTour: null,
    currentStep: -1,
    apiKey: "AIzaSyCkAIR6TdQfs5q515M7AROv1LDq1qEhwKc" // Your API key
};

// --- Color & Category Definitions (NOW DYNAMIC) ---
function setupCategories() {
    const rootStyles = getComputedStyle(document.documentElement);
    const procoreColors = { 
        orange: rootStyles.getPropertyValue('--procore-orange').trim(), 
        lumber: rootStyles.getPropertyValue('--procore-lumber').trim(), 
        earth: rootStyles.getPropertyValue('--procore-earth').trim(), 
        metal: rootStyles.getPropertyValue('--procore-metal').trim() 
    };

    // Base color map for known groups
    const colorMap = {
        "Preconstruction": procoreColors.lumber,
        "Project Management": procoreColors.orange,
        "Financial Management": procoreColors.earth,
        "Workforce Management": "#3a8d8c", // Custom teal
        "Quality & Safety": "#5B8D7E", // A construction green
        "Platform & Core": "#757575",
        "Construction Intelligence": "#4A4A4A",
        "External Integrations": "#B0B0B0",
        "Helix": "#6e42c1", // Purple
        "Project Execution": procoreColors.orange,
        "Resource Management": procoreColors.metal,
        "Emails": "#c94b4b" // A reddish color
    };
    
    // Dynamically build app.categories ONLY from nodesData
    app.categories = {}; // Start fresh
    nodesData.forEach(node => {
        if (!app.categories[node.group]) {
            // Assign color from map, or a random color if group is unknown
            app.categories[node.group] = { 
                color: colorMap[node.group] || "#" + Math.floor(Math.random()*16777215).toString(16)
            };
        }
    });
}

// --- D3 Simulation Setup ---
function initializeSimulation() {
    const container = document.getElementById('graph-container');
    app.width = container.clientWidth;
    app.height = container.clientHeight;

    app.svg = d3.select("#procore-graph");
    app.g = app.svg.append("g");
    app.linkG = app.g.append("g").attr("class", "links");
    app.nodeG = app.g.append("g").attr("class", "nodes");

    setupMarkers(); 

    app.zoom = d3.zoom()
        .scaleExtent([0.2, 4])
        .on("zoom", (event) => {
            app.g.attr("transform", event.transform);
            const currentScale = event.transform.k;
            app.node.selectAll("text").style("opacity", currentScale < 0.5 ? 0 : 1);
        });
    app.svg.call(app.zoom);

    app.simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.id).distance(130).strength(0.9))
        .force("charge", d3.forceManyBody().strength(-800))
        .force("center", d3.forceCenter(app.width / 2, app.height / 2))
        .force("collision", d3.forceCollide().radius(app.nodeCollisionRadius).strength(0.8))
        .on("tick", ticked);

    app.link = app.linkG.selectAll("path");
    app.node = app.nodeG.selectAll("g");

    setFoci();
}

// --- Marker & Legend Setup (Adds Checkboxes) ---
function setupMarkers() {
    const defs = app.svg.select("defs");

    legendData.forEach(type => {
        let color = app.defaultArrowColor;
        if (type.type_id === 'feeds') {
            color = "#a0a0a0"; 
        } else if (type.visual_style.includes("solid")) {
            color = 'var(--procore-orange)';
        }

        if (type.visual_style.includes("one arrow")) {
            defs.append("marker")
                .attr("id", `arrow-${type.type_id}`)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", app.arrowRefX)
                .attr("markerWidth", 5)
                .attr("markerHeight", 5)
                .attr("orient", "auto")
                .append("path")
                .attr("d", "M0,-5L10,0L0,5")
                .attr("fill", color);
        }
    });

    defs.append("marker")
        .attr("id", "arrow-highlighted")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", app.arrowRefX)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "var(--procore-orange)");
}

function populateLegend() {
    const legendContainer = d3.select("#connection-legend");
    legendContainer.html(""); 

    legendData.forEach(type => {
        let svg;
        switch(type.visual_style) {
            case "Dashed line, one arrow":
                svg = "<svg width='24' height='10'><line x1='0' y1='5' x2='20' y2='5' stroke='#a0a0a0' stroke-width='2' stroke-dasharray='4,3'></line><path d='M17,2 L23,5 L17,8' stroke='#a0a0a0' stroke-width='2' fill='none'></path></svg>";
                break;
            case "Solid line, two arrows":
                svg = "<svg width='24' height='10'><path d='M3,2 L9,5 L3,8' stroke='#a0a0a0' stroke-width='2' fill='none'></path><line x1='6' y1='5' x2='18' y2='5' stroke='#a0a0a0' stroke-width='2'></line><path d='M21,2 L15,5 L21,8' stroke='#a0a0a0' stroke-width='2' fill='none'></path></svg>";
                break;
            case "Solid line, one arrow":
                svg = "<svg width='24' height='10'><line x1='0' y1='5' x2='20' y2='5' stroke='#a0a0a0' stroke-width='2'></line><path d='M17,2 L23,5 L17,8' stroke='#a0a0a0' stroke-width='2' fill='none'></path></svg>";
                break;
            case "Dotted line, one arrow":
                svg = "<svg width='24' height='10'><line x1='0' y1='5' x2='20' y2='5' stroke='#a0a0a0' stroke-width='2' stroke-dasharray='1,2'></line><path d='M17,2 L23,5 L17,8' stroke='#a0a0a0' stroke-width='2' fill='none'></path></svg>";
                break;
            case "Solid line, one arrow, gray":
                svg = "<svg width='24' height='10'><line x1='0' y1='5' x2='20' y2='5' stroke='#a0a0a0' stroke-width='2'></line><path d='M17,2 L23,5 L17,8' stroke='#a0a0a0' stroke-width='2' fill='none'></path></svg>";
                break;
            default:
                svg = "<svg width='24' height='10'><line x1='0' y1='5' x2='24' y2='5' stroke='#a0a0a0' stroke-width='2'></line></svg>";
        }

        const item = legendContainer.append("label") // Change to label for checkbox
            .attr("class", "flex items-start mb-2 cursor-pointer") 
            .attr("title", type.description);
        
        // Add checkbox
        item.append("input")
            .attr("type", "checkbox")
            .attr("checked", true)
            .attr("value", type.type_id)
            .attr("class", "form-checkbox h-5 w-5 text-orange-600 transition rounded mr-3 mt-0.5 focus:ring-orange-500 legend-checkbox")
            .on("change", () => updateGraph(true));

        item.node().innerHTML += `
            <div class="flex-shrink-0 w-8">${svg}</div>
            <div class="ml-2">
                <span class="font-semibold">${type.label}</span>
                <span class="block text-xs text-gray-500 leading-snug">${type.description}</span>
            </div>
        `;
    });
}


// --- Foci & Clustering (CORRECTED) ---
function setFoci() {
    const container = document.getElementById('graph-container');
    app.width = container.clientWidth;
    app.height = container.clientHeight;
    
    if (app.simulation) {
        app.simulation.force("center", d3.forceCenter(app.width / 2, app.height / 2));
    }

    const layout = {
        "Platform & Core": { x: 0.5, y: 0.5 },
        "Financial Management": { x: 0.75, y: 0.3 },
        "Preconstruction": { x: 0.5, y: 0.15 },
        "Project Management": { x: 0.25, y: 0.3 },
        "Quality & Safety": { x: 0.25, y: 0.7 },
        "Workforce Management": { x: 0.75, y: 0.7 },
        "Construction Intelligence": { x: 0.5, y: 0.85 },
        "External Integrations": { x: 0.9, y: 0.5 },
        "Helix": { x: 0.1, y: 0.5 },
        "Project Execution": { x: 0.25, y: 0.3 },
        "Resource Management": { x: 0.75, y: 0.7 },
        "Emails": { x: 0.1, y: 0.1 }
    };

    // Build foci from the dynamically created categories
    Object.keys(app.categories).forEach(key => {
        app.categoryFoci[key] = {
            x: app.width * (layout[key]?.x || 0.5), 
            y: app.height * (layout[key]?.y || 0.5)
        };
    });
}

function forceCluster(alpha) {
    return function(d) {
        const focus = app.categoryFoci[d.group];
        if (!focus) return;
        let k = alpha * 0.2; 
        d.vx -= (d.x - focus.x) * k;
        d.vy -= (d.y - focus.y) * k;
    };
}

// --- Simulation Tick ---
function ticked() {
    if (app.simulation && app.simulation.alpha() > 0.05) {
        app.simulation.nodes().forEach(forceCluster(app.simulation.alpha()));
    }
    if(app.link) app.link.attr("d", d => `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`);
    if(app.node) app.node.attr("transform", d => `translate(${d.x || 0},${d.y || 0})`);
}

// --- Main Graph Update Function (CORRECTED) ---
function updateGraph(isFilterChange = true) {
    if (isFilterChange && app.currentTour) stopTour();

    // getActiveFilters() is in app-controls.js
    const filters = getActiveFilters(); 

    const filteredNodes = nodesData.filter(d => {
        const inCategory = filters.categories.has(d.group);
        const inPersona = filters.persona === 'all' || (d.personas && d.personas.includes(filters.persona));
        const inAudience = filters.audience === 'all' || (d.audience && d.audience.includes(filters.audience));
        const inPackage = !filters.packageTools || filters.packageTools.has(d.id);
        return inCategory && inPersona && inAudience && inPackage;
    });

    const nodeIds = new Set(filteredNodes.map(n => n.id));
    
    // *** THIS IS THE FIX: Added filtering by connection type ***
    const filteredLinks = linksData.filter(d => 
        nodeIds.has(d.source.id || d.source) && 
        nodeIds.has(d.target.id || d.target) &&
        filters.connectionTypes.has(d.type) // <-- NEW FILTER
    ).map(d => ({...d})); 

    // --- D3 Data Join: Nodes ---
    app.node = app.node.data(filteredNodes, d => d.id)
        .join(
            enter => {
                const nodeGroup = enter.append("g")
                    .attr("class", "node")
                    .call(drag(app.simulation)) // from app-d3-helpers.js
                    .on("mouseenter", nodeMouseOver) // from app-d3-helpers.js
                    .on("mouseleave", nodeMouseOut) // from app-d3-helpers.js
                    .on("click", nodeClicked); // from app-d3-helpers.js
                
                nodeGroup.append("path")
                    .attr("d", d => generateHexagonPath(d.level === 'Company' ? app.nodeSizeCompany : app.baseNodeSize)) // from app-d3-helpers.js
                    .attr("fill", d => app.categories[d.group].color)
                    .style("color", d => app.categories[d.group].color);
                
                nodeGroup.append("text")
                    .text(d => d.id)
                    .attr("dy", d => (d.level === 'Company' ? app.nodeSizeCompany : app.baseNodeSize) + 18);
                
                nodeGroup.style("opacity", 0).transition().duration(500).style("opacity", 1);
                return nodeGroup;
            },
            update => update,
            exit => exit.transition().duration(300).style("opacity", 0).remove()
        );

    // --- D3 Data Join: Links (CORRECTED) ---
    app.link = app.link.data(filteredLinks, d => `${d.source.id || d.source}-${d.target.id || d.target}-${d.type}`)
        .join("path")
        .attr("class", d => `link ${d.type}`) 
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", d => {
            const legend = legendData.find(l => l.type_id === d.type);
            if (!legend) return "none";
            if (legend.visual_style.includes("Dashed")) return "4,3";
            if (legend.visual_style.includes("Dotted")) return "1,2";
            return "none";
        })
        .attr("marker-end", d => {
            const legend = legendData.find(l => l.type_id === d.type);
            if (!legend) return null;
            if (legend.visual_style.includes("one arrow")) return `url(#arrow-${d.type})`;
            return null;
        });

    app.simulation.nodes(filteredNodes);
    app.simulation.force("link").links(filteredLinks);
    app.simulation.alpha(1).restart();
    
    updateTourDropdown(filters.packageTools); // from app-tours.js
    resetHighlight(); // from app-d3-helpers.js
}

// --- Window & Initial Load ---
window.addEventListener('resize', () => {
    setFoci();
    if(app.simulation) {
        app.simulation.alpha(0.5).restart();
    }
});

// --- Main Initialization Function ---
document.addEventListener('DOMContentLoaded', () => {
    setupCategories();
    initializeSimulation(); 
    initializeControls(); // from app-controls.js
    initializeInfoPanel(); // from app-panel.js
    initializeTourControls(); // from app-tours.js
    
    populateLegend();
    updateGraph(false); 

    setTimeout(() => {
        document.getElementById('loading-overlay').classList.add('hidden');
    }, 1500);

    if (!localStorage.getItem('procoreverseV2_Visited')) {
        d3.select("#help-button").classed('initial-pulse', true);
        localStorage.setItem('procoreverseV2_Visited', 'true');
    }
});
