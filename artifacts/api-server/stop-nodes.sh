#!/bin/bash
# Stop all backend nodes and load balancer

echo "Stopping backend nodes and load balancer..."

for pidfile in /tmp/node1.pid /tmp/node2.pid /tmp/node3.pid /tmp/lb.pid; do
  if [ -f "$pidfile" ]; then
    PID=$(cat "$pidfile")
    kill "$PID" 2>/dev/null && echo "Stopped PID $PID" || echo "Process $PID already stopped"
    rm -f "$pidfile"
  fi
done

echo "All services stopped."
