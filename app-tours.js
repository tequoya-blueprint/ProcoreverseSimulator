// --- app-tours.js ---
// VERSION 7: Ensures Platform Tours are GLOBAL (always visible).

/**
 * Initializes event listeners for tour controls and the AI modal.
 */
function initializeTourControls() {
    // Tour selection dropdown listener
    d3.select("#tour-select").on("change", function() {
        const tourId = this.value;
        if (tourId === "none") {
            stopTour();
        } else {
            const tourData = flatTours[tourId];
            if (tourData) {
                previewTour(tourData);
            }
        }
    });

    // Previous/Next Buttons
    d3.select("#tour-prev").on("click", () => {
        if (app.currentStep > 0) { 
            app.currentStep--; 
            runTourStep(); 
        }
    });
    d3.select("#tour-next").on("click", () => {
        if (app.currentTour && app.currentStep < app.currentTour.steps.length - 1) { 
            app.currentStep++; 
            runTourStep(); 
        }
    });

    // AI Modal Interactions
    const aiModalOverlay = d3.select("#ai-modal-overlay");
    d3.select("#ai-workflow-builder-btn").on("click", () => aiModalOverlay.classed("visible", true));
    d3.select("#ai-modal-close").on("click", () => aiModalOverlay.classed("visible", false));
    aiModalOverlay.on("click", function(e) { 
        if (e.target === this) aiModalOverlay.classed("visible", false); 
    });
    d3.select("#ai-workflow-generate").on("click", generateAiWorkflow);
}

/**
 * Updates the dropdown list based on available tools.
 * - Platform Tours: ALWAYS shown.
 * - Package Tours: Shown ONLY if the package has the tools.
 * - AI Tours: ALWAYS shown.
 */
function updateTourDropdown(packageTools) {
    const tourSelect = d3.select("#tour-select");
    const platformTours = d3.select("#platform-tours").html("");
    const packageTours = d3.select("#package-tours").html("");
    const aiTours = d3.select("#ai-tours").html("");

    let platformTourCount = 0;
    let packageTourCount = 0;
    let aiTourCount = 0;

    // 1. Platform Workflows (GLOBAL - ALWAYS SHOW)
    if (tours.platform) {
        Object.entries(tours.platform).forEach(([tourId, tourData]) => {
            // We show these regardless of package selection
            platformTours.append("option").attr("value", tourId).text(tourData.name);
            platformTourCount++;
        });
    }

    // 2. Package Workflows (Only if package selected and tools exist)
    if (packageTools && tours.package) {
        Object.entries(tours.package).forEach(([tourId, tourData]) => {
            const allNodesInPackage = tourData.steps.every(step => packageTools.has(step.nodeId));
            if (allNodesInPackage) {
                packageTours.append("option").attr("value", tourId).text(tourData.name);
                packageTourCount++;
            }
        });
    }
    
    // 3. AI Tours (Always Visible)
    if (tours.ai) {
        Object.entries(tours.ai).forEach(([tourId, tourData]) => {
            aiTours.append("option").attr("value", tourId).text(tourData.name);
            aiTourCount++;
        });
    }

    // Visibility toggles for the OptGroups
    d3.select("#platform-tours").style("display", ""); // Always show
    d3.select("#package-tours").style("display", packageTourCount > 0 ? "" : "none");
    d3.select("#ai-tours").style("display", aiTourCount > 0 ? "" : "none");
}

/**
 * Previews a tour: dims graph, highlights nodes, shows "Start" button.
 */
function previewTour(tourData) {
    app.interactionState = 'tour_preview'; 
    app.currentTour = tourData;
    
    // *** CRITICAL FIX: Reset visual filters so tour nodes are visible ***
    // This ensures workflow tours are not restricted by package selection visually.
    d3.select("#region-filter").property('value', 'all');
    d3.select("#audience-filter").property('value', 'all').property("disabled", true);
    d3.select("#package-filter").property('value', 'all').property("disabled", true);
    
    // Trigger update to show all nodes before highlighting
    updateGraph(false); 

    const tourNodeIds = new Set(tourData.steps.map(s => s.nodeId));
    
    // Fade out everything, then fade in ONLY tour nodes
    app.node.transition().duration(400)
        .style("opacity", n => tourNodeIds.has(n.id) ? 1 : 0.1);
        
    // Highlight tour links
    const tourLinks = new Set();
    for (let i = 0; i < tourData.steps.length - 1; i++) {
        const step1 = tourData.steps[i].nodeId;
        const step2 = tourData.steps[i+1].nodeId;
        app.simulation.force("link").links().forEach(l => {
            if ((l.source.id === step1 && l.target.id === step2) || (l.source.id === step2 && l.target.id === step1)) {
                tourLinks.add(l);
            }
        });
    }

    app.link.classed("highlighted", l => tourLinks.has(l));
    app.link.classed("pulsing", false); 
    app.link.transition().duration(400)
        .style("stroke-opacity", l => tourLinks.has(l) ? 1 : 0.05)
        .attr("marker-end", l => {
            const legendType = legendData.find(type => type.type_id === l.type);
            if (tourLinks.has(l) && legendType && legendType.visual_style.includes("one arrow")) {
                 return `url(#arrow-highlighted)`;
            }
            return null;
        });

    // Show Start Button in the control panel
    const tourControls = d3.select("#tour-controls");
    tourControls.html(`
        <button id="tour-start" class="btn-primary py-2 px-4 text-sm w-full">
            <i class="fas fa-play mr-2"></i> Start Tour: ${tourData.name}
        </button>
    `);
    tourControls.style("display", "flex");
    d3.select("#tour-start").on("click", startTour);
    
    hideInfoPanel();
    d3.select('#graph-container').classed('selection-active', true);
}

/**
 * Launches the active tour.
 */
function startTour() {
    app.interactionState = 'tour';
    app.currentStep = 0;
    
    const tourControls = d3.select("#tour-controls");
    tourControls.html(`
        <button id="tour-prev" class="btn-primary py-2 px-4 text-sm"><i class="fas fa-arrow-left mr-1"></i> Prev</button>
        <span id="tour-step" class="text-sm font-semibold text-gray-600"></span>
        <button id="tour-next" class="btn-primary py-2 px-4 text-sm">Next <i class="fas fa-arrow-right ml-1"></i></button>
    `);
    
    d3.select("#tour-prev").on("click", () => { if (app.currentStep > 0) { app.currentStep--; runTourStep(); } });
    d3.select("#tour-next").on("click", () => { if (app.currentTour && app.currentStep < app.currentTour.steps.length - 1) { app.currentStep++; runTourStep(); } });

    runTourStep(); 
}

/**
 * Stops the tour and resets the view.
 */
function stopTour() {
    if (app.interactionState === 'explore') return;
    app.interactionState = 'explore';
    app.currentTour = null;
    app.currentStep = -1;
    d3.select("#tour-controls").style("display", "none").html(""); 
    d3.select("#tour-select").property('value', 'none');
    resetHighlight(); 
}

/**
 * Steps through the tour logic.
 */
function runTourStep() {
    if (!app.currentTour) return;
    const step = app.currentTour.steps[app.currentStep];
    const nodeData = app.simulation.nodes().find(n => n.id === step.nodeId);
    
    // Safety check: if node doesn't exist, warn and stop.
    if (!nodeData) {
        console.warn(`Tour step node "${step.nodeId}" not found.`);
        stopTour();
        return;
    }

    const tourNodeIds = new Set(app.currentTour.steps.map(s => s.nodeId));
    
    // Ensure visibility again (in case user clicked something else)
    app.node.transition().duration(500).style("opacity", n => tourNodeIds.has(n.id) ? 1 : 0.1);
    app.node.classed("selected", n => n.id === nodeData.id);

    // Reset links
    app.link.classed("pulsing", false).classed("highlighted", false)
        .transition().duration(500).style("stroke-opacity", 0.1).attr("marker-end", null);

    // Highlight path from previous step
    if (app.currentStep > 0) {
        const prevStep = app.currentTour.steps[app.currentStep - 1];
        const stepLink = app.link.filter(l =>
            (l.source.id === prevStep.nodeId && l.target.id === step.nodeId) ||
            (l.source.id === step.nodeId && l.target.id === prevStep.nodeId)
        );
        if (!stepLink.empty()) {
            stepLink.classed("pulsing", true).transition().duration(500).style("stroke-opacity", 1).attr("marker-end", l => `url(#arrow-highlighted)`);
        }
    }

    // Update Info Panel
    showInfoPanel(nodeData); 
    d3.select("#tour-info-box").style("display", "block");
    d3.select("#tour-info-text").text(step.info);
    centerViewOnNode(nodeData); 
    
    d3.select("#tour-step").text(`${app.currentStep + 1} / ${app.currentTour.steps.length}`);
    d3.select("#tour-prev").property("disabled", app.currentStep === 0);
    d3.select("#tour-next").property("disabled", app.currentStep === app.currentTour.steps.length - 1);
}

/**
 * AI Generation Logic
 */
async function generateAiWorkflow() {
    const button = d3.select("#ai-workflow-generate");
    const status = d3.select("#ai-modal-status");
    const userInput = d3.select("#ai-workflow-input").property("value");

    if (!userInput.trim()) { status.text("Please describe a workflow."); return; }

    button.property("disabled", true).html(`<i class="fas fa-spinner fa-spin mr-2"></i>Generating...`);
    status.html(`Analyzing... <span class="inline-block align-middle h-4 w-1 bg-gray-600 ml-1 border-r-2 border-gray-600 blinking-cursor"></span>`);
    
    const availableTools = nodesData.map(n => n.id).join(", ");
    const systemPrompt = `You are a Procore Platform expert. Generate a guided workflow tour based on the user's request. The tour must be a sequence of steps using ONLY the Procore tools listed. Output MUST be a valid JSON object.`;
    const userQuery = `Generate a workflow for: "${userInput}". Available tools: ${availableTools}.`;
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${app.apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        system_instruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: "application/json" }
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const result = await response.json();
        const newTour = JSON.parse(result.candidates[0].content.parts[0].text);

        if (newTour && newTour.steps && newTour.steps.length > 0) {
            const tourId = `ai_tour_${Date.now()}`;
            newTour.name = `✨ ${newTour.name}`;
            tours.ai[tourId] = newTour; 
            flatTours[tourId] = newTour; 

            d3.select("#ai-tours").append("option").attr("value", tourId).text(newTour.name);
            d3.select("#tour-select").property("value", tourId);
            previewTour(newTour);
            
            d3.select("#ai-modal-overlay").classed("visible", false);
            d3.select("#ai-workflow-input").property("value", "");
            status.text("");
        } else {
            throw new Error("AI returned invalid tour structure.");
        }
    } catch (error) {
        console.error("AI Workflow generation failed:", error);
        status.text("Sorry, I couldn't create a tour for that. Please try again.");
    }
    button.property("disabled", false).text("Generate Tour");
}
