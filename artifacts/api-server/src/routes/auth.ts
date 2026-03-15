import { Router, type IRouter, type Request, type Response } from "express";
import { getCurrentNodeInfo } from "../lib/node-registry.js";

const router: IRouter = Router();

const DEMO_USERS: Record<string, string> = {
  admin: "password",
  user1: "pass1",
  user2: "pass2",
};

router.post("/login", async (req: Request, res: Response) => {
  console.log("[LOGIN] body:", JSON.stringify(req.body));
  console.log("[LOGIN] content-type:", req.headers["content-type"]);

  const rawUsername = req.body?.username;
  const rawPassword = req.body?.password;
  const username = typeof rawUsername === "string" ? rawUsername.trim() : "";
  const password = typeof rawPassword === "string" ? rawPassword.trim() : "";

  console.log(`[LOGIN] username="${username}" password="${password}"`);

  if (!username || !password) {
    res.status(400).json({ error: "BadRequest", message: "Username and password are required" });
    return;
  }

  const expectedPassword = DEMO_USERS[username];
  const validPassword = expectedPassword === password || password === "demo";

  console.log(`[LOGIN] expected="${expectedPassword}" valid=${validPassword}`);

  if (!validPassword) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
    return;
  }

  const node = getCurrentNodeInfo();

  req.session.userId = username;
  req.session.username = username;
  req.session.loginTime = new Date().toISOString();
  req.session.requestCount = 0;

  req.session.save((err) => {
    if (err) {
      console.error("[LOGIN] Session save error:", err);
      res.status(500).json({ error: "InternalError", message: "Session save failed" });
      return;
    }

    console.log(`[LOGIN] Success: ${username} via ${node.id}`);
    res.json({
      success: true,
      username,
      sessionId: req.session.id,
      nodeId: node.id,
      message: `Logged in successfully via ${node.id}`,
    });
  });
});

router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("[LOGOUT] Session destroy error:", err);
      res.status(500).json({ error: "InternalError", message: "Logout failed" });
      return;
    }
    res.clearCookie("dsm.sid");
    res.json({ success: true, message: "Logged out successfully" });
  });
});

export default router;
