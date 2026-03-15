# Distributed Session Management System

## Overview

A live demonstration of distributed session management across multiple Node.js backend servers using Redis as a centralized session store.

## Architecture

```
Browser → Frontend (React/Vite) → /api → Backend Server (Express + Redis) → Session Storage
```

The backend simulates a distributed cluster with 3 nodes and a round-robin load balancer:

```
Client → Load Balancer (port 3000) → Node 1 (3001) / Node 2 (3002) / Node 3 (3003) → Redis
```

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend framework**: React + Vite + Tailwind CSS
- **API framework**: Express 5
- **Session store**: Redis + express-session + connect-redis
- **Load balancing**: http-proxy (round-robin + sticky sessions)
- **API codegen**: Orval (from OpenAPI spec)

## Project Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server with session management
│   │   ├── src/
│   │   │   ├── index.ts        # Main entry (starts Redis + server)
│   │   │   ├── start.ts        # Bootstrap script (starts Redis first)
│   │   │   ├── app.ts          # Express app with session middleware
│   │   │   ├── lib/
│   │   │   │   ├── redis-client.ts    # Redis connection
│   │   │   │   └── node-registry.ts  # Round-robin node simulation
│   │   │   ├── middlewares/
│   │   │   │   └── session.ts         # express-session + connect-redis
│   │   │   └── routes/
│   │   │       ├── auth.ts            # POST /api/auth/login, /logout
│   │   │       └── session.ts         # GET /api/session/info, /nodes
│   │   ├── start-nodes.sh      # Script to start all nodes
│   │   └── stop-nodes.sh       # Script to stop all nodes
│   └── session-demo/       # React frontend
│       └── src/
│           ├── pages/
│           │   ├── home.tsx       # Architecture overview page
│           │   ├── login.tsx      # Login form
│           │   └── dashboard.tsx  # Session dashboard (protected)
│           └── App.tsx            # Router
├── lib/
│   ├── api-spec/           # OpenAPI spec + codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas
│   └── db/                 # Drizzle ORM (not used for sessions)
```

## Features Demonstrated

- **Distributed session storage** — Redis stores sessions accessible by any node
- **Round-robin load balancing** — Each request routes to the next node
- **Sticky session support** — lb_node cookie pins client to a node
- **Failover handling** — Offline nodes are skipped automatically
- **Session persistence** — Sessions survive server restarts (Redis backed)

## API Endpoints

- `POST /api/auth/login` — Create session (username/password)
- `POST /api/auth/logout` — Destroy session
- `GET /api/session/info` — Get current session + serving node
- `GET /api/session/nodes` — Get all node statuses
- `GET /api/healthz` — Health check

## Demo Credentials

- `admin` / `password`
- `user1` / `pass1`
- `user2` / `pass2`
- Any username with password `demo` also works

## Development

```bash
# Start everything
pnpm --filter @workspace/api-server run dev  # Starts Redis + API server
pnpm --filter @workspace/session-demo run dev  # Starts Vite frontend

# Codegen (after changing OpenAPI spec)
pnpm --filter @workspace/api-spec run codegen
```
