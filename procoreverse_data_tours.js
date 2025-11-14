// --- procoreverse_data_tours.js ---
// Defines all platform and package-specific workflow tours.
// Data sourced from https://gist.githubusercontent.com/tequoya-blueprint/a16f0d5397861e035ed4f4b7/raw/a3564814cebc36b772067a0cbd543e794b374ee7/gistfile2.txt

const toursData = {
  "rfi_to_change_order": {
    "tour_key": "rfi_to_change_order",
    "name": "RFI to Change Order",
    "applicable_packages": "(Manually assign based on tools)",
    "steps": [
      {
        "nodeId": "Drawings",
        "info": "A discrepancy is found on a drawing."
      },
      {
        "nodeId": "RFIs",
        "info": "An RFI is created and sent for clarification."
      },
      {
        "nodeId": "Change Events",
        "info": "The RFI response triggers a new Change Event."
      },
      {
        "nodeId": "Commitments",
        "info": "Quotes (CCOs) are requested from relevant subcontractors via the Change Event."
      },
      {
        "nodeId": "Change Orders",
        "info": "A formal Prime Change Order (PCO) is generated and sent to the Owner for approval."
      },
      {
        "nodeId": "Budget",
        "info": "Once approved, the Change Order automatically updates the project Budget in real-time."
      }
    ]
  },
  "sub_invoicing": {
    "tour_key": "sub_invoicing",
    "name": "Subcontractor Invoice Approval",
    "applicable_packages": "(Manually assign based on tools)",
    "steps": [
      {
        "nodeId": "Commitments",
        "info": "A subcontractor is invited to bill against their Commitment (Subcontract)."
      },
      {
        "nodeId": "Invoicing",
        "info": "The subcontractor submits their invoice (pay application) in the Invoicing tool."
      },
      {
        "nodeId": "Procore Pay",
        "info": "Once approved, the invoice can be queued for payment disbursement using Procore Pay."
      },
      {
        "nodeId": "ERP Systems",
        "info": "The approved invoice and payment status are synced to the external ERP/Accounting system."
      }
    ]
  },
  "precon_to_budget": {
    "tour_key": "precon_to_budget",
    "name": "Estimating to Budget",
    "applicable_packages": "(Manually assign based on tools)",
    "steps": [
      {
        "nodeId": "Drawings",
        "info": "The preconstruction team uploads the latest drawings."
      },
      {
        "nodeId": "Estimating",
        "info": "Digital takeoff is performed on the drawings to create a detailed cost estimate."
      },
      {
        "nodeId": "Bidding",
        "info": "The estimate is used to create bid packages, which are sent to subcontractors."
      },
      {
        "nodeId": "Estimating",
        "info": "Final numbers from awarded Bids are sent back to Estimating"
      },
      {
        "nodeId": "Budget",
        "info": "The finalized estimate is pushed to create the initial project Budget, now populated with committed costs."
      }
    ]
  },
  "submittal_review": {
    "tour_key": "submittal_review",
    "name": "Submittal Review Process",
    "applicable_packages": "(Manually assign based on tools)",
    "steps": [
      {
        "nodeId": "Specifications",
        "info": "The project specifications define the required submittals."
      },
      {
        "nodeId": "Submittals",
        "info": "The GC creates the submittal package from the specs and assigns it to the subcontractor."
      },
      {
        "nodeId": "Drawings",
        "info": "The approved submittal is linked to a location on the Drawings for easy field access."
      }
    ]
  },
  "safety_incident": {
    "tour_key": "safety_incident",
    "name": "Safety Incident Reporting",
    "applicable_packages": "(Manually assign based on tools)",
    "steps": [
      {
        "nodeId": "Daily Log",
        "info": "A safety incident occurs on site and is immediately noted in the Daily Log."
      },
      {
        "nodeId": "Incidents",
        "info": "A detailed Incident report is created, documenting the event and personnel involved."
      },
      {
        "nodeId": "Photos",
        "info": "Photos of the incident scene are attached to the Incident report."
      },
      {
        "nodeId": "Observations",
        "info": "A Safety Observation is created from the Incident to track corrective actions required."
      },
      {
        "nodeId": "Analytics",
        "info": "Incident data is aggregated in Analytics to identify safety trends and risks across projects."
      }
    ]
  },
  "erp_integration": {
    "tour_key": "erp_integration",
    "name": "ERP Integration Sync",
    "applicable_packages": "(Manually assign based on tools)",
    "steps": [
      {
        "nodeId": "Commitments",
        "info": "Commitments (Subcontracts, POs) are created, establishing the committed costs for the project."
      },
      {
        "nodeId": "Invoicing",
        "info": "Subcontractor Invoices are processed against these commitments, creating actual costs."
      },
      {
        "nodeId": "Budget",
        "info": "All costs are tracked in real-time against the project Budget."
      },
      {
        "nodeId": "ERP Systems",
        "info": "Finally, all financial data is synced with the external ERP to keep company records up to date."
      }
    ]
  }
};
