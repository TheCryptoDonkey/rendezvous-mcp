#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { RoutingClient } from './routing.js'
import { registerScoreVenuesTool } from './tools/score-venues.js'
import { registerSearchVenuesTool } from './tools/search-venues.js'
import { registerIsochroneTool } from './tools/isochrone.js'
import { registerDirectionsTool } from './tools/directions.js'

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

// Connect stdio transport
const transport = new StdioServerTransport()
await server.connect(transport)

console.error('rendezvous-mcp server running on stdio')
