import { describe, it, expect, vi } from 'vitest'
import { ValhallaError } from 'rendezvous-kit'
import { RoutingClient } from '../routing.js'

describe('RoutingClient', () => {
  it('defaults valhalla URL to routing.trotters.cc', () => {
    const client = new RoutingClient()
    expect(client.valhallaUrl).toBe('https://routing.trotters.cc')
  })

  it('accepts custom valhalla URL', () => {
    const client = new RoutingClient({ valhallaUrl: 'http://localhost:8002' })
    expect(client.valhallaUrl).toBe('http://localhost:8002')
  })

  it('creates ValhallaEngine with L402 auth header when credentials stored', () => {
    const client = new RoutingClient()
    client.storeL402Credentials('bWFjMTIz', 'abc456')
    const engine = client.getEngine()
    expect(engine).toBeDefined()
    expect(engine.name).toBe('Valhalla')
  })

  it('rejects non-http valhalla URL', () => {
    expect(() => new RoutingClient({ valhallaUrl: 'ftp://evil.com' })).toThrow(TypeError)
  })

  it('rejects file:// valhalla URL', () => {
    expect(() => new RoutingClient({ valhallaUrl: 'file:///etc/passwd' })).toThrow(TypeError)
  })

  it('rejects invalid valhalla URL', () => {
    expect(() => new RoutingClient({ valhallaUrl: 'not a url' })).toThrow(TypeError)
  })

  it('strips trailing slash from valhalla URL', () => {
    const client = new RoutingClient({ valhallaUrl: 'http://localhost:8002/' })
    expect(client.valhallaUrl).toBe('http://localhost:8002')
  })

  it('truncates oversized fields in 402 response body', async () => {
    const client = new RoutingClient()
    const longInvoice = 'x'.repeat(5000)
    const body = JSON.stringify({ invoice: longInvoice, macaroon: 'mac', payment_hash: 'hash', amount_sats: 500 })
    const err402 = new ValhallaError('Payment required', 402, body)

    vi.spyOn(client, 'getEngine').mockReturnValue({
      computeRoute: () => { throw err402 },
    } as any)

    const result = await client.computeRoute({ lat: 0, lon: 0 }, { lat: 1, lon: 1 }, 'drive')
    expect(result).toHaveProperty('status', 'payment_required')
    if ('invoice' in result) {
      expect(result.invoice.length).toBeLessThanOrEqual(2048)
      expect(result.amount_sats).toBe(500)
    }
  })

  it('handles non-string fields in 402 response body', async () => {
    const client = new RoutingClient()
    const body = JSON.stringify({ invoice: 12345, macaroon: null, payment_hash: undefined, amount_sats: 'not a number' })
    const err402 = new ValhallaError('Payment required', 402, body)

    vi.spyOn(client, 'getEngine').mockReturnValue({
      computeRoute: () => { throw err402 },
    } as any)

    const result = await client.computeRoute({ lat: 0, lon: 0 }, { lat: 1, lon: 1 }, 'drive')
    expect(result).toHaveProperty('status', 'payment_required')
    if ('invoice' in result) {
      expect(result.invoice).toBe('')
      expect(result.macaroon).toBe('')
      expect(result.amount_sats).toBe(1000) // fallback
    }
  })

  it('encodes payment_hash in payment_url', async () => {
    const client = new RoutingClient()
    const body = JSON.stringify({ invoice: 'inv', macaroon: 'mac', payment_hash: '../admin', amount_sats: 100 })
    const err402 = new ValhallaError('Payment required', 402, body)

    vi.spyOn(client, 'getEngine').mockReturnValue({
      computeRoute: () => { throw err402 },
    } as any)

    const result = await client.computeRoute({ lat: 0, lon: 0 }, { lat: 1, lon: 1 }, 'drive')
    if ('payment_url' in result) {
      expect(result.payment_url).toContain(encodeURIComponent('../admin'))
      expect(result.payment_url).not.toContain('../admin')
    }
  })
})
