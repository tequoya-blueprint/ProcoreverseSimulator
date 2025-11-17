// --- app-controls.js ---
// VERSION 4: Re-written to parse the new array-based packagingData structure.

/**
 * Initializes all event listeners for the control panel.
 */
function initializeControls() {
    // --- Accordion Setup ---
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            toggleAccordion(header.parentElement); // from app-utils.js
        });
    });

    // --- Filter Dropdowns (NEW CASCADE LOGIC) ---
    populateRegionFilter(); // New init function
    d3.select("#region-filter").on("change", onRegionChange);
    d3.select("#audience-filter").on("change", onAudienceChange);
    d3.select("#package-filter").on("change", onPackageChange);
    d3.select("#persona-filter").on("change", () => updateGraph(true));
    
    // --- Category Filters ---
    populateCategoryFilters(); 
    d3.select("#toggle-categories").on("click", toggleAllCategories);

    // --- Search ---
    d3.select("#search-input").on("input", handleSearchInput);
    d3.select("body").on("click", (e) => {
        if (!document.getElementById('search-container').contains(e.target)) {
            d3.select("#search-results").html("").style("opacity", 0).style("transform", "scale(0.95)");
        }
    });

    // --- Buttons ---
    d3.select("#reset-view").on("click", resetView);
    d3.select("#help-button").on("click", startOnboarding); // from app-utils.js
    d3.select("#left-panel-toggle").on("click", toggleLeftPanel); // from app-utils.js
    d3.select("#left-panel-expander").on("click", toggleLeftPanel); // from app-utils.js
}

/**
 * Populates the persona filter dropdown from node data.
 */
function populatePersonaFilter() {
    const personaFilter = d3.select("#persona-filter");
    personaFilter.html('<option value="all">All Personas</option>'); // Reset
    const allPersonas = new Set();
    nodesData.forEach(node => {
        if (node.personas) {
            node.personas.forEach(p => allPersonas.add(p));
        }
    });

    // Sort and add to dropdown
    [...allPersonas].sort().forEach(p => {
        const personaMap = {
            "pm": "Project Manager (GC)",
            "super": "Superintendent (GC)",
            "fm": "Financial Manager (GC)",
            "sub": "Specialty Contractor",
            "design": "Design Team",
            "owner": "Owner",
            "admin": "Admin",
            "estimator": "Estimator" // Added from your new data
        };
        personaFilter.append("option")
            .attr("value", p)
            .text(personaMap[p] || p);
    });
}

/**
 * Populates the category filter checkboxes dynamically from app.categories.
 */
function populateCategoryFilters() {
    const filtersContainer = d3.select("#category-filters");
    filtersContainer.html(""); // Clear old filters
    
    // app.categories is now built dynamically in app-main.js
    Object.keys(app.categories).sort().forEach(cat => {
        const label = filtersContainer.append("label").attr("class", "flex items-center cursor-pointer py-1");
        
        label.append("input")
            .attr("type", "checkbox")
            .attr("checked", true)
            .attr("value", cat)
            .attr("class", "form-checkbox h-5 w-5 text-orange-600 transition rounded mr-3 focus:ring-orange-500")
            .on("change", () => updateGraph(true));
        
        label.append("span")
            .attr("class", "legend-color")
            .style("background-color", app.categories[cat].color);
        
        label.append("span").attr("class", "text-gray-700").text(cat);
    });
}

/**
 * Toggles all category checkboxes on or off.
 */
let allCategoriesChecked = true;
function toggleAllCategories() {
    allCategoriesChecked = !allCategoriesChecked;
    d3.selectAll("#category-filters input").property("checked", allCategoriesChecked);
    updateGraph(true);
}

// --- NEW FILTER CASCADE LOGIC (for Array-based data) ---

function populateRegionFilter() {
    const regionFilter = d3.select("#region-filter");
    // Get unique regions from the new array structure
    const regions = [...new Set(packagingData.map(pkg => pkg.region))];
    regions.sort().forEach(region => {
        // Use NAMER from your data, but show NAM
        let label = region; 
        if (region === "NAMER") label = "NAM";
        if (region === "EUR") label = "EMEA";
        
        regionFilter.append("option")
            .attr("value", region)
            .text(label);
    });
}

function onRegionChange() {
    const region = d3.select(this).property("value");
    const audienceFilter = d3.select("#audience-filter");
    
    // Reset and disable Audience and Package
    audienceFilter.property("value", "all").property("disabled", region === "all");
    d3.select("#package-filter").property("value", "all").property("disabled", true);
    
    audienceFilter.html('<option value="all">All Audiences</option>'); // Clear old options

    if (region !== "all") {
        // Find unique audiences for the selected region
        const audiences = [...new Set(packagingData
            .filter(pkg => pkg.region === region)
            .map(pkg => pkg.audience)
        )];
        
         // Map the data values (e.g., "Owners") to the dropdown values (e.g., "O")
        const audienceMap = {
            "Contractor": "GC",
            "Owners": "O",
            "SC": "SC" // Add SC if it exists
        };
        // Use a Set to avoid duplicate dropdown options if "GC" and "Contractor" both exist
        const mappedAudiences = {};
        
        audiences.sort().forEach(aud => {
            const audKey = audienceMap[aud] || aud; // Get "O" from "Owners"
            const audLabel = aud; // Keep "Owners" as the label
            
            // This logic handles the mapping from your data (e.g., "Owners")
            // to the dropdown's internal value (e.g., "O")
            if(aud === "Owners") mappedAudiences["O"] = "Owner";
            else if(aud === "Contractor") mappedAudiences["GC"] = "General Contractor";
            else if(aud === "SC") mappedAudiences["SC"] = "Specialty Contractor";
            else mappedAudiences[aud] = aud; // Fallback
        });

        for (const [key, value] of Object.entries(mappedAudiences)) {
             audienceFilter.append("option").attr("value", key).text(value);
        }
    }
    
    updateGraph(true); // Update graph based on region change
}

function onAudienceChange() {
    const region = d3.select("#region-filter").property("value");
    const audience = d3.select(this).property("value");
    const packageFilter = d3.select("#package-filter");

    packageFilter.html(""); // Clear old options
    packageFilter.append("option").attr("value", "all").text("All Packages");
    packageFilter.property("disabled", true);
    
    // Map the dropdown value (e.g., "O") back to the data value (e.g., "Owners")
    let audienceDataKey = audience;
    if (audience === "O") audienceDataKey = "Owners";
    if (audience === "GC") audienceDataKey = "Contractor";
    // Add SC if needed
    if (audience === "SC") audienceDataKey = "SC"; 

    if (region !== 'all' && audience !== 'all') {
        // Find packages that match
        const packages = packagingData.filter(pkg => 
            pkg.region === region && pkg.audience === audienceDataKey
        );
        
        if (packages.length > 0) {
            packages.sort((a, b) => a.package_name.localeCompare(b.package_name)) // Sort packages alphabetically
                .forEach(pkg => {
                packageFilter.append("option")
                    .attr("value", pkg.package_name)
                    .text(pkg.package_name);
            });
            packageFilter.property("disabled", false);
        }
    }
    
    updateGraph(true); // Update graph based on audience change
}

function onPackageChange() {
    updateGraph(true);
}

/**
 * Gathers all active filter values.
 * @returns {Object} An object containing all active filter settings.
 */
function getActiveFilters() {
    const region = d3.select("#region-filter").property('value');
    const audience = d3.select("#audience-filter").property('value');
    const pkgName = d3.select("#package-filter").property('value');
    
    const activeCategories = new Set(
        d3.selectAll("#category-filters input:checked").nodes().map(el => el.value)
    );
    
    const activeConnectionTypes = new Set(
        d3.selectAll(".legend-checkbox:checked").nodes().map(el => el.value)
    );
    
    let packageTools = null;
    const addOnsContainer = d3.select("#add-ons-container");
    const addOnsCheckboxes = d3.select("#add-ons-checkboxes");
    const servicesContainer = d3.select("#package-services-container");
    const servicesList = d3.select("#package-services-list");

    // Clear old add-ons and services
    addOnsCheckboxes.html("");
    servicesList.html("");
    addOnsContainer.classed('hidden', true);
    servicesContainer.classed('hidden', true);

    if (region !== 'all' && audience !== 'all' && pkgName !== 'all') {
        // Map the dropdown value (e.g., "O") back to the data value (e.g., "Owners")
        let audienceDataKey = audience;
        if (audience === "O") audienceDataKey = "Owners";
        if (audience === "GC") audienceDataKey = "Contractor";
        if (audience === "SC") audienceDataKey = "SC";

        // Find the specific package object from the array
        const packageInfo = packagingData.find(pkg => 
            pkg.region === region && 
            pkg.audience === audienceDataKey && 
            pkg.package_name === pkgName
        );
        
        if (packageInfo) {
            packageTools = new Set(packageInfo.tools);
            
            // Handle Add-Ons
            if (packageInfo['available_add-ons'] && packageInfo['available_add-ons'].length > 0) {
                packageInfo['available_add-ons'].forEach(addOn => {
                    const label = addOnsCheckboxes.append("label").attr("class", "flex items-center cursor-pointer py-1");
                    label.append("input")
                        .attr("type", "checkbox")
                        .attr("value", addOn)
                        .attr("class", "form-checkbox h-5 w-5 text-orange-600 transition rounded mr-3 focus:ring-orange-500")
                        .on("change", () => updateGraph(true));
                    label.append("span").attr("class", "text-gray-700").text(addOn);
                });
                addOnsContainer.classed('hidden', false);
            }
            
            const selectedAddOns = d3.selectAll("#add-ons-checkboxes input:checked")
                .nodes()
                .map(el => el.value);
            selectedAddOns.forEach(addOn => packageTools.add(addOn));

            // Populate and show services
            if (packageInfo['available_services'] && packageInfo['available_services'].length > 0) {
                packageInfo['available_services'].forEach(service => {
                    servicesList.append("div")
                        .attr("class", "flex items-center text-gray-700")
                        .html(`<i class="fas fa-check-circle text-green-500 mr-2"></i> ${service}`);
                });
                servicesContainer.classed('hidden', false);
            }
        }
    }

    return {
        categories: activeCategories,
        persona: d3.select("#persona-filter").property('value'),
        audience: audience,
        packageTools: packageTools,
        connectionTypes: activeConnectionTypes
    };
}

/**
 * Resets all filters and the camera view.
 */
function resetView() {
    stopTour(); // From app-tours.js
    
    // Reset filters
    d3.select("#region-filter").property('value', 'all');
    d3.select("#audience-filter").property('value', 'all').property("disabled", true).html('<option value="all">All Audiences</option><option value="GC">General Contractor</option><option value="SC">Specialty Contractor</option><option value="O">Owner</option>');
    d3.select("#persona-filter").property('value', 'all');
    d3.select("#package-filter").property('value', 'all').property('disabled', true).html('<option value="all">All Packages</option>');
    d3.selectAll("#category-filters input").property("checked", true);
    d3.selectAll(".legend-checkbox").property("checked", true);
    allCategoriesChecked = true;

    // Clear package extras
    d3.select("#add-ons-container").classed('hidden', true);
    d3.select("#package-services-container").classed('hidden', true);

    updateGraph(false);
    resetZoom(); // From app-d3-helpers.js
}

/**
 * Handles user input in the search bar.
 */
function handleSearchInput() {
    const searchInput = this.value.toLowerCase().trim();
    const searchResults = d3.select("#search-results");

    if (searchInput.length < 2) {
        searchResults.html("").style("opacity", 0).style("transform", "scale(0.95)");
        return;
    }

    const results = nodesData.filter(d => d.id.toLowerCase().includes(searchInput));
    searchResults.html(""); // Clear old results

    if (results.length === 0) {
        searchResults.append("div").attr("class", "search-item text-sm text-gray-500").text("No results found.");
    } else {
        results.forEach(d => {
            searchResults.append("div")
                .attr("class", "search-item text-sm flex items-center")
                .html(`<span class="legend-color" style="background-color:${app.categories[d.group].color};"></span>${d.id}`)
                .on("click", () => selectNodeFromSearch(d));
        });
    }
    
    searchResults.style("opacity", 1).style("transform", "scale(1)");
}

/**
 * Selects a node from the search results.
 * @param {Object} d - The node data object.
 */
function selectNodeFromSearch(d) {
    if (app.interactionState === 'tour') stopTour();
    
    const isVisible = app.simulation.nodes().some(n => n.id === d.id);
    
    if (!isVisible) {
        showToast(`"${d.id}" is hidden by filters. Resetting view.`, 3000);
        resetView();
    }
    
    setTimeout(() => {
        const nodeData = app.simulation.nodes().find(n => n.id === d.id);
        if (nodeData) {
            nodeClicked(new Event('click'), nodeData); // from app-d3-helpers.js
        }
    }, isVisible ? 0 : 600); 

    d3.select("#search-input").property("value", "");
    d3.select("#search-results").html("").style("opacity", 0).style("transform", "scale(0.95)");
}
