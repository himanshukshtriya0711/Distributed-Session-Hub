import { Link } from "wouter";
import { Server, Database, ArrowRight, Shield, Zap, RefreshCw, GitBranch } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Server className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">DSM System</span>
        </div>
        <div className="flex gap-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Login</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary mb-6">
            <Zap className="w-3.5 h-3.5" />
            Distributed Session Management Demo
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-6 leading-tight">
            Sessions that survive<br />
            <span className="text-primary">server failures</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            A live demonstration of how Redis-backed sessions persist across multiple
            Node.js backend servers with round-robin load balancing and automatic failover.
          </p>
          <Link href="/login">
            <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
              Try the Demo
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        <div className="mb-16">
          <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wider mb-8 text-center">Architecture</h2>
          <div className="bg-card border border-card-border rounded-xl p-8">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🌐</span>
                </div>
                <span className="text-sm text-muted-foreground font-mono">Browser</span>
              </div>

              <div className="flex items-center gap-1 text-muted-foreground">
                <div className="h-px w-8 bg-border"></div>
                <ArrowRight className="w-4 h-4" />
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground font-mono">Load Balancer</span>
                <span className="text-xs text-primary font-mono">Round Robin</span>
              </div>

              <div className="flex items-center gap-1 text-muted-foreground">
                <div className="h-px w-8 bg-border"></div>
                <ArrowRight className="w-4 h-4" />
              </div>

              <div className="flex flex-col gap-2">
                {["Node 1 :3001", "Node 2 :3002", "Node 3 :3003"].map((node, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-10 h-8 bg-secondary/50 border border-border rounded flex items-center justify-center">
                      <Server className="w-4 h-4 text-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{node}</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1 text-muted-foreground">
                <div className="h-px w-8 bg-border"></div>
                <ArrowRight className="w-4 h-4" />
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-chart-2/10 border border-chart-2/20 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-chart-2" />
                </div>
                <span className="text-sm text-muted-foreground font-mono">Redis</span>
                <span className="text-xs text-chart-2 font-mono">Session Store</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {[
            {
              icon: <Database className="w-5 h-5 text-chart-2" />,
              title: "Redis Sessions",
              desc: "All session data stored centrally in Redis — any node can access it",
              color: "chart-2",
            },
            {
              icon: <RefreshCw className="w-5 h-5 text-primary" />,
              title: "Round Robin",
              desc: "Each request routes to the next available backend node automatically",
              color: "primary",
            },
            {
              icon: <Shield className="w-5 h-5 text-chart-3" />,
              title: "Failover",
              desc: "If a node goes offline, other nodes handle the traffic seamlessly",
              color: "chart-3",
            },
            {
              icon: <GitBranch className="w-5 h-5 text-chart-4" />,
              title: "Sticky Sessions",
              desc: "Optionally pin a client to the same node for consistent routing",
              color: "chart-4",
            },
          ].map((f, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl p-5">
              <div className={`w-10 h-10 bg-${f.color}/10 border border-${f.color}/20 rounded-lg flex items-center justify-center mb-4`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-card-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Demo Credentials</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { user: "admin", pass: "password" },
              { user: "user1", pass: "pass1" },
              { user: "user2", pass: "pass2" },
            ].map((cred, i) => (
              <div key={i} className="bg-background border border-border rounded-lg p-3 font-mono text-sm">
                <div className="text-muted-foreground text-xs mb-1">Account {i + 1}</div>
                <div className="text-foreground">{cred.user} / {cred.pass}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Any username with password <code className="bg-muted px-1 rounded">demo</code> also works.
          </p>
        </div>
      </main>
    </div>
  );
}
