# KPPE Browser Boundary Note

Project Jennifer keeps browser policy evaluation separate from server-only integrity operations.

The APWA client uses the browser-safe governance entrypoint established by PR #66. Server-side integrity and receipt operations remain outside the client bundle.

This boundary is required before validating the World Event Heartbeat against the current `main` branch.
