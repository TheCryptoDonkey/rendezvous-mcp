# rendezvous-mcp

MCP server for AI-driven fair meeting point discovery. Find the best place to meet that's fair for everyone.

## Tools

- **score_venues** — Score candidate venues by travel time fairness for 2–10 participants
- **search_venues** — Search for venues near a location using OpenStreetMap
- **get_isochrone** — Get a reachability polygon (everywhere reachable in N minutes)
- **get_directions** — Get directions between two points with turn-by-turn steps

## Quick start

```json
{
  "mcpServers": {
    "rendezvous": {
      "command": "npx",
      "args": ["rendezvous-mcp"]
    }
  }
}
```

Works out of the box with free routing (10 requests/day). For more, pay with Lightning sats.

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `VALHALLA_URL` | `https://routing.trotters.cc` | Routing engine URL |
| `OVERPASS_URL` | Public endpoints | Venue search API |

## Self-hosted routing

```json
{
  "mcpServers": {
    "rendezvous": {
      "command": "npx",
      "args": ["rendezvous-mcp"],
      "env": {
        "VALHALLA_URL": "http://localhost:8002"
      }
    }
  }
}
```

## How it works

The AI host orchestrates the pipeline:

1. User asks "Where should we meet?"
2. AI geocodes participant locations
3. AI calls `search_venues` to find candidate venues near the midpoint
4. AI calls `score_venues` with participants + candidates — returns ranked results with travel times
5. AI presents the fairest option with travel times for each person

For deeper analysis, the AI can also use `get_isochrone` to visualise reachability and `get_directions` for turn-by-turn navigation.

## L402 payments

When the free tier is exhausted, tools return a `payment_required` response with a Lightning invoice. The AI host can present this to the user for payment. After payment, credentials are stored for the session.

## Architecture

Thin MCP wrapper over [rendezvous-kit](https://github.com/TheCryptoDonkey/rendezvous-kit). Each tool is an extracted handler function (testable without MCP) + registration one-liner. `RoutingClient` wraps `ValhallaEngine` with L402 payment handling.

## Development

```bash
npm install
npm run build
npm test
```

## Licence

MIT
