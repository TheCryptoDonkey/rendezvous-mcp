/** Payment-required response returned to MCP when Valhalla returns 402. */
export interface L402PaymentRequired {
  status: 'payment_required'
  message: string
  invoice: string
  macaroon: string
  payment_hash: string
  payment_url: string
  amount_sats: number
}

/** In-memory L402 credential storage for a single MCP session. */
export class L402State {
  private macaroon: string | null = null
  private preimage: string | null = null

  /** Store credentials after the user pays an invoice. */
  store(macaroon: string, preimage: string): void {
    this.macaroon = macaroon
    this.preimage = preimage
  }

  /** Return the Authorization header value, or null if no credentials. */
  getAuthHeader(): string | null {
    if (!this.macaroon || !this.preimage) return null
    return `L402 ${this.macaroon}:${this.preimage}`
  }

  /** Clear stored credentials. */
  clear(): void {
    this.macaroon = null
    this.preimage = null
  }
}

/**
 * Parse a 402 response's WWW-Authenticate header into an L402PaymentRequired.
 * Header format: L402 macaroon="<base64>", invoice="<bolt11>"
 */
export function parse402(wwwAuth: string, valhallaUrl: string): L402PaymentRequired | null {
  const macMatch = wwwAuth.match(/macaroon="([^"]+)"/)
  const invMatch = wwwAuth.match(/invoice="([^"]+)"/)
  if (!macMatch || !invMatch) return null

  const macaroon = macMatch[1]
  const invoice = invMatch[1]

  return {
    status: 'payment_required',
    message: 'Free tier exhausted. Pay to continue using the routing service.',
    invoice,
    macaroon,
    payment_hash: '',  // filled in by caller from response body
    payment_url: `${valhallaUrl}/invoice-status/`,
    amount_sats: 1000,  // default, overridden from response body
  }
}
