// --- procoreverse_data_links.js ---
// Defines all connections (links) between tools.
// Data sourced from https://gist.githubusercontent.com/tequoya-blueprint/a16f0d5397861e035ed41cebf4a7f4b7/raw/a3564814cebc36b772067a0cbd543e794b374ee7/gistfile1.txt

const linksData = [
  // --- Core Tool Connections (Drawings, Docs, Photos) ---
  { "source": "Documents", "target": "Drawings", "type": "upload", "dataFlow": "Upload drawing PDFs from Documents to create new drawing versions." },
  { "source": "Documents", "target": "Specifications", "type": "upload", "dataFlow": "Upload specification PDFs from Documents to create spec sections." },
  { "source": "Documents", "target": "Photos", "type": "sync", "dataFlow": "Photos are stored in a dedicated 'Photos' album in the Documents tool." },
  { "source": "Documents", "target": "Transmittals", "type": "create", "dataFlow": "Create transmittals to send documents to project members." },
  { "source": "Procore Sync", "target": "Documents", "type": "sync-bi", "dataFlow": "Provides two-way sync between your desktop and the project Documents tool." },
  
  { "source": "Drawings", "target": "RFIs", "type": "create_link_bi", "dataFlow": "Create RFIs from drawing markups; answered RFIs link back to the drawing." },
  { "source": "Drawings", "target": "Observations", "type": "create_link_bi", "dataFlow": "Pin Observations to specific locations on drawings." },
  { "source": "Drawings", "target": "Punch List", "type": "create_link_bi", "dataFlow": "Pin Punch List items to specific locations on drawings." },
  { "source": "Drawings", "target": "Inspections", "type": "link", "dataFlow": "Link Inspections to a drawing to provide visual context." },
  { "source": "Drawings", "target": "Submittals", "type": "link", "dataFlow": "Link approved submittals to drawings for easy field reference." },
  { "source": "Drawings", "target": "Photos", "type": "link", "dataFlow": "Attach photos to drawings or pin drawing locations on photos." },
  { "source": "Drawings", "target": "Schedule", "type": "link", "dataFlow": "Link schedule tasks to drawings to visualize progress and location." },

  { "source": "Photos", "target": "Observations", "type": "create", "dataFlow": "Attach photos when creating Observations." },
  { "source": "Photos", "target": "RFIs", "type": "create", "dataFlow": "Attach photos to RFIs for clarification." },
  { "source": "Photos", "target": "Punch List", "type": "create", "dataFlow": "Attach photos to Punch List items." },
  { "source": "Photos", "target": "Inspections", "type": "create", "dataFlow": "Attach photos to inspection items." },
  { "source": "Photos", "target": "Daily Log", "type": "link", "dataFlow": "Add photos to Daily Log entries." },
  { "source": "Photos", "target": "Incidents", "type": "create", "dataFlow": "Attach photos to Incident reports." },
  
  // --- Project Management Connections ---
  { "source": "Specifications", "target": "Submittals", "type": "create", "dataFlow": "Generate Submittal register items directly from specification sections." },
  { "source": "Submittals", "target": "Workflows", "type": "process", "dataFlow": "Routes submittals through custom, predefined approval workflows." },
  { "source": "Submittals", "target": "My-Tasks", "type": "create", "dataFlow": "Assigns tasks to users who are part of the Submittal workflow." },
  
  { "source": "RFIs", "target": "Workflows", "type": "process", "dataFlow": "Routes RFIs through custom approval and review workflows." },
  { "source": "RFIs", "target": "My-Tasks", "type": "create", "dataFlow": "Assigns tasks to users who are part of the RFI workflow." },
  { "source": "RFIs", "target": "Change Events", "type": "create", "dataFlow": "RFIs with cost or schedule implications can initiate a Change Event." },
  
  { "source": "Meetings", "target": "My-Tasks", "type": "create", "dataFlow": "Assigns tasks (action items) from meeting minutes to attendees." },
  { "source": "Meetings", "target": "RFIs", "type": "link", "dataFlow": "Link existing RFIs to meeting agenda items for discussion." },
  { "source": "Meetings", "target": "Submittals", "type": "link", "dataFlow": "Link existing Submittals to meeting agenda items." },
  
  { "source": "Correspondence", "target": "RFIs", "type": "create_link_bi", "dataFlow": "Create an RFI from a correspondence, or link an RFI to a correspondence thread." },
  { "source": "Correspondence", "target": "Change Events", "type": "create", "dataFlow": "A correspondence can be used to initiate a Change Event."},
  
  { "source": "Scheduling Integration", "target": "Schedule", "type": "sync-bi", "dataFlow": "Syncs schedule data with external tools like P6, MSP, and Asta." },

  // --- Financial Management Connections ---
  { "source": "Estimating", "target": "Drawings", "type": "read", "dataFlow": "Pulls drawings for creating takeoffs." },
  { "source": "Estimating", "target": "BIM", "type": "read", "dataFlow": "Pulls 3D models for 3D estimating and takeoff." },
  { "source": "Estimating", "target": "Budget", "type": "create", "dataFlow": "Generates the initial project budget from the final estimate." },
  { "source": "Estimating", "target": "Change Events", "type": "create", "dataFlow": "Create Change Events directly from an estimate for potential scope changes." },
  { "source": "Estimating", "target": "Prime Contract", "type": "create", "dataFlow": "Generates the Prime Contract Schedule of Values from the final estimate." },
  { "source": "Estimating", "target": "Commitments", "type": "create", "dataFlow": "Can create Purchase Orders or Subcontracts based on material/vendor estimates." },

  { "source": "Bid Management", "target": "Prequalification", "type": "read", "dataFlow": "Pulls qualified vendors from Prequalification to invite to bid." },
  { "source": "Bid Management", "target": "Directory", "type": "sync-bi", "dataFlow": "Pulls bidders from and adds new bidders to the Directory." },
  { "source": "Bid Management", "target": "Estimating", "type": "read", "dataFlow": "Uses the estimate to create bid packages." },
  { "source": "Bid Management", "target": "Commitments", "type": "create", "dataFlow": "Awarded bids are converted into Subcontracts or Purchase Orders." },

  { "source": "Change Events", "target": "Budget", "type": "sync-update", "dataFlow": "Potential costs from Change Events are reflected in budget forecasts." },
  { "source": "Change Events", "target": "Change Orders", "type": "create", "dataFlow": "Aggregates Change Events to generate formal Change Orders (PCOs, CCOs)." },
  { "source": "Change Events", "target": "RFIs", "type": "link", "dataFlow": "Link RFIs that originated the change event." },

  { "source": "T&M Tickets", "target": "Change Events", "type": "create", "dataFlow": "T&M Tickets for out-of-scope work generate a Change Event to track costs." },
  
  { "source": "Change Orders", "target": "Budget", "type": "sync-update", "dataFlow": "Approved Change Orders officially adjust budget line items." },
  { "source": "Change Orders", "target": "Prime Contract", "type": "sync-update", "dataFlow": "Approved Prime Change Orders (OCOs) update the Prime Contract value." },
  { "source": "Change Orders", "target": "Commitments", "type": "sync-update", "dataFlow": "Approved Commitment Change Orders (CCOs) update Subcontract/PO values." },

  { "source": "Commitments", "target": "Budget", "type": "sync-update", "dataFlow": "Tracks committed costs against the budget." },
  { "source": "Commitments", "target": "Invoicing", "type": "sync-bi", "dataFlow": "Subcontractor invoices are billed against Commitment Schedules of Value (SOVs)." },
  
  { "source": "Prime Contract", "target": "Invoicing", "type": "sync-bi", "dataFlow": "Owner invoices (Payment Applications) are billed against the Prime Contract SOV." },
  
  { "source": "Invoicing", "target": "Workflows", "type": "process", "dataFlow": "Routes subcontractor invoices through custom approval workflows." },
  { "source": "Invoicing", "target": "Procore Pay", "type": "process", "dataFlow": "Approved invoices are sent to Procore Pay for automated payment." },
  
  { "source": "Direct Costs", "target": "Budget", "type": "sync-update", "dataFlow": "Tracks actual costs not tied to a commitment against the budget." },
  
  { "source": "ERP Integrations", "target": "Budget", "type": "sync-bi", "dataFlow": "Syncs budget data with the company's main financial records." },
  { "source": "ERP Integrations", "target": "Commitments", "type": "sync-bi", "dataFlow": "Syncs subcontracts and POs with the ERP." },
  { "source": "ERP Integrations", "target": "Invoicing", "type": "sync-bi", "dataFlow": "Syncs owner and subcontractor invoices with the ERP." },
  { "source": "ERP Integrations", "target": "Direct Costs", "type": "sync-bi", "dataFlow": "Syncs direct cost data with the ERP." },
  { "source": "ERP Integrations", "target": "Timesheets", "type": "sync-bi", "dataFlow": "Syncs labor costs for payroll processing." },

  // --- Quality & Safety Connections ---
  { "source": "Inspections", "target": "Observations", "type": "create", "dataFlow": "Failed inspection items can automatically generate Observations for tracking." },
  { "source": "Inspections", "target": "My-Tasks", "type": "create", "dataFlow": "Assigns tasks to users for failed inspection points." },
  { "source": "Inspections", "target": "Punch List", "type": "create", "dataFlow": "Failed inspection items can be used to create new Punch List items." },
  { "source": "Inspections", "target": "Daily Log", "type": "link", "dataFlow": "Log completed inspections in the Daily Log." },
  
  { "source": "Observations", "target": "My-Tasks", "type": "create", "dataFlow": "Assigns tasks to users to resolve observations." },
  { "source": "Observations", "target": "RFIs", "type": "create", "dataFlow": "An observation can be escalated to an RFI if clarification is needed." },
  
  { "source": "Punch List", "target": "My-Tasks", "type": "create", "dataFlow": "Assigns tasks to users to complete punch list items." },
  
  { "source": "Incidents", "target": "Daily Log", "type": "create_link_bi", "dataFlow": "Create Incidents from the Daily Log, or link existing Incidents." },
  { "source": "Incidents", "target": "Observations", "type": "create", "dataFlow": "Incidents can generate follow-up Observations for corrective actions." },
  
  { "source": "Action Plans", "target": "Inspections", "type": "create", "dataFlow": "Action Plans can create new Inspections as part of a required process." },
  { "source": "Action Plans", "target": "My-Tasks", "type": "create", "dataFlow": "Assigns tasks for each step of an action plan." },
  { "source": "Action Plans", "target": "Documents", "type": "link", "dataFlow": "Reference documents as part of an action plan." },

  // --- Workforce Management Connections ---
  { "source": "Crews", "target": "Timesheets", "type": "read", "dataFlow": "Populates Timesheets with crew members for easy group time entry." },
  { "source": "MyTime", "target": "Timesheets", "type": "sync-bi", "dataFlow": "Individual time entries sync to centralized project timesheets." },
  
  { "source": "Timesheets", "target": "Daily Log", "type": "sync-bi", "dataFlow": "Syncs labor hours with Daily Log's manpower entries." },
  { "source": "Timesheets", "target": "Direct Costs", "type": "create", "dataFlow": "Creates Direct Cost entries for labor expenses." },
  { "source": "Timesheets", "target": "Budget", "type": "sync-update", "dataFlow": "Labor costs from Timesheets update the project budget's actuals." },
  { "source": "Timesheets", "target": "T&M Tickets", "type": "read", "dataFlow": "Populates labor hours for out-of-scope work tracking on T&M Tickets." },
  { "source": "Timesheets", "target": "Field Productivity", "type": "read", "dataFlow": "Provides actual hours and quantities installed for productivity analysis." },

  { "source": "Workforce Planning", "target": "Directory", "type": "read", "dataFlow": "Utilizes Directory contacts for workforce and equipment allocation." },
  { "source": "Workforce Planning", "target": "Equipment", "type": "read", "dataFlow": "Provides list of available equipment for scheduling." },
  { "source": "Workforce Planning", "target": "Timesheets", "type": "create", "dataFlow": "Pushes planned schedules to Timesheets as a starting point for time entry." },
  
  { "source": "Equipment", "target": "Daily Log", "type": "link", "dataFlow": "Populates equipment usage in daily logs." },
  { "source": "T&M Tickets", "target": "Equipment", "type": "read", "dataFlow": "Select equipment to track usage and costs on T&M Tickets." },
  
  { "source": "Budget", "target": "Field Productivity", "type": "read", "dataFlow": "Provides budgeted hours and quantities for comparison against actuals." },

  // --- Preconstruction (BIM) Connections ---
  { "source": "BIM", "target": "Coordination Issues", "type": "create_link_bi", "dataFlow": "Identifies, tracks, and manages clashes and other model issues." },
  { "source": "BIM", "target": "Drawings", "type": "sync-bi", "dataFlow": "Overlay 2D drawings on 3D models for comparison." },
  { "source": "BIM", "target": "Observations", "type": "create", "dataFlow": "Create observations from within the 3D model environment." },
  { "source": "BIM", "target": "RFIs", "type": "create", "dataFlow": "Generate RFIs directly from the model." },
  
  { "source": "Coordination Issues", "target": "RFIs", "type": "create", "dataFlow": "Elevates complex model issues to RFIs for formal clarification." },
  { "source": "Coordination Issues", "target": "My-Tasks", "type": "create", "dataFlow": "Assigns tasks to users to resolve coordination issues." },
  
  // --- Construction Intelligence Connections ---
  { "source": "Portfolio", "target": "Home", "type": "read", "dataFlow": "Provides a high-level view of all projects." },
  { "source": "Reporting", "target": "Analytics", "type": "read", "dataFlow": "Data from Analytics can be used to build advanced, custom reports." },
  // Dynamically generated "read" links from most tools to Analytics
  ...["RFIs", "Submittals", "Daily Log", "Incidents", "Observations", "Inspections", "Punch List", "Budget", "Change Orders", "Timesheets", "Field Productivity", "Commitments", "Direct Costs", "Drawings", "Meetings", "Forms", "Photos"]
    .map(source => ({ "source": source, "target": "Analytics", "type": "read", "dataFlow": `Pushes ${source.toLowerCase()} data for cross-tool analysis and insights.` })),
  
  // --- Other Connections ---
  { "source": "Admin", "target": "Workflows", "type": "create", "dataFlow": "Company Admins create and manage workflow templates." },
  { "source": "Admin", "target": "Directory", "type": "create", "dataFlow": "Admins manage company and user permissions in the Directory." },
  { "source": "Admin", "target": "Forms", "type": "create", "dataFlow": "Admins create and publish company-level form templates." },
  { "source": "Admin", "target": "Inspections", "type": "create", "dataFlow": "Admins create and publish company-level inspection templates." },
  
  { "source": "App Marketplace", "target": "ERP Integrations", "type": "link", "dataFlow": "Many ERP integrations are managed as applications via the Marketplace." },
];

/**
 * Defines the connection types for the legend.
 * The 'id' must match the 'type' in linksData.
 */
const connectionTypes = [
  {
    "id": "read",
    "label": "Reads Data",
    "svg": "<svg width='24' height='10'><line x1='0' y1='5' x2='24' y2='5' stroke='#a0a0a0' stroke-width='2'></line></svg>",
    "description": "One tool reads information from another."
  },
  {
    "id": "create",
    "label": "Creates Item",
    "svg": "<svg width='24' height='10'><line x1='0' y1='5' x2='24' y2='5' stroke='#a0a0a0' stroke-width='2' stroke-dasharray='4,3'></line></svg>",
    "description": "One tool can create a new item in another tool."
  },
  {
    "id": "link",
    "label": "Links Item",
    "svg": "<svg width='24' height='10'><path d='M0,5 L18,5' stroke='#a0a0a0' stroke-width='2' fill='none'></path><path d='M15,2 L21,5 L15,8' stroke='#a0a0a0' stroke-width='2' fill='none'></path></svg>",
    "description": "One tool can link to an existing item in another."
  },
  {
    "id": "upload",
    "label": "Uploads To",
    "svg": "<svg width='24' height='10'><path d='M0,5 L18,5' stroke='#a0a0a0' stroke-width='2' fill='none' stroke-dasharray='4,3'></path><path d='M15,2 L21,5 L15,8' stroke='#a0a0a0' stroke-width='2' fill='none'></path></svg>",
    "description": "Data is uploaded to create an item (e.g., PDF to Drawing)."
  },
  {
    "id": "create_link_bi",
    "label": "Create / Link (2-Way)",
    "svg": "<svg width='24' height='10'><path d='M3,2 L9,5 L3,8' stroke='#a0a0a0' stroke-width='2' fill='none'></path><path d='M21,2 L15,5 L21,8' stroke='#a0a0a0' stroke-width='2' fill='none'></path></svg>",
    "description": "Items can be created or linked from either tool."
  },
  {
    "id": "sync-bi",
    "label": "Sync (2-Way)",
    "svg": "<svg width='24' height='10'><path d='M3,2 L9,5 L3,8' stroke='#a0a0a0' stroke-width='2.5' fill='none'></path><line x1='6' y1='5' x2='18' y2='5' stroke='#a0a0a0' stroke-width='2.5'></line><path d='M21,2 L15,5 L21,8' stroke='#a0a0a0' stroke-width='2.5' fill='none'></path></svg>",
    "description": "Data is actively synced between two tools."
  },
  {
    "id": "process",
    "label": "Process/Workflow",
    "svg": "<svg width='24' height='10'><path d='M0,5 L18,5' stroke='var(--procore-orange)' stroke-width='2.5' fill='none'></path><path d='M15,2 L21,5 L15,8' stroke='var(--procore-orange)' stroke-width='2.5' fill='none'></path></svg>",
    "description": "Sends an item to another tool for a business process (e.g., approval)."
  },
  {
    "id": "sync-update",
    "label": "Syncs & Updates",
    "svg": "<svg width='24' height='10'><path d='M0,5 L18,5' stroke='#4f46e5' stroke-width='2.5' fill='none'></path><path d='M15,2 L21,5 L15,8' stroke='#4f46e5' stroke-width='2.5' fill='none'></path></svg>",
    "description": "Data from one tool pushes updates to another (e.g., costs to Budget)."
  }
];
