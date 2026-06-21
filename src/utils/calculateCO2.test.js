import { describe, it, expect } from 'vitest'
import { calculateCO2, DIET_OPTIONS, TRANSPORT_OPTIONS, HOME_OPTIONS } from './calculateCO2'

describe('calculateCO2', () => {
  it('should calculate the correct CO2 for median options', () => {
    // Median options
    const diet = 'mixed' // 2.5
    const transport = 'standard_car' // 2.4
    const home = 'small_house' // 2.8
    
    const result = calculateCO2(diet, transport, home)
    expect(result).toBe(7.7) // 2.5 + 2.4 + 2.8 = 7.7
  })

  it('should calculate the correct CO2 for lowest options', () => {
    // Lowest options
    const diet = 'vegan' // 1.5
    const transport = 'public_bike' // 0.5
    const home = 'apartment' // 1.5
    
    const result = calculateCO2(diet, transport, home)
    expect(result).toBe(3.5)
  })

  it('should use default values for unknown options', () => {
    const result = calculateCO2('unknown_diet', 'unknown_transport', 'unknown_home')
    expect(result).toBe(7.7) // uses median fallback
  })
})
