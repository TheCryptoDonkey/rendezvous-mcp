import { describe, it, expect } from 'vitest'
import { L402State } from '../l402.js'

describe('L402State', () => {
  it('starts with no auth header', () => {
    const state = new L402State()
    expect(state.getAuthHeader()).toBeNull()
  })

  it('stores macaroon and preimage', () => {
    const state = new L402State()
    state.store('mac123', 'pre456')
    const header = state.getAuthHeader()
    expect(header).toBe('L402 mac123:pre456')
  })

  it('clears stored credentials', () => {
    const state = new L402State()
    state.store('mac123', 'pre456')
    state.clear()
    expect(state.getAuthHeader()).toBeNull()
  })
})
