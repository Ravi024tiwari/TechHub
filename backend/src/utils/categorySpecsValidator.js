/**
 * Category-Driven Specifications Validation Matrix
 * Defines mandatory technical specs for each electronics category
 */
export const CATEGORY_SPECS_RULES = {
  smartphone: [
    { field: "processor", label: "Processor / Chipset" },
    { field: "ram", label: "RAM (e.g. 8GB, 12GB)" },
    { field: "storage", label: "Internal Storage (e.g. 128GB, 256GB)" },
    { field: "rearCamera", label: "Rear Camera Setup (e.g. 50MP + 12MP)" },
    { field: "batteryCapacity", label: "Battery Capacity (e.g. 5000 mAh)" },
    { field: "displayType", label: "Display Type (e.g. AMOLED, OLED)" }
  ],
  laptop: [
    { field: "processor", label: "CPU / Processor" },
    { field: "gpu", label: "Dedicated / Integrated GPU" },
    { field: "ram", label: "RAM Size & Type" },
    { field: "storage", label: "SSD Capacity" },
    { field: "screenSize", label: "Screen Size & Resolution" }
  ],
  audio: [
    { field: "type", label: "Audio Type (TWS Earbuds, Over-Ear, Neckband)" },
    { field: "driverSizeMm", label: "Driver Size" },
    { field: "batteryPlaytimeHours", label: "Battery Playback Time" }
  ],
  charger: [
    { field: "wattage", label: "Output Wattage (e.g. 65W GaN)" },
    { field: "outputPorts", label: "Output Ports (e.g. Dual Type-C + USB-A)" },
    { field: "fastChargingProtocols", label: "Supported Protocols (PD, QC, PPS)" }
  ],
  peripheral: [
    { field: "connectivityType", label: "Connectivity (Wireless, Bluetooth, Wired)" }
  ],
  wearable: [
    { field: "displayType", label: "Display Type" },
    { field: "batteryLifeDays", label: "Battery Life" }
  ]
};

/**
 * Validate incoming specifications object against the selected category
 * @param {string} category - e.g. 'smartphone', 'laptop'
 * @param {object} specifications - Dynamic key-value map of specs
 * @returns {{ isValid: boolean, missingFields: string[] }}
 */
export const validateCategorySpecs = (category, specifications = {}) => {
  const rules = CATEGORY_SPECS_RULES[category?.toLowerCase()];
  if (!rules) {
    return { isValid: true, missingFields: [] };
  }

  const missingFields = [];

  for (const rule of rules) {
    const value = specifications[rule.field];
    if (value === undefined || value === null || value === "") {
      missingFields.push(`${rule.label} (${rule.field})`);
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};
