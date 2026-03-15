import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleStoreRoutingCredentials } from '../../tools/store-credentials.js'

// Mock the routing client
const mockStoreL402Credentials = vi.fn()
const mockRoutingClient = {
  storeL402Credentials: mockStoreL402Credentials,
  valhallaUrl: 'http://test',
} as any

describe('handleStoreRoutingCredentials', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls storeL402Credentials with macaroon and preimage', async () => {
    await handleStoreRoutingCredentials({
      macaroon: 'YWJjMTIz',
      preimage: 'abc123def456',
    }, mockRoutingClient)

    expect(mockStoreL402Credentials).toHaveBeenCalledOnce()
    expect(mockStoreL402Credentials).toHaveBeenCalledWith('YWJjMTIz', 'abc123def456')
  })

  it('returns success response', async () => {
    const result = await handleStoreRoutingCredentials({
      macaroon: 'YWJjMTIz',
      preimage: 'abc123def456',
    }, mockRoutingClient)

    const data = JSON.parse(result.content[0].text)
    expect(data.success).toBe(true)
    expect(data.message).toContain('L402 credentials stored')
  })
})
