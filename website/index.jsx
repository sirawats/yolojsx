import { StyleProvider } from "@ant-design/cssinjs";
import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  ConfigProvider,
  Row,
  Segmented,
  Space,
  Tag,
  Typography,
  theme as antdTheme,
} from "antd";
import { THEMES, renderThemeCss } from "../src/themes.js";

const EXAMPLES = Object.entries(
  import.meta.glob("../examples/*.jsx", { eager: true, import: "default" }),
).map(([file, component]) => {
  const name = file.split("/").pop();
  return {
    id: name,
    label: name.slice(0, -4),
    component,
  };
}).sort((left, right) => left.label.localeCompare(right.label));

const THEME_FAMILIES = THEMES.reduce((families, preset) => {
  const family = families.find(({ id }) =>
    preset.id === id || preset.id.startsWith(`${id}-`)
  );
  if (family) {
    family.presets.push(preset);
    return families;
  }
  const id = preset.aliases.find((alias) => preset.id.startsWith(`${alias}-`)) ?? preset.id;
  families.push({
    id,
    name: preset.name.split(" ").slice(0, id.split("-").length).join(" "),
    presets: [preset],
  });
  return families;
}, []);
const FAMILIES_PER_PAGE = 4;

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
  const [activeExampleId, setActiveExampleId] = useState(EXAMPLES[0].id);
  const [activeThemeId, setActiveThemeId] = useState(THEMES[0].id);
  const [familyPageIndex, setFamilyPageIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState("desktop");
  const [previewDocument, setPreviewDocument] = useState();

  const copyCommand = () => {
    navigator.clipboard?.writeText("npx yolojsx Home.jsx");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeExample = EXAMPLES.find(({ id }) => id === activeExampleId) ?? EXAMPLES[0];
  const activeTheme = THEMES.find(({ id }) => id === activeThemeId) ?? THEMES[0];
  const activeFamily = THEME_FAMILIES.find(({ presets }) =>
    presets.some(({ id }) => id === activeTheme.id)
  ) ?? THEME_FAMILIES[0];
  const familyPageCount = Math.ceil(THEME_FAMILIES.length / FAMILIES_PER_PAGE);
  const visibleFamilies = THEME_FAMILIES.slice(
    familyPageIndex * FAMILIES_PER_PAGE,
    (familyPageIndex + 1) * FAMILIES_PER_PAGE,
  );
  const ActiveExample = activeExample.component;
  const previewTheme = {
    ...activeTheme.antDesign,
    algorithm: activeTheme.appearance === "dark"
      ? antdTheme.darkAlgorithm
      : antdTheme.defaultAlgorithm,
  };
  const changeFamilyPage = (offset) => {
    const nextPage = (familyPageIndex + offset + familyPageCount) % familyPageCount;
    setFamilyPageIndex(nextPage);
    setActiveThemeId(THEME_FAMILIES[nextPage * FAMILIES_PER_PAGE].presets[0].id);
  };
  const loadPreview = (event) => {
    const frameDocument = event.currentTarget.contentDocument;
    const base = frameDocument.createElement("base");
    base.href = document.baseURI;
    const styles = [...document.head.querySelectorAll(
      'link[rel="stylesheet"], style:not([data-rc-order])',
    )].map((node) => node.cloneNode(true));
    frameDocument.head.replaceChildren(base, ...styles);
    frameDocument.body.style.margin = "0";
    frameDocument.body.style.overflowX = "hidden";
    setPreviewDocument(frameDocument);
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
            <a href="#showcase" className="text-muted-foreground hover:text-foreground hidden sm:inline-block">Showcase</a>
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
            <Button type="primary" size="large" href="#showcase">
              Explore Showcase
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

      {/* Interactive Showcase */}
      <section id="showcase" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Tag color="purple" className="mb-3">Live Showcase</Tag>
            <Typography.Title level={2}>Examples, in every theme</Typography.Title>
            <Typography.Text type="secondary" className="text-base">
              Preview every packaged example with the complete theme catalog.
            </Typography.Text>
          </div>

          <Card className="border-border shadow-card">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,4fr)]">
              <nav aria-label="Examples" className="border-b border-border pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
                <div className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Examples ({EXAMPLES.length})
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                  {EXAMPLES.map(({ id, label }) => {
                    const isActive = id === activeExample.id;
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setActiveExampleId(id)}
                        className={`rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          isActive
                            ? "bg-primary font-semibold text-primary-foreground"
                            : "bg-code text-foreground hover:bg-border"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </nav>

              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <strong>{activeExample.label}</strong>
                  <div className="flex items-center gap-2">
                    <Segmented
                      size="small"
                      options={["Desktop", "Mobile"]}
                      value={previewMode === "desktop" ? "Desktop" : "Mobile"}
                      onChange={(value) => setPreviewMode(value.toLowerCase())}
                    />
                    <Tag color="geekblue">{activeTheme.id}</Tag>
                  </div>
                </div>
                <div className="flex justify-center">
                  <iframe
                    title={`${activeExample.label} ${previewMode} preview`}
                    srcDoc="<!doctype html><html><head></head><body></body></html>"
                    onLoad={loadPreview}
                    className="block w-full rounded-xl border border-border bg-background"
                    style={{
                      aspectRatio: previewMode === "desktop" ? "16 / 9" : "6 / 13",
                      maxWidth: previewMode === "mobile" ? "390px" : "none",
                    }}
                  />
                </div>
                {previewDocument && createPortal(
                  <>
                    <style>{renderThemeCss(activeTheme)}</style>
                    <StyleProvider container={previewDocument.head} layer>
                      <ConfigProvider theme={previewTheme}>
                        <div
                          style={{
                            width: "calc(100% / 0.7)",
                            transform: "scale(0.7)",
                            transformOrigin: "top left",
                          }}
                        >
                          <ActiveExample />
                        </div>
                      </ConfigProvider>
                    </StyleProvider>
                  </>,
                  previewDocument.body,
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-4 border-t border-border pt-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="flex flex-wrap items-center gap-2">
                <Button size="small" onClick={() => changeFamilyPage(-1)} aria-label="Previous theme families">
                  ←
                </Button>
                {visibleFamilies.map((family) => {
                  const isActive = family.id === activeFamily.id;
                  return (
                    <button
                      key={family.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setActiveThemeId(family.presets[0].id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-code text-foreground hover:bg-border"
                      }`}
                    >
                      {family.name}
                    </button>
                  );
                })}
                <Button size="small" onClick={() => changeFamilyPage(1)} aria-label="Next theme families">
                  →
                </Button>
                <span className="text-xs text-muted-foreground">
                  {familyPageIndex + 1}/{familyPageCount}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Variant</span>
                {activeFamily.presets.map((preset) => {
                  const isActive = preset.id === activeTheme.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setActiveThemeId(preset.id)}
                      className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                        isActive
                          ? "bg-foreground font-bold text-background"
                          : "bg-code text-muted-foreground hover:bg-border hover:text-foreground"
                      }`}
                    >
                      {preset.name.slice(activeFamily.name.length).trim() || preset.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
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
