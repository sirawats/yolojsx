import { useState } from "react";
import {
  Alert,
  Card,
  Col,
  Collapse,
  Empty,
  Input,
  Row,
  Select,
  Statistic,
  Tag,
  Typography,
} from "antd";
import Prism from "prismjs";
import "prismjs/components/prism-diff";
import icon from "./favicon.svg";

export const YOLOJSX = {
  title: "Code Review Report",
  icon,
  prismTheme: "prism",
};

const findings = [
  {
    id: "CR-01",
    severity: "Blocking",
    file: "src/orders.ts",
    line: 84,
    title: "Idempotency record is written after the charge",
    impact:
      "Two concurrent requests can both charge the customer before either request records the shared key.",
    evidence:
      "The payment call completes before the transaction that inserts the idempotency record.",
    recommendation:
      "Claim the idempotency key transactionally before calling the payment provider, then return the stored result to duplicates.",
    patch: `- const charge = await payments.capture(input);
- await idempotency.save(input.key, charge);
+ const claim = await idempotency.claim(input.key);
+ if (claim.completed) return claim.result;
+ const charge = await payments.capture(input);
+ await idempotency.complete(input.key, charge);`,
  },
  {
    id: "CR-02",
    severity: "Blocking",
    file: "src/webhook.ts",
    line: 41,
    title: "Webhook signature is checked after JSON parsing",
    impact:
      "Parsing changes the signed byte sequence, so valid signatures can fail and untrusted input is processed too early.",
    evidence:
      "The handler calls request.json() before passing a re-serialized body to signature verification.",
    recommendation:
      "Read the raw body once, verify it, and only then parse the verified bytes as JSON.",
    patch: `- const event = await request.json();
- verifySignature(JSON.stringify(event), signature);
+ const body = await request.text();
+ verifySignature(body, signature);
+ const event = JSON.parse(body);`,
  },
  {
    id: "CR-03",
    severity: "Warning",
    file: "src/orders.ts",
    line: 119,
    title: "Provider errors lose their retryability",
    impact:
      "Every provider failure becomes a generic 500, preventing clients from distinguishing a retryable outage.",
    evidence:
      "The catch block replaces typed provider errors with Error('Payment failed').",
    recommendation:
      "Preserve the known timeout code and map it to the existing retryable service-unavailable response.",
    patch: `- throw new Error("Payment failed");
+ if (error.code === "PAYMENT_TIMEOUT") throw error;
+ throw new OrderError("PAYMENT_FAILED", { cause: error });`,
  },
  {
    id: "CR-04",
    severity: "Warning",
    file: "test/orders.test.ts",
    line: 132,
    title: "The duplicate-request test is sequential",
    impact:
      "The test proves replay behavior but does not exercise the concurrency window that caused the incident.",
    evidence:
      "The second request begins only after the first promise has resolved.",
    recommendation:
      "Start both requests before awaiting either result and assert that the provider receives one capture.",
    patch: `- await createOrder(input);
- await createOrder(input);
+ await Promise.all([
+   createOrder(input),
+   createOrder(input),
+ ]);`,
  },
  {
    id: "CR-05",
    severity: "Suggestion",
    file: "src/orders.ts",
    line: 18,
    title: "Name the idempotency retention period",
    impact:
      "The unexplained numeric duration makes the cleanup policy harder to review.",
    evidence: "The module passes 86400 directly to the store.",
    recommendation:
      "Replace the literal with a module-level constant named for the one-day retention policy.",
    patch: `+ const IDEMPOTENCY_RETENTION_SECONDS = 24 * 60 * 60;

- await idempotency.expire(key, 86400);
+ await idempotency.expire(key, IDEMPOTENCY_RETENTION_SECONDS);`,
  },
];

const severityColor = {
  Blocking: "red",
  Warning: "gold",
  Suggestion: "blue",
};
const files = ["All files", ...new Set(findings.map(({ file }) => file))];

function DiffBlock({ value }) {
  const html = Prism.highlight(value, Prism.languages.diff, "diff");
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <Typography.Text strong>Illustrative change</Typography.Text>
        <Typography.Text copyable={{ text: value }}>Copy diff</Typography.Text>
      </div>
      <pre className="language-diff overflow-x-auto" tabIndex={0}>
        <code
          className="language-diff"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </pre>
    </div>
  );
}

export default function CodeReviewReport() {
  const [severity, setSeverity] = useState("All severities");
  const [file, setFile] = useState("All files");
  const [query, setQuery] = useState("");

  const visibleFindings = findings.filter((finding) => {
    const matchesSeverity =
      severity === "All severities" || finding.severity === severity;
    const matchesFile = file === "All files" || finding.file === file;
    const searchable =
      `${finding.id} ${finding.file} ${finding.title} ${finding.impact}`.toLowerCase();
    return (
      matchesSeverity &&
      matchesFile &&
      searchable.includes(query.trim().toLowerCase())
    );
  });

  const counts = Object.fromEntries(
    ["Blocking", "Warning", "Suggestion"].map((name) => [
      name,
      findings.filter(({ severity: value }) => value === name).length,
    ]),
  );

  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-card px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <Typography.Text
              type="secondary"
              className="font-mono text-xs uppercase tracking-[0.16em]"
            >
              Sample review · checkout/idempotency
            </Typography.Text>
            <div className="mt-1 font-semibold">Pull request review</div>
          </div>
          <Tag color="red">Changes requested</Tag>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[210px_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <nav aria-label="Review sections">
            <Typography.Text strong>On this page</Typography.Text>
            <ol className="mt-3 grid gap-1 text-sm text-muted-foreground">
              {[
                ["verdict", "Verdict"],
                ["findings", "Findings"],
                ["strengths", "What is working"],
                ["method", "Review scope"],
              ].map(([id, label]) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="block rounded-md px-3 py-2 hover:bg-card hover:text-foreground"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <Card size="small" className="mt-6">
            <Typography.Text strong>Next action</Typography.Text>
            <Typography.Paragraph
              type="secondary"
              className="mb-0 mt-2 text-sm leading-6"
            >
              Resolve CR-01 and CR-02, add the concurrent regression test, then
              request another review.
            </Typography.Paragraph>
          </Card>
        </aside>

        <article className="min-w-0">
          <section id="verdict" aria-labelledby="verdict-heading">
            <Typography.Title id="verdict-heading">
              Do not merge until two blockers are resolved
            </Typography.Title>
            <Typography.Paragraph className="max-w-3xl text-lg leading-8">
              The change improves replay handling, but it still permits
              duplicate charges under concurrency and verifies webhooks too
              late.
            </Typography.Paragraph>
            <Alert
              type="warning"
              showIcon
              title="Changes requested"
              description="Fix both blocking findings and protect the concurrency path with a regression test. Warnings may follow in the same patch."
            />
            <Row gutter={[16, 16]} className="mt-5">
              <Col xs={12} md={6}>
                <Card>
                  <Statistic title="Findings" value={findings.length} />
                </Card>
              </Col>
              {["Blocking", "Warning", "Suggestion"].map((name) => (
                <Col key={name} xs={12} md={6}>
                  <Card>
                    <Statistic
                      title={name}
                      value={counts[name]}
                      valueStyle={{
                        color:
                          name === "Blocking"
                            ? "var(--color-danger)"
                            : undefined,
                      }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </section>

          <section
            id="findings"
            aria-labelledby="findings-heading"
            className="mt-10"
          >
            <Typography.Title id="findings-heading" level={2}>
              Findings and suggested fixes
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="max-w-3xl">
              Filter by severity or file, then expand a finding for its evidence
              and smallest suggested correction.
            </Typography.Paragraph>
            <div className="mb-5 grid gap-3 md:grid-cols-[170px_220px_minmax(220px,1fr)]">
              <Select
                aria-label="Filter findings by severity"
                value={severity}
                onChange={setSeverity}
                options={["All severities", ...Object.keys(severityColor)].map(
                  (value) => ({ value, label: value }),
                )}
              />
              <Select
                aria-label="Filter findings by file"
                value={file}
                onChange={setFile}
                options={files.map((value) => ({ value, label: value }))}
              />
              <Input
                aria-label="Search review findings"
                allowClear
                placeholder="Search finding, file, or impact"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            {visibleFindings.length ? (
              <Collapse
                defaultActiveKey={["CR-01", "CR-02"]}
                items={visibleFindings.map((finding) => ({
                  key: finding.id,
                  label: (
                    <span className="flex flex-wrap items-center gap-2">
                      <Tag color={severityColor[finding.severity]}>
                        {finding.severity}
                      </Tag>
                      <strong>{finding.title}</strong>
                      <Typography.Text type="secondary" className="font-mono">
                        {finding.file}:{finding.line}
                      </Typography.Text>
                    </span>
                  ),
                  children: (
                    <div>
                      <dl className="mb-5 grid gap-3 sm:grid-cols-[7rem_1fr]">
                        <dt className="font-semibold">Impact</dt>
                        <dd className="mb-0">{finding.impact}</dd>
                        <dt className="font-semibold">Evidence</dt>
                        <dd className="mb-0">{finding.evidence}</dd>
                        <dt className="font-semibold">Fix</dt>
                        <dd className="mb-0">{finding.recommendation}</dd>
                      </dl>
                      <DiffBlock value={finding.patch} />
                    </div>
                  ),
                }))}
              />
            ) : (
              <Empty description="No findings match these filters" />
            )}
          </section>

          <section
            id="strengths"
            aria-labelledby="strengths-heading"
            className="mt-10"
          >
            <Typography.Title id="strengths-heading" level={2}>
              What is working
            </Typography.Title>
            <ul className="max-w-3xl space-y-2 leading-7">
              <li>The public handler contract remains unchanged.</li>
              <li>
                Known replay responses preserve their original status code.
              </li>
              <li>
                New test names describe customer-visible behavior instead of
                implementation details.
              </li>
            </ul>
          </section>

          <section
            id="method"
            aria-labelledby="method-heading"
            className="mt-10"
          >
            <Typography.Title id="method-heading" level={2}>
              Review scope and limitations
            </Typography.Title>
            <Typography.Paragraph className="max-w-3xl leading-7">
              This is an illustrative report with fictional files and findings.
              A real review should name its revision, requirements, executed
              checks, and unreviewed areas. Suggested diffs require validation
              in the actual repository before use.
            </Typography.Paragraph>
          </section>
        </article>
      </div>
    </main>
  );
}
