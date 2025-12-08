### Getting Started (Local Development)

1. Make a copy of `ops/dev/env.stub` to `ops/dev/.env`

2. Ask the team for values that will go in the `.env` file

3. Execute the below commands to build and start the services

```bash

docker compose -f ops/dev/compose.yml build

docker compose -f ops/dev/compose.yml up

```

### Convenience Scripts

```bash

docker compose -f ops/dev/compose.yml run --rm [service] bash

docker compose -f ops/dev/compose.yml down --volumes --remove-orphans

docker compose -f ops/dev/compose.yml attach --detach-keys="ctrl-c" [service]

```

### Deployment (Production)

See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for complete deployment instructions.

**Quick Deploy:**
- **Platform**: Render (web services) + Supabase (database)
- **Cost**: Free tier available ($0/month)
- **Files**: `render.yaml` blueprint for automatic deployment
