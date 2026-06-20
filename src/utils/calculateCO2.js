/**
 * calculateCO2.js — Client-side CO₂ heuristic engine.
 * IPCC-derived emission factors (metric tons CO₂e / year).
 * Used for instant preview before submitting to backend.
 */

export const DIET_OPTIONS = [
  { id: "vegan",       label: "Vegan",        desc: "Plant-based only",           factor: 1.5 },
  { id: "vegetarian",  label: "Vegetarian",   desc: "No meat, includes dairy/eggs", factor: 1.7 },
  { id: "mixed",       label: "Mixed Diet",   desc: "Moderate meat consumption",   factor: 2.5 },
  { id: "high_meat",   label: "High Meat",    desc: "Meat at most meals",          factor: 3.3 },
]

export const TRANSPORT_OPTIONS = [
  { id: "public_bike", label: "Public / Bike", desc: "Bus, train, cycling",        factor: 0.5 },
  { id: "ev",          label: "Electric Car",  desc: "Battery electric vehicle",   factor: 1.2 },
  { id: "standard_car",label: "Petrol / Diesel",desc: "Standard combustion car",   factor: 2.4 },
  { id: "suv",         label: "SUV / Truck",   desc: "Large or heavy vehicle",     factor: 3.2 },
]

export const HOME_OPTIONS = [
  { id: "apartment",   label: "Apartment",    desc: "Shared building, ≤100m²",   factor: 1.5 },
  { id: "small_house", label: "Small House",  desc: "Detached house, ≤150m²",    factor: 2.8 },
  { id: "large_house", label: "Large House",  desc: "Large home, >150m²",         factor: 4.2 },
]

/**
 * Returns total annual CO₂ in metric tons (MTCO₂e).
 * @param {string} diet
 * @param {string} transport
 * @param {string} home
 * @returns {number}
 */
export function calculateCO2(diet, transport, home) {
  const d = DIET_OPTIONS.find(o => o.id === diet)?.factor ?? 2.5
  const t = TRANSPORT_OPTIONS.find(o => o.id === transport)?.factor ?? 2.4
  const h = HOME_OPTIONS.find(o => o.id === home)?.factor ?? 2.8
  return parseFloat((d + t + h).toFixed(2))
}

/** Global average for comparison context */
export const GLOBAL_AVG_CO2 = 7.0
