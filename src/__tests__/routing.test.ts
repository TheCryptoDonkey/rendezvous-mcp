import { describe, it, expect } from 'vitest'
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
    client.storeL402Credentials('mac123', 'pre456')
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
})
