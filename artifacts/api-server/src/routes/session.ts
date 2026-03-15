import { Router, type IRouter, type Request, type Response } from "express";
import { getCurrentNodeInfo, getNodes } from "../lib/node-registry.js";

const router: IRouter = Router();

router.get("/info", (req: Request, res: Response) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized", message: "Not authenticated" });
    return;
  }

  req.session.requestCount = (req.session.requestCount || 0) + 1;
  const node = getCurrentNodeInfo();

  req.session.save(() => {
    res.json({
      authenticated: true,
      username: req.session.username || "",
      sessionId: req.session.id,
      nodeId: node.id,
      nodePort: node.port,
      loginTime: req.session.loginTime || new Date().toISOString(),
      requestCount: req.session.requestCount || 1,
    });
  });
});

router.get("/nodes", (_req: Request, res: Response) => {
  const currentNode = getCurrentNodeInfo();
  const nodes = getNodes();

  res.json({
    nodes: nodes.map((n) => ({
      id: n.id,
      port: n.port,
      status: n.status,
      requestCount: n.requestCount,
    })),
    currentNode: currentNode.id,
  });
});

export default router;
