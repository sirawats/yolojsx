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
  Badge,
  Button,
  Card,
  ConfigProvider,
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
  LuBot,
  LuCheck,
  LuCopy,
  LuGithub,
  LuPalette,
  LuShapes,
  LuTerminal,
  LuZap,
} from "react-icons/lu";
import { IoPrismOutline } from "react-icons/io5";
import { SiAntdesign, SiReact, SiTailwindcss, SiVite } from "react-icons/si";
import Prism from "prismjs";
// @ts-expect-error PrismJS does not publish declarations for language modules.
import "prismjs/components/prism-jsx";
// @ts-expect-error PrismJS does not publish declarations for plugins.
import "prismjs/plugins/line-numbers/prism-line-numbers";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import brandArtwork from "../assets/chihuahua_archaeologist_artifact.png";
import favicon from "../assets/favicon-32x32.png";
import packageJson from "../package.json" with { type: "json" };
import { THEMES, renderThemeCss, type Theme } from "../src/themes.js";

const { version } = packageJson;

export const RTIFACT = {
  title: "Rtifact — Portable, interactive HTML artifacts from JSX",
  icon: favicon,
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

const FEATURES = (
  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
    <Card
      hoverable
      size="small"
      className="h-full overflow-hidden border-border shadow-card"
    >
      <article>
        <div>
          <span className="mb-4 grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <LuZap aria-hidden="true" className="text-xl" />
          </span>
          <Typography.Title level={3} className="mb-2 text-xl">
            Zero configuration
          </Typography.Title>
          <Typography.Paragraph
            type="secondary"
            className="mb-0 text-base leading-6"
          >
            Turn a standalone React JSX file into a portable HTML artifact—no
            Vite, Webpack, or project setup required.
          </Typography.Paragraph>
        </div>
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg border border-border bg-code p-3 text-left font-mono text-xs">
          <span>
            <span className="block text-muted-foreground">INPUT</span>
            <strong className="mt-1 block text-foreground">Report.jsx</strong>
          </span>
          <span aria-hidden="true" className="text-primary">
            →
          </span>
          <span>
            <span className="block text-muted-foreground">OUTPUT</span>
            <strong className="mt-1 block text-foreground">Report.html</strong>
          </span>
        </div>
      </article>
    </Card>

    <Card hoverable size="small" className="h-full border-border shadow-card">
      <article className="flex h-full flex-col">
        <div className="mb-4 flex items-start justify-between gap-4">
          <span className="grid size-10 place-items-center rounded-lg bg-success-background text-success">
            <LuArchive aria-hidden="true" className="text-xl" />
          </span>
          <Tag color="green">Default</Tag>
        </div>
        <Typography.Title level={3} className="mb-2 text-xl">
          One compressed portable .html
        </Typography.Title>
        <Typography.Paragraph
          type="secondary"
          className="mb-0 text-base leading-6"
        >
          JS, CSS, and local assets are gzip-compressed inside one portable
          .html artifact.
        </Typography.Paragraph>
      </article>
    </Card>

    <Card
      hoverable
      size="small"
      className="h-full overflow-hidden border-border shadow-card"
    >
      <article>
        <div>
          <span className="mb-4 grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <LuBot aria-hidden="true" className="text-xl" />
          </span>
          <Typography.Title level={3} className="mb-2 text-xl">
            Agent-first skills and plugins
          </Typography.Title>
          <div className="mb-4 rounded-lg border border-border bg-code p-3 text-left font-mono text-xs leading-5">
            <span className="mb-1 block text-muted-foreground">
              AGENT PROMPT
            </span>
            <code className="text-foreground">
              /rtifact Create an easy-to-read documentation guide I can send to
              my colleague.
            </code>
          </div>
          <Typography.Paragraph
            type="secondary"
            className="mb-0 text-base leading-6"
          >
            Official skills and plugins teach coding agents the supported stack,
            themes, CLI, and artifact conventions.
          </Typography.Paragraph>
        </div>
      </article>
    </Card>

    <Card hoverable size="small" className="h-full border-border">
      <article>
        <span className="mb-4 grid size-10 place-items-center rounded-lg bg-warning-background text-warning">
          <LuPalette aria-hidden="true" className="text-xl" />
        </span>
        <Typography.Title level={3} className="mb-2 text-xl">
          20+ theme presets
        </Typography.Title>
        <Typography.Paragraph type="secondary" className="text-base leading-6">
          Switch polished light and dark themes without changing application
          code.
        </Typography.Paragraph>
        <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
          <span className="rounded-md bg-code px-2 py-1">GitHub</span>
          <span className="rounded-md bg-code px-2 py-1">Material</span>
          <span className="rounded-md bg-code px-2 py-1">One Dark</span>
          <span className="rounded-md bg-code px-2 py-1">Catppuccin</span>
          <span className="rounded-md bg-code px-2 py-1">Everforest</span>
          <span className="rounded-md bg-code px-2 py-1 text-muted-foreground">
            + more
          </span>
        </div>
        <div aria-hidden="true" className="mt-5 flex gap-2">
          <span className="h-2 flex-1 rounded-full bg-primary" />
          <span className="h-2 flex-1 rounded-full bg-success" />
          <span className="h-2 flex-1 rounded-full bg-warning" />
          <span className="h-2 flex-1 rounded-full bg-danger" />
        </div>
      </article>
    </Card>

    <Card hoverable size="small" className="h-full border-border">
      <article>
        <span className="mb-4 grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
          <LuAtom aria-hidden="true" className="text-xl" />
        </span>
        <Typography.Title level={3} className="mb-2 text-xl">
          Full frontend stack
        </Typography.Title>
        <Typography.Paragraph type="secondary" className="text-base leading-6">
          Use React 19, Ant Design 6, Tailwind CSS v4, React Icons, and PrismJS.
          Vite handles the build.
        </Typography.Paragraph>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xl text-primary">
          <SiReact aria-label="React" />
          <SiVite aria-label="Vite" />
          <SiAntdesign aria-label="Ant Design" />
          <SiTailwindcss aria-label="Tailwind CSS" />
          <LuShapes aria-label="React Icons" />
          <IoPrismOutline aria-label="PrismJS" />
        </div>
      </article>
    </Card>

    <Card hoverable size="small" className="h-full border-border">
      <article>
        <div>
          <span className="mb-4 grid size-10 place-items-center rounded-lg bg-info-background text-info">
            <LuTerminal aria-hidden="true" className="text-xl" />
          </span>
          <Typography.Title level={3} className="mb-2 text-xl">
            One CLI, three output modes
          </Typography.Title>
          <Typography.Paragraph
            type="secondary"
            className="mb-0 text-base leading-6"
          >
            Pass one JSX or TSX entry. Rtifact writes a portable .html file by
            default; add a flag only when you need offline or directory output.
          </Typography.Paragraph>
        </div>
        <div className="mt-4 rounded-lg border border-border bg-code p-3 text-left text-xs">
          <code className="block font-mono text-foreground">
            $ rtifact Report.jsx
          </code>
          <div className="mt-4 grid gap-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Default</span>
              <code>Report.html</code>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Offline</span>
              <code>--self-contained</code>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Deploy</span>
              <code>--out-dir dist</code>
            </div>
          </div>
        </div>
      </article>
    </Card>
  </div>
);

const POWERED_BY = [
  ["React", SiReact],
  ["Vite", SiVite],
  ["Ant Design", SiAntdesign],
  ["TailwindCSS", SiTailwindcss],
  ["React Icons", LuShapes],
  ["PrismJS", IoPrismOutline],
] as const;

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

// The line-numbers plugin hook runs through highlightElement(), not highlight().
const highlightCodeElement = (element: HTMLElement | null) => {
  if (element) Prism.highlightElement(element);
};

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
  command,
  compact = false,
}: {
  command: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    void navigator.clipboard?.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={
        compact
          ? "mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/90 px-4 py-2.5 font-mono text-xs shadow-card"
          : "mx-auto mb-8 flex max-w-lg items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 font-mono text-sm shadow-card"
      }
    >
      <span
        className={
          compact
            ? "flex items-center gap-2 overflow-x-auto"
            : "text-muted-foreground"
        }
      >
        <span className={compact ? "font-bold text-primary" : undefined}>
          $
        </span>{" "}
        <span
          className={
            compact
              ? "font-medium text-foreground"
              : "font-semibold text-foreground"
          }
        >
          {command}
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
        onClick={copy}
      >
        {copied ? "Copied! ✓" : "Copy"}
      </Button>
    </div>
  );
}

export default function Website() {
  const [codeCopied, setCodeCopied] = useState(false);
  const [activeExampleId, setActiveExampleId] = useState(EXAMPLES[0].id);
  const [activeThemeId, setActiveThemeId] = useState(THEMES[0].id);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

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
    const frameWindow = frameDocument?.defaultView;
    if (!frameDocument || !frameWindow) return;
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
      if (!(event.target instanceof frameWindow.Element)) return;
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
            <img src={favicon} alt="" aria-hidden="true" className="size-8" />
            <span>Rtifact</span>
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
              href="https://github.com/sirawats/rtifact"
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
            src={brandArtwork}
            alt="Rtifact Chihuahua archaeologist uncovering an artifact"
            className="mx-auto mb-6 w-64 sm:w-72"
          />
          <Badge
            count="Open Source CLI Tool"
            style={{ backgroundColor: "#57b926ff" }}
            className="mb-6"
          />
          <Typography.Title className="text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Create .html Artifact from .jsx
          </Typography.Title>
          <Typography.Paragraph
            type="secondary"
            className="text-xl leading-relaxed max-w-2xl mx-auto mb-8"
          >
            Why write .html when you can write responsive .jsx? <br />
            Let your AI agent write artifacts in{" "}
            <code className="bg-code px-2 py-1 rounded text-primary">
              .jsx
            </code>{" "}
            and let{" "}
            <code className="bg-code px-2 py-1 rounded text-primary">
              rtifact
            </code>{" "}
            handle the rest.
          </Typography.Paragraph>

          <div className="mx-auto mb-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
            <span>Powered by</span>
            {POWERED_BY.map(([name, Icon]) => (
              <span key={name} className="flex items-center gap-1.5">
                <Icon aria-hidden="true" className="text-lg text-primary" />
                {name}
              </span>
            ))}
          </div>

          <CliCommandBar command="npx rtifact Home.jsx" />

          <Space size="large" wrap>
            <Button type="primary" size="large" href="#showcase">
              Explore Showcase
            </Button>
            <Button
              size="large"
              icon={<LuGithub aria-hidden="true" />}
              href="https://github.com/sirawats/rtifact"
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
            <Typography.Title level={2}>Why Rtifact?</Typography.Title>
            <Typography.Text type="secondary" className="text-base">
              Designed for agents that need to deliver readable, interactive
              results without maintaining a frontend project.
            </Typography.Text>
          </div>

          {FEATURES}
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
                Write JSX. Ship one artifact.
              </Typography.Title>
              <Typography.Paragraph type="secondary" className="text-base">
                Create a standard React module exporting a default component.
                Import Ant Design components directly—Rtifact handles the
                bundling, CSS reset, and theme application automatically.
              </Typography.Paragraph>

              <div className="mt-6">
                <div className="mb-2 flex items-center gap-2">
                  <strong>Run with npx</strong>
                  <Tag color="green">Recommended</Tag>
                </div>
                <CliCommandBar
                  compact
                  command="npx rtifact App.jsx --theme github-dark"
                />

                <strong className="mb-2 block">Or install globally</strong>
                <CliCommandBar compact command="npm install -g rtifact" />
                <Typography.Text type="secondary">
                  Then use <code>rtifact</code> directly in future commands.
                </Typography.Text>
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
                  compact
                  command={`npx rtifact ${activeExample.id} --theme ${activeTheme.id}`}
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
                    <pre className="language-jsx line-numbers max-h-[500px] overflow-auto text-foreground font-mono text-xs leading-relaxed p-2">
                      <code
                        key={activeExample.id}
                        ref={highlightCodeElement}
                        className="language-jsx"
                      >
                        {activeExample.code}
                      </code>
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
            <img src={favicon} alt="" aria-hidden="true" className="size-6" />
            <span>
              © {new Date().getFullYear()} <strong>Rtifact</strong>. Released
              under the MIT License.
            </span>
          </div>
          <Space size="large">
            <a
              href="https://github.com/sirawats/rtifact"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              GitHub Repository
            </a>
            <a
              href="https://npmjs.com/package/rtifact"
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
