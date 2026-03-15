import { describe, it, expect } from 'vitest'
import { L402State } from '../l402.js'

describe('L402State', () => {
  it('starts with no auth header', () => {
    const state = new L402State()
    expect(state.getAuthHeader()).toBeNull()
  })

  it('stores macaroon and preimage', () => {
    const state = new L402State()
    state.store('bWFjMTIz', 'abc456')
    const header = state.getAuthHeader()
    expect(header).toBe('L402 bWFjMTIz:abc456')
  })

  it('clears stored credentials', () => {
    const state = new L402State()
    state.store('bWFjMTIz', 'abc456')
    state.clear()
    expect(state.getAuthHeader()).toBeNull()
  })

  it('rejects macaroon with invalid characters', () => {
    const state = new L402State()
    expect(() => state.store('mac\r\nEvil: header', 'abc123')).toThrow('Invalid macaroon')
  })

  it('rejects preimage with invalid characters', () => {
    const state = new L402State()
    expect(() => state.store('bWFjMTIz', 'not-hex-value!')).toThrow('Invalid preimage')
  })

  it('rejects oversized macaroon', () => {
    const state = new L402State()
    const longMac = 'A'.repeat(4097)
    expect(() => state.store(longMac, 'abc123')).toThrow('Invalid macaroon')
  })

  it('rejects oversized preimage', () => {
    const state = new L402State()
    const longPre = 'a'.repeat(129)
    expect(() => state.store('bWFjMTIz', longPre)).toThrow('Invalid preimage')
  })

  it('rejects empty macaroon', () => {
    const state = new L402State()
    expect(() => state.store('', 'abc123')).toThrow('Invalid macaroon')
  })

  it('rejects empty preimage', () => {
    const state = new L402State()
    expect(() => state.store('bWFjMTIz', '')).toThrow('Invalid preimage')
  })
})
