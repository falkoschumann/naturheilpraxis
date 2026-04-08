# Contribution Guidelines

Requirements:

- Bun > 1.2 or Node.js >= 24 LTS
- Make
- [PlantUML](https://plantuml.com/en/starting)

Make Targets:

- `make` - Run build and tests
- `make dev` - Start dev environment
- `make format` - Fix style issues
- `make doc` - Update diagrams used in documentation

References:

- https://www.sqlstyle.guide

## Build for Apple macOS

Create a file `.env.local` with:

```bash
APPLE_ID=<your-apple-id>
APPLE_APP_SPECIFIC_PASSWORD=<your-app-specific-password>
APPLE_TEAM_ID=<your-team-id>
```
