import { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "wouter";
import {
  Server, Database, RefreshCw, LogOut, Activity,
  Clock, Hash, Layers, Wifi, WifiOff, AlertTriangle
} from "lucide-react";

interface SessionInfo {
  authenticated: boolean;
  username: string;
  sessionId: string;
  nodeId: string;
  nodePort: number;
  loginTime: string;
  requestCount: number;
}

interface NodeStatus {
  id: string;
  port: number;
  status: "online" | "offline";
  requestCount: number;
}

interface NodeStatusResponse {
  nodes: NodeStatus[];
  currentNode: string;
}

const NODE_COLORS: Record<string, string> = {
  "node-1": "text-chart-1",
  "node-2": "text-chart-2",
  "node-3": "text-chart-3",
};

const NODE_BG: Record<string, string> = {
  "node-1": "bg-chart-1/10 border-chart-1/20",
  "node-2": "bg-chart-2/10 border-chart-2/20",
  "node-3": "bg-chart-3/10 border-chart-3/20",
};

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [nodes, setNodes] = useState<NodeStatus[]>([]);
  const [currentNode, setCurrentNode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchSession = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [sessRes, nodeRes] = await Promise.all([
        fetch("/api/session/info", { credentials: "include" }),
        fetch("/api/session/nodes", { credentials: "include" }),
      ]);

      if (sessRes.status === 401) {
        navigate("/login");
        return;
      }

      if (!sessRes.ok) {
        throw new Error("Failed to fetch session");
      }

      const sessData: SessionInfo = await sessRes.json();
      const nodeData: NodeStatusResponse = await nodeRes.json();

      setSession(sessData);
      setNodes(nodeData.nodes);
      setCurrentNode(nodeData.currentNode);
      setLastRefresh(new Date());
      setError("");
    } catch (err) {
      setError("Failed to connect to backend");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      navigate("/login");
    }
  };

  const handleRefresh = () => fetchSession(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading session...</span>
        </div>
      </div>
    );
  }

  const sessionIdShort = session?.sessionId
    ? `${session.sessionId.slice(0, 8)}...${session.sessionId.slice(-8)}`
    : "—";

  const loginTimeFormatted = session?.loginTime
    ? new Date(session.loginTime).toLocaleTimeString()
    : "—";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Server className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">DSM System</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, <span className="text-primary">{session?.username}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your session is stored in Redis and accessible by any backend node
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 mb-6 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className={`border rounded-xl p-5 mb-6 ${session?.nodeId ? NODE_BG[session.nodeId] || "bg-primary/10 border-primary/20" : "bg-primary/10 border-primary/20"}`}>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Request handled by</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className={`text-3xl font-bold font-mono ${session?.nodeId ? NODE_COLORS[session.nodeId] || "text-primary" : "text-primary"}`}>
              {session?.nodeId || "—"}
            </span>
            <span className="text-muted-foreground font-mono text-sm">
              port :{session?.nodePort || "—"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Click "Refresh" in the nav to see round-robin routing in action — each refresh may hit a different node
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-card-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Hash className="w-4 h-4" />
              <span className="text-xs font-medium">Session ID</span>
            </div>
            <div className="font-mono text-sm text-foreground break-all">{sessionIdShort}</div>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">Login Time</span>
            </div>
            <div className="font-mono text-sm text-foreground">{loginTimeFormatted}</div>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Layers className="w-4 h-4" />
              <span className="text-xs font-medium">Request Count</span>
            </div>
            <div className="font-mono text-2xl font-bold text-primary">{session?.requestCount || 0}</div>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Database className="w-4 h-4" />
              <span className="text-xs font-medium">Session Store</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-mono text-sm text-green-400">Redis</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" />
            Backend Node Status
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {nodes.map((node) => {
              const isActive = node.id === currentNode;
              return (
                <div
                  key={node.id}
                  className={`rounded-lg border p-4 transition-all ${
                    isActive
                      ? (NODE_BG[node.id] || "bg-primary/10 border-primary/20")
                      : "bg-background border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`font-mono font-semibold text-sm ${
                      isActive ? (NODE_COLORS[node.id] || "text-primary") : "text-foreground"
                    }`}>
                      {node.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {node.status === "online" ? (
                        <>
                          <Wifi className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-xs text-green-400 font-medium">Online</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="w-3.5 h-3.5 text-destructive" />
                          <span className="text-xs text-destructive font-medium">Offline</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Port</span>
                      <span className="font-mono text-foreground">{node.port}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Requests</span>
                      <span className="font-mono text-foreground">{node.requestCount}</span>
                    </div>
                  </div>
                  {isActive && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">← Served this request</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-muted/30 border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-chart-2" />
            Full Session Data
          </h3>
          <div className="bg-background border border-border rounded-lg p-4 font-mono text-xs text-muted-foreground overflow-x-auto">
            <pre>{JSON.stringify(session, null, 2)}</pre>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Last fetched: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
      </main>
    </div>
  );
}
