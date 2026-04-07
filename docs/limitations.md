# Limitations

Understanding what rendezvous-mcp does and does not handle avoids surprises when integrating.

## No geocoding

All tools require latitude/longitude coordinates. The server does not geocode city names, postcodes, or addresses. If your users provide place names, geocode them first using your AI's own knowledge, a geocoding API (Nominatim, Google Maps, etc.), or a separate geocoding MCP tool.

## No public transit routing

`transport_mode` supports `drive`, `cycle`, and `walk`. Public transit (bus, train, tube, tram) is not currently supported. This is a Valhalla engine constraint — Valhalla handles road and path networks but does not model transit timetables.

For transit-heavy cities (e.g., London, Tokyo), driving or cycling isochrones will give misleading fairness scores for participants who do not own vehicles. Consider surfacing this limitation to users.

## Valhalla coverage

The default hosted routing endpoint (`routing.trotters.cc`) covers global road and path networks via OpenStreetMap data. Coverage quality varies by region — rural areas in less-mapped countries may have sparse road data. Self-hosted Valhalla instances use whatever OSM extract you provide.

## Venue data freshness

`search-venues` uses the Overpass API to query OpenStreetMap data in real time. OSM coverage is excellent for UK, Europe, and major cities worldwide, but may be incomplete for smaller towns or recently-opened venues. Venue names, hours, and existence can be out of date if OSM has not been updated.

## Participant count

`score-venues` supports 2–10 participants. Larger groups require multiple calls or a custom aggregation strategy. For very large groups (conferences, events), isochrone intersection may be more practical than per-participant routing.

## Venue count

`score-venues` accepts up to 50 candidate venues per call. For exhaustive area searches, paginate `search-venues` results or filter by isochrone before scoring.

## Rate limits

The public hosted endpoint has a free request tier. Exhausting the free tier returns a `payment_required` response with a Lightning invoice. Self-hosted Valhalla has no rate limits beyond your own hardware capacity.

## No real-time traffic

Routing uses static road network data. Real-time traffic conditions, roadworks, and peak-hour congestion are not factored into travel time estimates.

## No accessibility routing

There is no support for wheelchair-accessible routing, step-free routes, or other accessibility constraints. All routing assumes standard pedestrian or vehicle paths.
