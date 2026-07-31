import { useState } from "react";
import {
  Alert,
  Card,
  Col,
  Collapse,
  Empty,
  Input,
  Row,
  Segmented,
  Select,
  Statistic,
  Tag,
  Typography,
} from "antd";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import icon from "./favicon.svg";

export const YOLOJSX = {
  title: "API Regression Test Report",
  icon,
  prismTheme: "prism",
};

const tests = [
  {
    id: "AUTH-LOGIN-01",
    service: "Identity",
    method: "POST",
    path: "/v1/sessions",
    status: "Failed",
    duration: 842,
    summary: "Valid credentials return 500 instead of a session.",
    expected: "201 with an access token and five-minute expiry.",
    recommendation:
      "Handle the session-store timeout and return a retryable 503 response instead of exposing an internal error.",
    request: `{
  "email": "engineer@example.test",
  "password": "[redacted]"
}`,
    response: `{
  "status": 500,
  "code": "INTERNAL_ERROR",
  "requestId": "req_sample_7f3a"
}`,
  },
  {
    id: "ORDER-IDEMPOTENCY-02",
    service: "Checkout",
    method: "POST",
    path: "/v1/orders",
    status: "Failed",
    duration: 311,
    summary: "A repeated idempotency key creates a second order.",
    expected: "200 with the original order and no additional charge.",
    recommendation:
      "Store the completed response against the idempotency key before acknowledging the first request.",
    request: `{
  "cartId": "cart_sample_42",
  "idempotencyKey": "idem_sample_repeat"
}`,
    response: `{
  "status": 201,
  "orderId": "ord_sample_duplicate",
  "charged": true
}`,
  },
  {
    id: "REFUND-LIMIT-03",
    service: "Payments",
    method: "POST",
    path: "/v1/refunds",
    status: "Failed",
    duration: 194,
    summary: "A refund above the captured amount is accepted.",
    expected: "422 with an AMOUNT_EXCEEDS_CAPTURE validation error.",
    recommendation:
      "Validate the cumulative refund amount in the same transaction that records the refund.",
    request: `{
  "paymentId": "pay_sample_19",
  "amount": 12500
}`,
    response: `{
  "status": 202,
  "refundId": "ref_sample_88",
  "amount": 12500
}`,
  },
  {
    id: "CATALOG-READ-04",
    service: "Catalog",
    method: "GET",
    path: "/v1/products/sample-chair",
    status: "Passed",
    duration: 76,
    summary: "Published product details match the response contract.",
    expected: "200 with price, availability, and version fields.",
    request: `{
  "headers": {
    "accept": "application/json"
  }
}`,
    response: `{
  "status": 200,
  "sku": "sample-chair",
  "available": true,
  "version": 12
}`,
  },
  {
    id: "PROFILE-AUTH-05",
    service: "Identity",
    method: "GET",
    path: "/v1/profile",
    status: "Passed",
    duration: 91,
    summary: "An expired token is rejected without returning profile data.",
    expected: "401 with no user fields in the response.",
    request: `{
  "authorization": "Bearer [expired sample token]"
}`,
    response: `{
  "status": 401,
  "code": "TOKEN_EXPIRED"
}`,
  },
  {
    id: "HEALTH-READY-06",
    service: "Platform",
    method: "GET",
    path: "/health/ready",
    status: "Passed",
    duration: 28,
    summary: "Readiness reports healthy dependencies.",
    expected: "200 with ready status.",
    request: `{
  "headers": {
    "accept": "application/json"
  }
}`,
    response: `{
  "status": 200,
  "ready": true
}`,
  },
];

const services = ["All", ...new Set(tests.map(({ service }) => service))];
const failures = tests.filter(({ status }) => status === "Failed");

function JsonBlock({ label, value }) {
  const html = Prism.highlight(value, Prism.languages.json, "json");
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <Typography.Text strong>{label}</Typography.Text>
        <Typography.Text copyable={{ text: value }}>Copy JSON</Typography.Text>
      </div>
      <pre className="language-json overflow-x-auto" tabIndex={0}>
        <code
          className="language-json"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </pre>
    </div>
  );
}

export default function APITestReport() {
  const [status, setStatus] = useState("All");
  const [service, setService] = useState("All");
  const [query, setQuery] = useState("");

  const visibleTests = tests.filter((test) => {
    const matchesStatus = status === "All" || test.status === status;
    const matchesService = service === "All" || test.service === service;
    const searchable =
      `${test.id} ${test.service} ${test.method} ${test.path} ${test.summary}`.toLowerCase();
    return (
      matchesStatus &&
      matchesService &&
      searchable.includes(query.trim().toLowerCase())
    );
  });

  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-card px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <Typography.Text
              type="secondary"
              className="font-mono text-xs uppercase tracking-[0.16em]"
            >
              Sample report · staging · build 2026.07.30
            </Typography.Text>
            <div className="mt-1 font-semibold">Checkout API regression</div>
          </div>
          <Tag color="red">Release blocked</Tag>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[210px_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <nav aria-label="Report sections">
            <Typography.Text strong>On this page</Typography.Text>
            <ol className="mt-3 grid gap-1 text-sm text-muted-foreground">
              {[
                ["summary", "Summary"],
                ["failures", "Blocking failures"],
                ["evidence", "Test evidence"],
                ["method", "Method"],
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
            <Typography.Text strong>Audience</Typography.Text>
            <Typography.Paragraph
              type="secondary"
              className="mb-0 mt-2 text-sm leading-6"
            >
              Engineering owners fixing the three failed contract and safety
              checks.
            </Typography.Paragraph>
          </Card>
        </aside>

        <article className="min-w-0">
          <section id="summary" aria-labelledby="summary-heading">
            <Typography.Title id="summary-heading">
              Fix three API regressions before release
            </Typography.Title>
            <Typography.Paragraph className="max-w-3xl text-lg leading-8">
              Identity error handling, order idempotency, and refund limits need
              correction. The remaining checks in this illustrative run passed.
            </Typography.Paragraph>
            <Alert
              type="warning"
              showIcon
              title="Recommendation: do not promote this build"
              description="Re-run the three failed cases after their owners deploy fixes; the evidence below contains sanitized sample payloads."
            />
            <Row gutter={[16, 16]} className="mt-5">
              <Col xs={12} md={6}>
                <Card>
                  <Statistic title="Tests" value={tests.length} />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card>
                  <Statistic
                    title="Passed"
                    value={tests.length - failures.length}
                    valueStyle={{ color: "var(--color-success)" }}
                  />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card>
                  <Statistic
                    title="Failed"
                    value={failures.length}
                    valueStyle={{ color: "var(--color-danger)" }}
                  />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card>
                  <Statistic title="Duration" value={1.54} suffix="s" />
                </Card>
              </Col>
            </Row>
          </section>

          <section
            id="failures"
            aria-labelledby="failures-heading"
            className="mt-10"
          >
            <Typography.Title id="failures-heading" level={2}>
              Blocking failures
            </Typography.Title>
            <div className="grid gap-3">
              {failures.map((test) => (
                <Card key={test.id} size="small">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Typography.Text type="secondary" className="font-mono">
                        {test.id} · {test.service}
                      </Typography.Text>
                      <Typography.Title level={3} className="mb-1 mt-1 text-lg">
                        {test.summary}
                      </Typography.Title>
                      <Typography.Paragraph className="mb-0 max-w-3xl">
                        <strong>Fix:</strong> {test.recommendation}
                      </Typography.Paragraph>
                    </div>
                    <Tag color="red">{test.method}</Tag>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section
            id="evidence"
            aria-labelledby="evidence-heading"
            className="mt-10"
          >
            <Typography.Title id="evidence-heading" level={2}>
              Test evidence
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="max-w-3xl">
              Filter the run, then expand only the request and response details
              needed for diagnosis.
            </Typography.Paragraph>
            <div className="mb-5 grid gap-3 md:grid-cols-[auto_180px_minmax(220px,1fr)]">
              <Segmented
                aria-label="Filter tests by status"
                options={["All", "Failed", "Passed"]}
                value={status}
                onChange={setStatus}
              />
              <Select
                aria-label="Filter tests by service"
                options={services.map((value) => ({ value, label: value }))}
                value={service}
                onChange={setService}
              />
              <Input
                aria-label="Search tests"
                allowClear
                placeholder="Search ID, endpoint, or finding"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            {visibleTests.length ? (
              <Collapse
                items={visibleTests.map((test) => ({
                  key: test.id,
                  label: (
                    <span className="flex flex-wrap items-center gap-2">
                      <Tag color={test.status === "Failed" ? "red" : "green"}>
                        {test.status}
                      </Tag>
                      <code>{test.method}</code>
                      <strong>{test.path}</strong>
                      <Typography.Text type="secondary">
                        {test.duration} ms
                      </Typography.Text>
                    </span>
                  ),
                  children: (
                    <div>
                      <Typography.Paragraph>
                        {test.summary}
                      </Typography.Paragraph>
                      <Typography.Paragraph>
                        <strong>Expected:</strong> {test.expected}
                      </Typography.Paragraph>
                      {test.recommendation && (
                        <Alert
                          type="warning"
                          title="Recommended fix"
                          description={test.recommendation}
                          className="mb-5"
                        />
                      )}
                      <div className="grid gap-5 xl:grid-cols-2">
                        <JsonBlock label="Request" value={test.request} />
                        <JsonBlock label="Response" value={test.response} />
                      </div>
                    </div>
                  ),
                }))}
              />
            ) : (
              <Empty description="No tests match these filters" />
            )}
          </section>

          <section
            id="method"
            aria-labelledby="method-heading"
            className="mt-10"
          >
            <Typography.Title id="method-heading" level={2}>
              Method and limitations
            </Typography.Title>
            <Typography.Paragraph className="max-w-3xl leading-7">
              This gallery artifact uses invented endpoints, identifiers, and
              sanitized payloads. It demonstrates report structure rather than a
              live test system. A real report should name its environment, test
              command, revision, and data-handling policy.
            </Typography.Paragraph>
          </section>
        </article>
      </div>
    </main>
  );
}
