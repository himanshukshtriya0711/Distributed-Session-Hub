#!/bin/bash
# Start all backend nodes and load balancer

echo "Starting Redis..."
redis-server --daemonize yes --logfile /tmp/redis.log 2>/dev/null || echo "Redis already running"
sleep 1

echo "Starting backend Node 1 on port 3001..."
NODE_PORT=3001 pnpm --filter @workspace/api-server exec tsx ./src/node-server.ts > /tmp/node1.log 2>&1 &
echo $! > /tmp/node1.pid

echo "Starting backend Node 2 on port 3002..."
NODE_PORT=3002 pnpm --filter @workspace/api-server exec tsx ./src/node-server.ts > /tmp/node2.log 2>&1 &
echo $! > /tmp/node2.pid

echo "Starting backend Node 3 on port 3003..."
NODE_PORT=3003 pnpm --filter @workspace/api-server exec tsx ./src/node-server.ts > /tmp/node3.log 2>&1 &
echo $! > /tmp/node3.pid

sleep 2

echo "Starting Load Balancer on port 3000..."
pnpm --filter @workspace/api-server exec tsx ./src/load-balancer.ts > /tmp/lb.log 2>&1 &
echo $! > /tmp/lb.pid

echo ""
echo "All services started!"
echo "  Node 1: http://localhost:3001"
echo "  Node 2: http://localhost:3002"
echo "  Node 3: http://localhost:3003"
echo "  Load Balancer: http://localhost:3000"
