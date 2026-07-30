import { StyleProvider } from "@ant-design/cssinjs";
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type SyntheticEvent,
} from "react";
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
  type ThemeConfig,
} from "antd";
import {
  LuArchive,
  LuAtom,
  LuCheck,
  LuCopy,
  LuFolderOutput,
  LuGithub,
  LuPalette,
  LuWrench,
  LuZap,
} from "react-icons/lu";
import Prism from "prismjs";
// @ts-expect-error PrismJS does not publish declarations for language modules.
import "prismjs/components/prism-jsx";
import packageJson from "../package.json" with { type: "json" };
import { THEMES, renderThemeCss, type Theme } from "../src/themes.js";
import logo from "../assets/yolo_chihuahua_sticker.png";

const { version } = packageJson;

export const YOLOJSX = {
  title: "yolojsx — Build React JSX into portable HTML apps",
  icon: logo,
  prismTheme: "prism",
};

const RAW_EXAMPLES = import.meta.glob<string>("../examples/*.jsx", {
  eager: true,
  query: "?raw",
  import: "default",
});

interface Example {
  id: string;
  label: string;
  component: ComponentType;
  code: string;
}

interface ThemeFamily {
  id: string;
  name: string;
  presets: Theme[];
}

type PreviewMode = "desktop" | "mobile" | "code";

const EXAMPLES = Object.entries(
  import.meta.glob<ComponentType>("../examples/*.jsx", {
    eager: true,
    import: "default",
  }),
)
  .map<Example>(([file, component]) => {
    const name = file.slice(file.lastIndexOf("/") + 1);
    return {
      id: name,
      label: name.slice(0, -4),
      component,
      code: RAW_EXAMPLES[file] || "",
    };
  })
  .sort((left, right) => left.label.localeCompare(right.label));

const PREVIEW_SCALE = 0.7;

const THEME_FAMILIES = THEMES.reduce<ThemeFamily[]>((families, preset) => {
  const family = families.find(
    ({ id }) => preset.id === id || preset.id.startsWith(`${id}-`),
  );
  if (family) {
    family.presets.push(preset);
    return families;
  }
  const id =
    preset.aliases.find((alias) => preset.id.startsWith(`${alias}-`)) ??
    preset.id;
  families.push({
    id,
    name: preset.name.split(" ").slice(0, id.split("-").length).join(" "),
    presets: [preset],
  });
  return families;
}, []);

const FEATURES = [
  {
    icon: LuZap,
    title: "Zero Configuration",
    description:
      "Turn any standalone React JSX file into a portable web application without Vite, Webpack, or build setup.",
  },
  {
    icon: LuArchive,
    title: "Compressed Single-File HTML",
    description:
      "Bundles JS & CSS into a self-contained gzip base64 payload. Opens instantly in any browser via file:// or HTTP.",
  },
  {
    icon: LuPalette,
    title: "20+ Theme Presets",
    description:
      "Includes harmonized Tailwind CSS v4 design tokens and Ant Design 6 Component tokens out of the box.",
  },
  {
    icon: LuFolderOutput,
    title: "Flexible Output Modes",
    description:
      "Emit single-file HTML by default, or directory assets (--out-dir dist) for strict CSP and traditional hosting.",
  },
  {
    icon: LuAtom,
    title: "Full React 19 + Ant Design",
    description:
      "Pre-configured with React 19, Tailwind CSS v4, and Ant Design components ready for rapid prototyping.",
  },
  {
    icon: LuWrench,
    title: "CLI & Pack Workflows",
    description:
      "Simple CLI commands (`yolojsx Home.jsx`, `yolojsx pack dist`) for easy build & CI/CD pipeline integration.",
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

const highlightJsx = (code: string) =>
  Prism.highlight(code, Prism.languages.jsx, "jsx");

function ThemePicker({
  themeFamilies,
  activeFamily,
  onSelectTheme,
  onStepTheme,
}: {
  themeFamilies: ThemeFamily[];
  activeFamily: ThemeFamily;
  onSelectTheme: (id: string) => void;
  onStepTheme: (offset: number) => void;
}) {
  const activeFamilyRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeFamilyRef.current?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }, [activeFamily.id]);

  return (
    <div className="mb-4 flex min-w-0 items-center gap-2 border-y border-border py-3">
      <span className="mr-1 shrink-0 text-xs font-semibold text-muted-foreground">
        Theme
      </span>
      <Button
        className="shrink-0"
        size="small"
        onClick={() => onStepTheme(-1)}
        aria-label="Previous theme"
      >
        ←
      </Button>
      <div className="relative min-w-0 flex-1">
        <div
          aria-label="Theme families"
          className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex w-max items-center gap-2 px-3">
            {themeFamilies.map((family) => {
              const isActive = family.id === activeFamily.id;
              return (
                <button
                  ref={isActive ? activeFamilyRef : undefined}
                  key={family.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onSelectTheme(family.presets[0].id)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "bg-code text-foreground hover:bg-border"
                  }`}
                >
                  {family.name}
                </button>
              );
            })}
          </div>
        </div>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-4"
          style={{
            background:
              "linear-gradient(to right, var(--background), transparent)",
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-4"
          style={{
            background:
              "linear-gradient(to left, var(--background), transparent)",
          }}
        />
      </div>
      <Button
        className="shrink-0"
        size="small"
        onClick={() => onStepTheme(1)}
        aria-label="Next theme"
      >
        →
      </Button>
    </div>
  );
}

function CliCommandBar({
  exampleId,
  themeId,
}: {
  exampleId: string;
  themeId: string;
}) {
  const command = `npx yolojsx ${exampleId} --theme ${themeId}`;
  const [copied, setCopied] = useState(false);

  const copy = () => {
    void navigator.clipboard?.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/90 px-4 py-2.5 font-mono text-xs shadow-card">
      <div className="flex items-center gap-2 overflow-x-auto">
        <span className="text-primary font-bold">$</span>
        <span className="text-foreground font-medium">{command}</span>
      </div>
      <Button
        size="small"
        type="default"
        icon={
          copied ? (
            <LuCheck aria-hidden="true" />
          ) : (
            <LuCopy aria-hidden="true" />
          )
        }
        onClick={copy}
      >
        {copied ? "Copied! ✓" : "Copy Command"}
      </Button>
    </div>
  );
}

export default function Website() {
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [activeExampleId, setActiveExampleId] = useState(EXAMPLES[0].id);
  const [activeThemeId, setActiveThemeId] = useState(THEMES[0].id);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  const copyCommand = () => {
    void navigator.clipboard?.writeText("npx yolojsx Home.jsx");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCode = (code: string) => {
    void navigator.clipboard?.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const activeExample =
    EXAMPLES.find(({ id }) => id === activeExampleId) ?? EXAMPLES[0];
  const activeTheme =
    THEMES.find(({ id }) => id === activeThemeId) ?? THEMES[0];
  const activeFamily =
    THEME_FAMILIES.find(({ presets }) =>
      presets.some(({ id }) => id === activeTheme.id),
    ) ?? THEME_FAMILIES[0];
  const currentThemeIndex = THEMES.findIndex(({ id }) => id === activeTheme.id);
  const stepTheme = (offset: number) => {
    const nextIndex =
      (currentThemeIndex + offset + THEMES.length) % THEMES.length;
    setActiveThemeId(THEMES[nextIndex].id);
  };
  const ActiveExample = activeExample.component;
  const previewTheme: ThemeConfig = {
    ...activeTheme.antDesign,
    components: activeTheme.antDesign.components,
    algorithm:
      activeTheme.appearance === "dark"
        ? antdTheme.darkAlgorithm
        : antdTheme.defaultAlgorithm,
  };
  const loadPreview = (event: SyntheticEvent<HTMLIFrameElement>) => {
    const frameDocument = event.currentTarget.contentDocument;
    if (!frameDocument) return;
    const base = frameDocument.createElement("base");
    base.href = document.baseURI;
    const styles = [
      ...document.head.querySelectorAll(
        'link[rel="stylesheet"], style:not([data-rc-order])',
      ),
    ].map((node) => node.cloneNode(true));
    frameDocument.head.replaceChildren(base, ...styles);
    frameDocument.body.style.margin = "0";
    frameDocument.body.style.overflowX = "hidden";
    frameDocument.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      event.preventDefault();
      if (href.startsWith("#")) {
        const targetId = href.slice(1);
        if (targetId) {
          const el = frameDocument.getElementById(targetId);
          el?.scrollIntoView({ behavior: "smooth" });
        }
      } else if (
        anchor.target === "_blank" ||
        href.startsWith("http://") ||
        href.startsWith("https://")
      ) {
        window.open(href, "_blank", "noopener,noreferrer");
      }
    });
    setPreviewDocument(frameDocument);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-xl">
            <Avatar
              src={logo}
              shape="square"
              size="large"
              className="bg-transparent"
            />
            <span>yolojsx</span>
            <Tag color="blue">v{version}</Tag>
          </div>
          <Space size="medium">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground hidden sm:inline-block"
            >
              Features
            </a>
            <a
              href="#quickstart"
              className="text-muted-foreground hover:text-foreground hidden sm:inline-block"
            >
              Quickstart
            </a>
            <a
              href="#showcase"
              className="text-muted-foreground hover:text-foreground hidden sm:inline-block"
            >
              Showcase
            </a>
            <Button
              type="primary"
              icon={<LuGithub aria-hidden="true" />}
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
          <img
            src={logo}
            alt="yolojsx logo"
            className="mx-auto mb-2 h-36 w-36 object-contain drop-shadow-md"
          />
          <Badge
            count="Open Source CLI Tool"
            style={{ backgroundColor: "#57b926ff" }}
            className="mb-6"
          />
          <Typography.Title className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6">
            Build React JSX into portable HTML apps.
          </Typography.Title>
          <Typography.Paragraph
            type="secondary"
            className="text-xl leading-relaxed max-w-2xl mx-auto mb-8"
          >
            Zero configuration. Turn any single{" "}
            <code className="bg-code px-2 py-1 rounded text-primary">.jsx</code>{" "}
            component into a portable compressed HTML application with React 19,
            Tailwind CSS v4, and Ant Design 6.
          </Typography.Paragraph>

          {/* Terminal Command Box */}
          <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-4 shadow-card mb-8 flex items-center justify-between gap-4 font-mono text-sm">
            <span className="text-muted-foreground">
              ${" "}
              <span className="text-foreground font-semibold">
                npx yolojsx Home.jsx
              </span>
            </span>
            <Button
              size="small"
              type="default"
              icon={
                copied ? (
                  <LuCheck aria-hidden="true" />
                ) : (
                  <LuCopy aria-hidden="true" />
                )
              }
              onClick={copyCommand}
            >
              {copied ? "Copied! ✓" : "Copy"}
            </Button>
          </div>

          <Space size="large" wrap>
            <Button type="primary" size="large" href="#showcase">
              Explore Showcase
            </Button>
            <Button
              size="large"
              icon={<LuGithub aria-hidden="true" />}
              href="https://github.com/sirawats/yolojsx"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </Button>
          </Space>
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        className="px-6 py-20 bg-card/40 border-y border-border"
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Tag color="blue" className="mb-3">
              Everything Bundled
            </Tag>
            <Typography.Title level={2}>Why yolojsx?</Typography.Title>
            <Typography.Text type="secondary" className="text-base">
              Designed for developers who want to ship React components fast
              without build tool fatigue.
            </Typography.Text>
          </div>

          <Row gutter={[24, 24]}>
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <Col xs={24} md={12} lg={8} key={feat.title}>
                  <Card hoverable className="h-full border-border">
                    <Icon
                      aria-hidden="true"
                      className="mb-4 text-3xl text-primary"
                    />
                    <Typography.Title level={4} className="mb-2">
                      {feat.title}
                    </Typography.Title>
                    <Typography.Text type="secondary">
                      {feat.description}
                    </Typography.Text>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      </section>

      {/* Code Example Section */}
      <section id="quickstart" className="px-6 py-20 border-b border-border">
        <div className="mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <Tag color="green" className="mb-3">
                Simple Contract
              </Tag>
              <Typography.Title level={2}>
                Write React. Ship Single HTML.
              </Typography.Title>
              <Typography.Paragraph type="secondary" className="text-base">
                Create a standard React module exporting a default component.
                Import Ant Design components directly—yolojsx handles the
                bundling, CSS reset, and theme application automatically.
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
                <span className="text-xs text-muted-foreground ml-2 font-mono">
                  App.jsx
                </span>
              </div>
              <pre className="language-jsx p-4 text-xs font-mono text-foreground overflow-x-auto m-0 leading-relaxed">
                <code
                  className="language-jsx"
                  dangerouslySetInnerHTML={{
                    __html: highlightJsx(CODE_EXAMPLE),
                  }}
                />
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Showcase */}
      <section id="showcase" className="px-6 py-20 bg-card/40">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Tag color="purple" className="mb-3">
              Live Showcase
            </Tag>
            <Typography.Title level={2}>
              Examples, in every theme
            </Typography.Title>
            <Typography.Text type="secondary" className="text-base">
              Preview every packaged example with the complete theme catalog.
            </Typography.Text>
          </div>

          <Card className="border-border shadow-card">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,4fr)]">
              <nav
                aria-label="Examples"
                className="border-b border-border pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4"
              >
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
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Segmented
                      size="small"
                      options={["Desktop", "Mobile", "Code"]}
                      value={
                        previewMode === "desktop"
                          ? "Desktop"
                          : previewMode === "mobile"
                            ? "Mobile"
                            : "Code"
                      }
                      onChange={(value) => {
                        const mode = value.toLowerCase();
                        if (
                          mode === "desktop" ||
                          mode === "mobile" ||
                          mode === "code"
                        ) {
                          setPreviewMode(mode);
                        }
                      }}
                    />
                    <span className="text-xs font-semibold text-muted-foreground">
                      Variant
                    </span>
                    <Segmented
                      size="small"
                      options={activeFamily.presets.map((preset) => ({
                        label:
                          preset.name.slice(activeFamily.name.length).trim() ||
                          preset.name,
                        value: preset.id,
                      }))}
                      value={activeTheme.id}
                      onChange={setActiveThemeId}
                    />
                  </div>
                </div>

                <ThemePicker
                  themeFamilies={THEME_FAMILIES}
                  activeFamily={activeFamily}
                  onSelectTheme={setActiveThemeId}
                  onStepTheme={stepTheme}
                />

                <CliCommandBar
                  exampleId={activeExample.id}
                  themeId={activeTheme.id}
                />

                {previewMode === "code" && (
                  <div className="rounded-xl border border-border bg-card p-4 font-mono text-sm overflow-hidden">
                    <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-border">
                      <span className="text-xs text-muted-foreground font-semibold">
                        {activeExample.id}
                      </span>
                      <Button
                        size="small"
                        type="default"
                        icon={
                          codeCopied ? (
                            <LuCheck aria-hidden="true" />
                          ) : (
                            <LuCopy aria-hidden="true" />
                          )
                        }
                        onClick={() => copyCode(activeExample.code)}
                      >
                        {codeCopied ? "Copied! ✓" : "Copy Code"}
                      </Button>
                    </div>
                    <pre className="language-jsx max-h-[500px] overflow-auto text-foreground font-mono text-xs leading-relaxed p-2">
                      <code
                        className="language-jsx"
                        dangerouslySetInnerHTML={{
                          __html: highlightJsx(activeExample.code),
                        }}
                      />
                    </pre>
                  </div>
                )}
                <div
                  className={
                    previewMode === "code"
                      ? "hidden"
                      : "relative mx-auto w-full overflow-hidden rounded-xl border border-border bg-background"
                  }
                  style={{
                    aspectRatio:
                      previewMode === "desktop" ? "16 / 9" : "6 / 13",
                    maxWidth: previewMode === "mobile" ? "390px" : "none",
                  }}
                >
                  <iframe
                    title={`${activeExample.label} ${previewMode} preview`}
                    srcDoc="<!doctype html><html><head></head><body></body></html>"
                    onLoad={loadPreview}
                    className="absolute inset-0 block border-0 bg-background"
                    style={{
                      width: `calc(100% / ${PREVIEW_SCALE})`,
                      height: `calc(100% / ${PREVIEW_SCALE})`,
                      transform: `scale(${PREVIEW_SCALE})`,
                      transformOrigin: "top left",
                    }}
                  />
                </div>
                {previewDocument &&
                  createPortal(
                    <>
                      <style>{renderThemeCss(activeTheme)}</style>
                      <StyleProvider container={previewDocument.head} layer>
                        <ConfigProvider theme={previewTheme}>
                          <ActiveExample />
                        </ConfigProvider>
                      </StyleProvider>
                    </>,
                    previewDocument.body,
                  )}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-10 text-center text-muted-foreground text-sm">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="yolojsx logo"
              className="h-6 w-6 object-contain"
            />
            <span>
              © {new Date().getFullYear()} <strong>yolojsx</strong>. Released
              under the MIT License.
            </span>
          </div>
          <Space size="large">
            <a
              href="https://github.com/sirawats/yolojsx"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              GitHub Repository
            </a>
            <a
              href="https://npmjs.com/package/yolojsx"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              npm Package
            </a>
          </Space>
        </div>
      </footer>
    </main>
  );
}
