#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { RoutingClient } from './routing.js'
import { registerScoreVenuesTool } from './tools/score-venues.js'
import { registerSearchVenuesTool } from './tools/search-venues.js'
import { registerIsochroneTool } from './tools/isochrone.js'
import { registerDirectionsTool } from './tools/directions.js'
import { registerStoreCredentialsTool } from './tools/store-credentials.js'

const TRANSPORT = process.env.TRANSPORT ?? 'stdio'
const PORT = parseInt(process.env.PORT ?? '3002', 10)
const HOST = process.env.HOST ?? '0.0.0.0'
const VALHALLA_URL = process.env.VALHALLA_URL
const OVERPASS_URL = process.env.OVERPASS_URL

const server = new McpServer({
  name: 'rendezvous-mcp',
  version: '0.1.0',
})

const routingClient = new RoutingClient({
  valhallaUrl: VALHALLA_URL,
})

// Register all tools
registerScoreVenuesTool(server, routingClient)
registerSearchVenuesTool(server, OVERPASS_URL)
registerIsochroneTool(server, routingClient)
registerDirectionsTool(server, routingClient)
registerStoreCredentialsTool(server, routingClient)

if (TRANSPORT === 'http') {
  const { default: express } = await import('express')
  const { default: cors } = await import('cors')
  const { StreamableHTTPServerTransport } = await import(
    '@modelcontextprotocol/sdk/server/streamableHttp.js'
  )

  const app = express()
  app.use(cors())
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      server: 'rendezvous-mcp',
      version: '0.1.0',
      tools: ['score_venues', 'search_venues', 'get_isochrone', 'get_directions', 'store_routing_credentials'],
    })
  })

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  })

  await server.connect(transport)

  app.post('/mcp', async (req, res) => {
    await transport.handleRequest(req, res, req.body)
  })

  app.get('/mcp', async (req, res) => {
    await transport.handleRequest(req, res)
  })

  app.delete('/mcp', async (req, res) => {
    await transport.handleRequest(req, res)
  })

  app.listen(PORT, HOST, () => {
    console.error(`rendezvous-mcp HTTP server listening on ${HOST}:${PORT}`)
    console.error('MCP endpoint: /mcp')
    console.error('Health check: /health')
  })
} else {
  const { StdioServerTransport } = await import(
    '@modelcontextprotocol/sdk/server/stdio.js'
  )

  const transport = new StdioServerTransport()
  await server.connect(transport)

  console.error('rendezvous-mcp server running on stdio')
}
