import { useState } from "react";
import { Avatar, Badge, Button, Card, Col, Row, Segmented, Space, Tag, Typography } from "antd";

const THEMES = [
  { name: "Default", id: "default", desc: "Clean, neutral baseline with Ant Design defaults." },
  { name: "GitHub", id: "github-light", desc: "Sleek developer aesthetics modeled after GitHub." },
  { name: "Material", id: "material-light", desc: "Vibrant surfaces & bold typography." },
  { name: "Catppuccin", id: "catppuccin-latte", desc: "Soothing pastel palette for modern UI." },
  { name: "One Dark", id: "one-dark", desc: "Popular dark mode color scheme for code & dashboards." },
  { name: "Everforest", id: "everforest-light", desc: "Warm, natural organic tones." },
];

const FEATURES = [
  {
    icon: "⚡",
    title: "Zero Configuration",
    description: "Turn any standalone React JSX file into a portable web application without Vite, Webpack, or build setup.",
  },
  {
    icon: "🗜️",
    title: "Compressed Single-File HTML",
    description: "Bundles JS & CSS into a self-contained gzip base64 payload. Opens instantly in any browser via file:// or HTTP.",
  },
  {
    icon: "🎨",
    title: "20+ Theme Presets",
    description: "Includes harmonized Tailwind CSS v4 design tokens and Ant Design 6 Component tokens out of the box.",
  },
  {
    icon: "📁",
    title: "Flexible Output Modes",
    description: "Emit single-file HTML by default, or directory assets (--out-dir dist) for strict CSP and traditional hosting.",
  },
  {
    icon: "⚛️",
    title: "Full React 19 + Ant Design",
    description: "Pre-configured with React 19, Tailwind CSS v4, and Ant Design components ready for rapid prototyping.",
  },
  {
    icon: "🛠️",
    title: "CLI & Pack Workflows",
    description: "Simple CLI commands (`yolojsx Home.jsx`, `yolojsx pack dist`) for easy build & CI/CD pipeline integration.",
  },
];

const CODE_EXAMPLE = `import { Button, Card, Typography } from "antd";

export default function App() {
  return (
    <main className="min-h-screen grid place-items-center p-8">
      <Card className="max-w-md text-center">
        <Typography.Title level={2}>Ship in seconds 🚀</Typography.Title>
        <Typography.Paragraph type="secondary">
          Zero config React + Tailwind v4 + Ant Design 6.
        </Typography.Paragraph>
        <Button type="primary" size="large">Get Started</Button>
      </Card>
    </main>
  );
}`;

export default function Website() {
  const [copied, setCopied] = useState(false);
  const [activeTheme, setActiveTheme] = useState("default");

  const copyCommand = () => {
    navigator.clipboard?.writeText("npx yolojsx Home.jsx");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-xl">
            <Avatar shape="square" style={{ backgroundColor: "#1677ff" }}>Y</Avatar>
            <span>yolojsx</span>
            <Tag color="blue">v0.1.2</Tag>
          </div>
          <Space size="medium">
            <a href="#features" className="text-muted-foreground hover:text-foreground hidden sm:inline-block">Features</a>
            <a href="#themes" className="text-muted-foreground hover:text-foreground hidden sm:inline-block">Themes</a>
            <a href="#quickstart" className="text-muted-foreground hover:text-foreground hidden sm:inline-block">Quickstart</a>
            <Button
              type="primary"
              href="https://github.com/sirawats/yolojsx"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub ⭐
            </Button>
          </Space>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-24 text-center overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary opacity-10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl">
          <Badge count="Open Source CLI Tool" style={{ backgroundColor: "#52c41a" }} className="mb-6" />
          <Typography.Title className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6">
            Build React JSX into portable HTML apps.
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="text-xl leading-relaxed max-w-2xl mx-auto mb-8">
            Zero configuration. Turn any single <code className="bg-code px-2 py-1 rounded text-primary">.jsx</code> component into a portable compressed HTML application with React 19, Tailwind CSS v4, and Ant Design 6.
          </Typography.Paragraph>

          {/* Terminal Command Box */}
          <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-4 shadow-card mb-8 flex items-center justify-between gap-4 font-mono text-sm">
            <span className="text-muted-foreground">$ <span className="text-foreground font-semibold">npx yolojsx Home.jsx</span></span>
            <Button size="small" type="default" onClick={copyCommand}>
              {copied ? "Copied! ✓" : "Copy"}
            </Button>
          </div>

          <Space size="large" wrap>
            <Button type="primary" size="large" href="#quickstart">
              Get Started
            </Button>
            <Button size="large" href="https://github.com/sirawats/yolojsx" target="_blank" rel="noopener noreferrer">
              View on GitHub
            </Button>
          </Space>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-6 py-20 bg-card/40 border-y border-border">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Tag color="blue" className="mb-3">Everything Bundled</Tag>
            <Typography.Title level={2}>Why yolojsx?</Typography.Title>
            <Typography.Text type="secondary" className="text-base">
              Designed for developers who want to ship React components fast without build tool fatigue.
            </Typography.Text>
          </div>

          <Row gutter={[24, 24]}>
            {FEATURES.map((feat) => (
              <Col xs={24} md={12} lg={8} key={feat.title}>
                <Card hoverable className="h-full border-border">
                  <div className="text-3xl mb-4">{feat.icon}</div>
                  <Typography.Title level={4} className="mb-2">{feat.title}</Typography.Title>
                  <Typography.Text type="secondary">{feat.description}</Typography.Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Theme Catalog Preview */}
      <section id="themes" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Tag color="purple" className="mb-3">Design Token Systems</Tag>
            <Typography.Title level={2}>20+ Built-in Theme Presets</Typography.Title>
            <Typography.Text type="secondary" className="text-base">
              Themes seamlessly configure Tailwind CSS variables and matching Ant Design tokens.
            </Typography.Text>
          </div>

          <Row gutter={[20, 20]}>
            {THEMES.map((theme) => (
              <Col xs={24} sm={12} md={8} key={theme.id}>
                <Card
                  className={`h-full cursor-pointer transition-all ${activeTheme === theme.id ? "border-primary shadow-card" : "border-border"}`}
                  onClick={() => setActiveTheme(theme.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Typography.Title level={5} className="m-0">{theme.name}</Typography.Title>
                    <Tag color="geekblue">{theme.id}</Tag>
                  </div>
                  <Typography.Text type="secondary" className="text-xs block mb-4">{theme.desc}</Typography.Text>
                  <code className="text-xs bg-code px-2 py-1 rounded text-primary block truncate">
                    yolojsx App.jsx --theme {theme.id}
                  </code>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Code Example Section */}
      <section id="quickstart" className="px-6 py-20 bg-card/40 border-t border-border">
        <div className="mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <Tag color="green" className="mb-3">Simple Contract</Tag>
              <Typography.Title level={2}>Write React. Ship Single HTML.</Typography.Title>
              <Typography.Paragraph type="secondary" className="text-base">
                Create a standard React module exporting a default component. Import Ant Design components directly—yolojsx handles the bundling, CSS reset, and theme application automatically.
              </Typography.Paragraph>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold">1.</span>
                  <div>
                    <strong>Install or run via npx:</strong>
                    <div className="bg-code p-2 rounded mt-1 font-mono text-xs text-foreground">
                      npx yolojsx Home.jsx --theme github-dark
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold">2.</span>
                  <div>
                    <strong>Output single-file HTML or directory:</strong>
                    <div className="bg-code p-2 rounded mt-1 font-mono text-xs text-foreground">
                      yolojsx Home.jsx --out-dir dist
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-card">
              <div className="bg-background px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="size-3 rounded-full bg-danger" />
                <div className="size-3 rounded-full bg-warning" />
                <div className="size-3 rounded-full bg-success" />
                <span className="text-xs text-muted-foreground ml-2 font-mono">App.jsx</span>
              </div>
              <pre className="p-4 text-xs font-mono text-foreground overflow-x-auto m-0 leading-relaxed">
                {CODE_EXAMPLE}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-10 text-center text-muted-foreground text-sm">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} <strong>yolojsx</strong>. Released under the MIT License.
          </div>
          <Space size="large">
            <a href="https://github.com/sirawats/yolojsx" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              GitHub Repository
            </a>
            <a href="https://npmjs.com/package/yolojsx" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              npm Package
            </a>
          </Space>
        </div>
      </footer>
    </main>
  );
}
