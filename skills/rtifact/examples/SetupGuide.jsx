import { useState } from "react";
import {
  Alert,
  Card,
  Checkbox,
  Collapse,
  Progress,
  Steps,
  Tag,
  Typography,
} from "antd";
import Prism from "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import icon from "./favicon.svg";

export const RTIFACT = {
  title: "Local API Setup Guide",
  icon,
  prismTheme: "prism",
};

const stages = [
  {
    id: "prerequisites",
    title: "Check prerequisites",
    description: "Confirm the supported Node version and package manager.",
    language: "bash",
    command: `node --version
npm --version`,
    verify: "Node prints v22.13.0 or newer and npm exits without an error.",
  },
  {
    id: "install",
    title: "Install dependencies",
    description: "Use the lockfile-exact install from the repository root.",
    language: "bash",
    command: `npm ci`,
    verify: "The command completes without changing package-lock.json.",
  },
  {
    id: "configure",
    title: "Create local configuration",
    description:
      "Copy the checked-in sample, then use non-production placeholder values.",
    language: "bash",
    command: `cp .env.example .env.local
# Edit .env.local; never commit credentials`,
    verify:
      "The local file exists, remains ignored by Git, and contains no production secret.",
  },
  {
    id: "start",
    title: "Start and verify the API",
    description: "Run the service, then check its readiness endpoint.",
    language: "bash",
    command: `npm run dev

# In a second terminal
curl --fail http://localhost:3000/health/ready`,
    verify: 'The endpoint returns {"ready":true} with HTTP 200.',
  },
];

const troubleshooting = [
  {
    key: "port",
    label: "Port 3000 is already in use",
    children: (
      <Typography.Paragraph className="mb-0">
        Stop the conflicting local process or set the documented development
        port in <code>.env.local</code>. Do not kill an unknown shared process.
      </Typography.Paragraph>
    ),
  },
  {
    key: "install",
    label: "The lockfile install fails",
    children: (
      <Typography.Paragraph className="mb-0">
        Confirm the supported Node version, remove no files, and capture the
        first package-manager error for the repository owner. Do not replace{" "}
        <code>npm ci</code> with an unlocked install.
      </Typography.Paragraph>
    ),
  },
  {
    key: "health",
    label: "Readiness returns 503",
    children: (
      <Typography.Paragraph className="mb-0">
        Read the response body and service logs for the named dependency. Check
        local configuration before retrying; a 503 means the process started but
        is not ready.
      </Typography.Paragraph>
    ),
  },
];

function CodeBlock({ language, value }) {
  const html = Prism.highlight(value, Prism.languages[language], language);
  return (
    <div>
      <div className="mb-2 flex justify-end">
        <Typography.Text copyable={{ text: value }}>
          Copy commands
        </Typography.Text>
      </div>
      <pre className={`language-${language} overflow-x-auto`} tabIndex={0}>
        <code
          className={`language-${language}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </pre>
    </div>
  );
}

export default function SetupGuide() {
  const [completed, setCompleted] = useState([]);
  const percent = Math.round((completed.length / stages.length) * 100);
  const firstIncomplete = stages.findIndex(({ id }) => !completed.includes(id));
  const current = firstIncomplete === -1 ? stages.length : firstIncomplete;

  function setStage(id, checked) {
    setCompleted((currentCompleted) =>
      checked
        ? [...currentCompleted, id]
        : currentCompleted.filter((value) => value !== id),
    );
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-card px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <Typography.Text
              type="secondary"
              className="font-mono text-xs uppercase tracking-[0.16em]"
            >
              Sample internal guide
            </Typography.Text>
            <div className="mt-1 font-semibold">Orders API · local setup</div>
          </div>
          <Tag color="blue">About 15 minutes</Tag>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Typography.Text strong>Progress</Typography.Text>
          <Progress
            percent={percent}
            status={percent === 100 ? "success" : "active"}
            className="mt-3"
          />
          <nav aria-label="Setup stages" className="mt-6">
            <ol className="grid gap-1 text-sm text-muted-foreground">
              {stages.map(({ id, title }, index) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="block rounded-md px-3 py-2 hover:bg-card hover:text-foreground"
                  >
                    {index + 1}. {title}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#troubleshooting"
                  className="block rounded-md px-3 py-2 hover:bg-card hover:text-foreground"
                >
                  Troubleshooting
                </a>
              </li>
            </ol>
          </nav>
        </aside>

        <article className="min-w-0">
          <Typography.Title>Run the Orders API locally</Typography.Title>
          <Typography.Paragraph className="max-w-3xl text-lg leading-8">
            Follow four verifiable stages. You are done when the local readiness
            endpoint returns HTTP 200 with <code>{`{"ready":true}`}</code>.
          </Typography.Paragraph>
          <Alert
            type="info"
            showIcon
            title="Use local credentials only"
            description="Commands and values are illustrative. Follow the repository's real README when its requirements differ, and never paste production secrets into a generated artifact."
          />

          <Card className="mt-5">
            <Steps
              current={current}
              items={stages.map(({ title }) => ({ title }))}
              responsive
            />
          </Card>

          <div className="mt-8 grid gap-6">
            {stages.map((stage, index) => (
              <section
                id={stage.id}
                key={stage.id}
                aria-labelledby={`${stage.id}-heading`}
              >
                <Card>
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Typography.Text
                        type="secondary"
                        className="font-mono text-xs uppercase tracking-wider"
                      >
                        Stage {index + 1}
                      </Typography.Text>
                      <Typography.Title
                        id={`${stage.id}-heading`}
                        level={2}
                        className="mb-1 mt-1"
                      >
                        {stage.title}
                      </Typography.Title>
                      <Typography.Paragraph
                        type="secondary"
                        className="mb-0 max-w-2xl"
                      >
                        {stage.description}
                      </Typography.Paragraph>
                    </div>
                    <Checkbox
                      checked={completed.includes(stage.id)}
                      onChange={(event) =>
                        setStage(stage.id, event.target.checked)
                      }
                    >
                      Complete
                    </Checkbox>
                  </div>
                  <CodeBlock language={stage.language} value={stage.command} />
                  <Alert
                    className="mt-4"
                    type="success"
                    title="Verification"
                    description={stage.verify}
                  />
                </Card>
              </section>
            ))}
          </div>

          {percent === 100 && (
            <Alert
              className="mt-6"
              type="success"
              showIcon
              title="Local setup checklist complete"
              description="The checklist is local page state, not proof from the service. Confirm the readiness response before beginning development."
            />
          )}

          <section
            id="troubleshooting"
            aria-labelledby="troubleshooting-heading"
            className="mt-10"
          >
            <Typography.Title id="troubleshooting-heading" level={2}>
              Troubleshooting
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="max-w-3xl">
              Start with the visible error and change only the failing layer.
            </Typography.Paragraph>
            <Collapse items={troubleshooting} />
          </section>

          <section className="mt-10" aria-labelledby="guide-limitations">
            <Typography.Title id="guide-limitations" level={2}>
              About this example
            </Typography.Title>
            <Typography.Paragraph className="max-w-3xl leading-7">
              This guide uses a fictional service and keeps progress only until
              the page is refreshed. It demonstrates navigation, copyable
              commands, verification steps, and progressive disclosure without
              pretending to inspect the reader&apos;s machine.
            </Typography.Paragraph>
          </section>
        </article>
      </div>
    </main>
  );
}
