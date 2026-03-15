import http from "http";
import httpProxy from "http-proxy";
import { createClient } from "redis";

const NODES = [
  { id: "node-1", port: 3001, host: "localhost" },
  { id: "node-2", port: 3002, host: "localhost" },
  { id: "node-3", port: 3003, host: "localhost" },
];

const LOAD_BALANCER_PORT = 3000;
const STICKY_COOKIE = "lb_node";

let roundRobinIndex = 0;
const nodeHealth: Record<string, boolean> = {
  "node-1": true,
  "node-2": true,
  "node-3": true,
};

const proxy = httpProxy.createProxyServer({});

proxy.on("error", (err, req, res) => {
  console.error("Proxy error:", err.message);
  const nodeId = (req as any).__targetNode;
  if (nodeId) {
    console.log(`Marking ${nodeId} as offline`);
    nodeHealth[nodeId] = false;
    setTimeout(() => {
      console.log(`Retrying health check for ${nodeId}`);
      checkNodeHealth(nodeId);
    }, 5000);
  }
  if (res && !res.headersSent) {
    (res as http.ServerResponse).writeHead(502, { "Content-Type": "application/json" });
    (res as http.ServerResponse).end(
      JSON.stringify({ error: "BadGateway", message: "Backend node unavailable, try again" })
    );
  }
});

function getOnlineNodes() {
  return NODES.filter((n) => nodeHealth[n.id]);
}

function getNextNode(): (typeof NODES)[0] | null {
  const online = getOnlineNodes();
  if (online.length === 0) return null;
  const node = online[roundRobinIndex % online.length];
  roundRobinIndex = (roundRobinIndex + 1) % online.length;
  return node;
}

function getStickyNode(cookieHeader?: string): (typeof NODES)[0] | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${STICKY_COOKIE}=([^;]+)`));
  if (!match) return null;
  const nodeId = match[1];
  const node = NODES.find((n) => n.id === nodeId);
  if (node && nodeHealth[node.id]) return node;
  return null;
}

function checkNodeHealth(nodeId: string) {
  const node = NODES.find((n) => n.id === nodeId);
  if (!node) return;

  const req = http.request(
    { hostname: node.host, port: node.port, path: "/api/healthz", method: "GET", timeout: 2000 },
    (res) => {
      if (res.statusCode === 200) {
        if (!nodeHealth[nodeId]) {
          console.log(`${nodeId} is back online`);
          nodeHealth[nodeId] = true;
        }
      }
    }
  );

  req.on("error", () => {
    nodeHealth[nodeId] = false;
  });

  req.on("timeout", () => {
    nodeHealth[nodeId] = false;
    req.destroy();
  });

  req.end();
}

function startHealthChecks() {
  setInterval(() => {
    NODES.forEach((node) => checkNodeHealth(node.id));
  }, 5000);
}

const redisClient = createClient({ url: "redis://localhost:6379" });
redisClient.connect().catch(console.error);

const server = http.createServer((req, res) => {
  const cookieHeader = req.headers.cookie;
  let targetNode = getStickyNode(cookieHeader) || getNextNode();

  if (!targetNode) {
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "ServiceUnavailable", message: "All nodes are offline" }));
    return;
  }

  (req as any).__targetNode = targetNode.id;

  const setCookie = `${STICKY_COOKIE}=${targetNode.id}; Path=/; HttpOnly; SameSite=Lax`;
  const originalHeaders = res.getHeaders?.() || {};
  const originalWrite = res.write.bind(res);
  const originalEnd = res.end.bind(res);

  let headersSent = false;

  const injectCookie = () => {
    if (!headersSent) {
      headersSent = true;
      res.setHeader("Set-Cookie", setCookie);
      res.setHeader("X-Served-By", targetNode!.id);
    }
  };

  proxy.web(req, res, {
    target: `http://${targetNode.host}:${targetNode.port}`,
    changeOrigin: true,
  });

  res.on("finish", () => {
    console.log(`[LB] ${req.method} ${req.url} -> ${targetNode!.id}:${targetNode!.port}`);
  });
});

server.listen(LOAD_BALANCER_PORT, () => {
  console.log(`Load Balancer running on port ${LOAD_BALANCER_PORT}`);
  console.log(`Distributing to: ${NODES.map((n) => n.id + ":" + n.port).join(", ")}`);
  startHealthChecks();
});

export {};
