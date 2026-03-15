#!/bin/bash
# Start Redis and then the API server

echo "Starting Redis..."
redis-server --daemonize yes --logfile /tmp/redis.log 2>/dev/null
sleep 0.5

echo "Starting API server..."
exec tsx ./src/index.ts
