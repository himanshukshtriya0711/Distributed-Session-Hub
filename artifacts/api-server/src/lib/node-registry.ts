export interface BackendNode {
  id: string;
  port: number;
  status: "online" | "offline";
  requestCount: number;
}

const nodes: BackendNode[] = [
  { id: "node-1", port: 3001, status: "online", requestCount: 0 },
  { id: "node-2", port: 3002, status: "online", requestCount: 0 },
  { id: "node-3", port: 3003, status: "online", requestCount: 0 },
];

let roundRobinIndex = 0;

export function getNodes(): BackendNode[] {
  return nodes.map((n) => ({ ...n }));
}

export function getNextNode(): BackendNode {
  const onlineNodes = nodes.filter((n) => n.status === "online");
  if (onlineNodes.length === 0) throw new Error("No online nodes available");

  const node = onlineNodes[roundRobinIndex % onlineNodes.length];
  roundRobinIndex = (roundRobinIndex + 1) % onlineNodes.length;
  node.requestCount++;
  return { ...node };
}

export function getCurrentNodeInfo(): BackendNode {
  const node = getNextNode();
  return node;
}

export function updateNodeStatus(nodeId: string, status: "online" | "offline") {
  const node = nodes.find((n) => n.id === nodeId);
  if (node) {
    node.status = status;
  }
}

export function getNodeById(nodeId: string): BackendNode | undefined {
  return nodes.find((n) => n.id === nodeId);
}
