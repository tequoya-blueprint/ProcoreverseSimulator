// --- app-controls.js ---
// VERSION 10: Restores missing Data Maps to fix the ReferenceError crash.

// --- DATA MAPPING CONSTANTS ---
// These maps translate between the UI (Dropdowns) and your Data File.

// 1. Maps Data Values (e.g. "Owners") -> UI Keys (e.g. "O")
const audienceDataToKeyMap = {
    "Contractor": "GC",
    "General Contractor": "GC",
    "GC": "GC",
    "SC": "SC",
    "Specialty Contractor": "SC",
    "Owners": "O",
    "Owner": "O",
    "Owner Developer *Coming Soon": "O"
};

// 2. Maps UI Keys ("O") -> UI Labels ("Owner")
const audienceKeyToLabelMap = {
    "GC": "General Contractor",
    "SC": "Specialty Contractor",
    "O": "Owner"
};

// 3. Maps UI Keys ("O") -> All possible Data Values used for filtering
const audienceKeyToDataValuesMap = {
    "GC": ["Contractor", "General Contractor", "GC"],
    "SC": ["SC", "Specialty Contractor"],
    "O": ["Owners", "Owner", "Owner Developer *Coming Soon"]
};

/**
 * Initializes all event listeners for the control panel.
 */
function initializeControls() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            toggleAccordion(header.parentElement); // from app-utils.js
        });
    });

    populateRegionFilter();
    populatePersonaFilter();
    
    d3.select("#region-filter").on("change", onRegionChange);
    d3.select("#audience-filter").on("change", onAudienceChange);
    d3.select("#package-filter").on("change", onPackageChange);
    d3.select("#persona-filter").on("change", () => updateGraph(true));
    
    populateCategoryFilters(); 
    d3.select("#toggle-categories").on("click", toggleAllCategories);

    d3.select("#search-input").on("input", handleSearchInput);
    d3.select("body").on("click", (e) => {
        if (e.target && !document.getElementById('search-container').contains(e.target)) {
            d3.select("#search-results").html("").style("opacity", 0).style("transform", "scale(0.95)");
        }
    });

    d3.select("#reset-view").on("click", resetView);
    d3.select("#help-button").on("click", startOnboarding);
    d3.select("#left-panel-toggle").on("click", toggleLeftPanel);
    d3.select("#left-panel-expander").on("click", toggleLeftPanel);
}

function populateRegionFilter() {
    const regionFilter = d3.select("#region-filter");
    // Use a Set to get unique regions from your data array
    const regions = [...new Set(packagingData.map(pkg => pkg.region))];
    
    regions.sort().forEach(region => {
        let label = region; 
        if (region === "NAMER") label = "NAM";
        if (region === "EUR") label = "EMEA";
        regionFilter.append("option").attr("value", region).text(label);
    });
}

function onRegionChange() {
    const region = d3.select(this).property("value");
    const audienceFilter = d3.select("#audience-filter");
    
    audienceFilter.property("value", "all").property("disabled", region === "all");
    d3.select("#package-filter").property("value", "all").property("disabled", true);
    
    audienceFilter.html('<option value="all">All Audiences</option>'); 

    if (region !== "all") {
        const availableAudiences = new Set();
        
        // Filter data by region, then map the raw audience string to our UI Key (GC/SC/O)
        packagingData.filter(pkg => pkg.region === region).forEach(pkg => {
            const audKey = audienceDataToKeyMap[pkg.audience];
            if (audKey) availableAudiences.add(audKey);
        });

        // Build the dropdown using the clean UI Keys and Labels
        [...availableAudiences].sort().forEach(audKey => {
             audienceFilter.append("option")
                .attr("value", audKey)
                .text(audienceKeyToLabelMap[audKey]);
        });
    }
    updateGraph(true);
}

function onAudienceChange() {
    const region = d3.select("#region-filter").property("value");
    const audience = d3.select(this).property("value");
    const packageFilter = d3.select("#package-filter");

    packageFilter.html('<option value="all">All Packages</option>');
    packageFilter.property("disabled", true);
    
    // Get the list of data values (e.g. "Owners") that match this selection (e.g. "O")
    const audienceDataKeys = audienceKeyToDataValuesMap[audience] || [];

    if (region !== 'all' && audience !== 'all') {
        const packages = packagingData.filter(pkg => 
            pkg.region === region && audienceDataKeys.includes(pkg.audience)
        );
        
        if (packages.length > 0) {
            packages.sort((a, b) => a.package_name.localeCompare(b.package_name))
                .forEach(pkg => {
                packageFilter.append("option")
                    .attr("value", pkg.package_name)
                    .text(pkg.package_name);
            });
            packageFilter.property("disabled", false);
        }
    }
    updateGraph(true);
}

function onPackageChange() {
    updateGraph(true);
}

function getActiveFilters() {
    const region = d3.select("#region-filter").property('value');
    const audience = d3.select("#audience-filter").property('value');
    const pkgName = d3.select("#package-filter").property('value');
    
    const activeCategories = new Set(d3.selectAll("#category-filters input:checked").nodes().map(el => el.value));
    const activeConnectionTypes = new Set(d3.selectAll(".legend-checkbox:checked").nodes().map(el => el.value));
    
    let packageTools = null;
    const addOnsContainer = d3.select("#add-ons-container");
    const addOnsCheckboxes = d3.select("#add-ons-checkboxes");
    const servicesContainer = d3.select("#package-services-container");
    const servicesList = d3.select("#package-services-list");

    addOnsCheckboxes.html("");
    servicesList.html("");
    addOnsContainer.classed('hidden', true);
    servicesContainer.classed('hidden', true);

    // ONLY filter by package if a specific package is selected
    if (region !== 'all' && audience !== 'all' && pkgName !== 'all') {
        
        const audienceDataKeys = audienceKeyToDataValuesMap[audience] || [];

        const packageInfo = packagingData.find(pkg => 
            pkg.region === region && 
            audienceDataKeys.includes(pkg.audience) && 
            pkg.package_name === pkgName
        );
        
        if (packageInfo) {
            packageTools = new Set(packageInfo.tools);
            
            // Add-Ons
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
            
            const selectedAddOns = d3.selectAll("#add-ons-checkboxes input:checked").nodes().map(el => el.value);
            selectedAddOns.forEach(addOn => packageTools.add(addOn));

            // Services
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
        // IMPORTANT: packageTools is NULL if no package selected (showing all nodes)
        packageTools: packageTools, 
        connectionTypes: activeConnectionTypes
    };
}

function populatePersonaFilter() {
    const personaFilter = d3.select("#persona-filter");
    personaFilter.html('<option value="all">All Personas</option>'); 
    const allPersonas = new Set();
    nodesData.forEach(node => {
        if (node.personas) {
            node.personas.forEach(p => allPersonas.add(p));
        }
    });

    [...allPersonas].sort().forEach(p => {
        const personaMap = {
            "pm": "Project Manager (GC)", "super": "Superintendent (GC)", "fm": "Financial Manager (GC)",
            "sub": "Specialty Contractor", "design": "Design Team", "owner": "Owner", "admin": "Admin", "estimator": "Estimator"
        };
        personaFilter.append("option").attr("value", p).text(personaMap[p] || p);
    });
}

function populateCategoryFilters() {
    const filtersContainer = d3.select("#category-filters");
    filtersContainer.html(""); 
    Object.keys(app.categories).sort().forEach(cat => {
        const label = filtersContainer.append("label").attr("class", "flex items-center cursor-pointer py-1");
        label.append("input").attr("type", "checkbox").attr("checked", true).attr("value", cat)
            .attr("class", "form-checkbox h-5 w-5 text-orange-600 transition rounded mr-3 focus:ring-orange-500")
            .on("change", () => updateGraph(true));
        label.append("span").attr("class", "legend-color").style("background-color", app.categories[cat].color);
        label.append("span").attr("class", "text-gray-700").text(cat);
    });
}

let allCategoriesChecked = true;
function toggleAllCategories() {
    allCategoriesChecked = !allCategoriesChecked;
    d3.selectAll("#category-filters input").property("checked", allCategoriesChecked);
    updateGraph(true);
}

function resetView() {
    stopTour(); 
    
    d3.select("#region-filter").property('value', 'all');
    d3.select("#audience-filter").property('value', 'all').property("disabled", true).html('<option value="all">All Audiences</option>');
    d3.select("#persona-filter").property('value', 'all');
    d3.select("#package-filter").property('value', 'all').property('disabled', true).html('<option value="all">All Packages</option>');
    d3.selectAll("#category-filters input").property("checked", true);
    d3.selectAll(".legend-checkbox").property("checked", true);
    allCategoriesChecked = true;

    d3.select("#add-ons-container").classed('hidden', true);
    d3.select("#package-services-container").classed('hidden', true);

    // Clear caches
    d3.select("#add-ons-checkboxes").html("");
