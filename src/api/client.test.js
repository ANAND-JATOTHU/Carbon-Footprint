/**
 * client.test.js — Unit tests for the API client module.
 *
 * Tests the api object structure and method signatures.
 */
import { describe, it, expect } from 'vitest'
import { api } from './client'

describe('API Client', () => {
  it('exports an api object', () => {
    expect(api).toBeDefined()
    expect(typeof api).toBe('object')
  })

  it('has auth namespace with sync and me methods', () => {
    expect(api.auth).toBeDefined()
    expect(typeof api.auth.sync).toBe('function')
    expect(typeof api.auth.me).toBe('function')
  })

  it('has carbon namespace with submit, actions, and logAction methods', () => {
    expect(api.carbon).toBeDefined()
    expect(typeof api.carbon.submit).toBe('function')
    expect(typeof api.carbon.actions).toBe('function')
    expect(typeof api.carbon.logAction).toBe('function')
  })

  it('has tasks namespace with get, create, and delete methods', () => {
    expect(api.tasks).toBeDefined()
    expect(typeof api.tasks.get).toBe('function')
    expect(typeof api.tasks.create).toBe('function')
    expect(typeof api.tasks.delete).toBe('function')
  })

  it('has leaderboard namespace with get method', () => {
    expect(api.leaderboard).toBeDefined()
    expect(typeof api.leaderboard.get).toBe('function')
  })
})
