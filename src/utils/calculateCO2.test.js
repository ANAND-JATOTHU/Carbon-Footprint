/**
 * calculateCO2.test.js — Comprehensive unit tests for the CO₂ calculation engine.
 *
 * Tests emission factor lookups, edge cases, and mathematical correctness.
 */
import { describe, it, expect } from 'vitest'
import {
  calculateCO2,
  DIET_OPTIONS,
  TRANSPORT_OPTIONS,
  HOME_OPTIONS,
  GLOBAL_AVG_CO2,
} from './calculateCO2'

describe('calculateCO2', () => {
  it('calculates correct CO₂ for lowest emission lifestyle', () => {
    expect(calculateCO2('vegan', 'public_bike', 'apartment')).toBe(3.5)
  })

  it('calculates correct CO₂ for highest emission lifestyle', () => {
    expect(calculateCO2('high_meat', 'suv', 'large_house')).toBe(10.7)
  })

  it('calculates correct CO₂ for median lifestyle', () => {
    expect(calculateCO2('mixed', 'standard_car', 'small_house')).toBe(7.7)
  })

  it('uses default values for unknown diet', () => {
    const result = calculateCO2('unknown', 'public_bike', 'apartment')
    expect(result).toBe(4.5) // 2.5 (default) + 0.5 + 1.5
  })

  it('uses default values for all unknown options', () => {
    const result = calculateCO2('x', 'y', 'z')
    expect(result).toBe(7.7) // 2.5 + 2.4 + 2.8
  })

  it('returns a number', () => {
    expect(typeof calculateCO2('vegan', 'ev', 'apartment')).toBe('number')
  })

  it('returns a positive value for all valid combinations', () => {
    DIET_OPTIONS.forEach(d => {
      TRANSPORT_OPTIONS.forEach(t => {
        HOME_OPTIONS.forEach(h => {
          const result = calculateCO2(d.id, t.id, h.id)
          expect(result).toBeGreaterThan(0)
        })
      })
    })
  })

  it('rounds to 2 decimal places', () => {
    const result = calculateCO2('vegetarian', 'ev', 'apartment')
    const decimals = result.toString().split('.')[1]
    expect(!decimals || decimals.length <= 2).toBe(true)
  })
})

describe('DIET_OPTIONS', () => {
  it('has 4 diet options', () => {
    expect(DIET_OPTIONS).toHaveLength(4)
  })

  it('each option has required fields', () => {
    DIET_OPTIONS.forEach(opt => {
      expect(opt).toHaveProperty('id')
      expect(opt).toHaveProperty('label')
      expect(opt).toHaveProperty('desc')
      expect(opt).toHaveProperty('factor')
    })
  })

  it('factors increase from vegan to high_meat', () => {
    const factors = DIET_OPTIONS.map(o => o.factor)
    for (let i = 1; i < factors.length; i++) {
      expect(factors[i]).toBeGreaterThanOrEqual(factors[i - 1])
    }
  })

  it('all IDs are unique', () => {
    const ids = DIET_OPTIONS.map(o => o.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('TRANSPORT_OPTIONS', () => {
  it('has 4 transport options', () => {
    expect(TRANSPORT_OPTIONS).toHaveLength(4)
  })

  it('each option has required fields', () => {
    TRANSPORT_OPTIONS.forEach(opt => {
      expect(opt).toHaveProperty('id')
      expect(opt).toHaveProperty('label')
      expect(opt).toHaveProperty('factor')
    })
  })

  it('factors increase from public_bike to suv', () => {
    const factors = TRANSPORT_OPTIONS.map(o => o.factor)
    for (let i = 1; i < factors.length; i++) {
      expect(factors[i]).toBeGreaterThanOrEqual(factors[i - 1])
    }
  })
})

describe('HOME_OPTIONS', () => {
  it('has 3 home options', () => {
    expect(HOME_OPTIONS).toHaveLength(3)
  })

  it('factors increase from apartment to large_house', () => {
    const factors = HOME_OPTIONS.map(o => o.factor)
    for (let i = 1; i < factors.length; i++) {
      expect(factors[i]).toBeGreaterThanOrEqual(factors[i - 1])
    }
  })
})

describe('GLOBAL_AVG_CO2', () => {
  it('is a positive number', () => {
    expect(GLOBAL_AVG_CO2).toBeGreaterThan(0)
  })

  it('equals 7.0 metric tons', () => {
    expect(GLOBAL_AVG_CO2).toBe(7.0)
  })
})
