import { Alert, Card, Divider, Table, Tag, Timeline, Typography } from "antd";
import icon from "./favicon.svg";

export const YOLOJSX = {
  title: "RFC 042 — Session Architecture v2",
  icon,
};

const sections = [
  ["decision", "Decision"],
  ["context", "Context"],
  ["architecture", "Architecture"],
  ["requirements", "Requirements"],
  ["risks", "Risks"],
  ["rollout", "Rollout"],
];

const comparison = [
  {
    concern: "Request-time dependency",
    current: "Central session service on every protected request",
    proposed: "Local token verification plus a regional revocation check",
  },
  {
    concern: "Cross-region traffic",
    current: "Required when the session service is outside the request region",
    proposed: "None on the normal authorization path",
  },
  {
    concern: "Revocation",
    current: "Immediate after the central write completes",
    proposed: "Target: effective in every region within 60 seconds",
  },
  {
    concern: "Control-plane outage",
    current: "Healthy application traffic can lose authorization",
    proposed: "Gateways continue with cached keys and revocation state",
  },
];

const requirements = [
  {
    id: "AUTH-01",
    requirement: "Rotate signing keys without downtime",
    priority: "Must",
    design: "Publish old and new keys together for a 10-minute overlap.",
    evidence: "Rotation integration test",
    status: "Covered",
  },
  {
    id: "AUTH-02",
    requirement: "Revoke a session in every region within 60 seconds",
    priority: "Must",
    design: "Push session IDs to each regional deny list.",
    evidence: "Multi-region revocation drill",
    status: "Open gate",
  },
  {
    id: "AUTH-03",
    requirement: "Expose device-level session history",
    priority: "Should",
    design: "Retain issue, refresh, and revoke events in the identity core.",
    evidence: "Post-launch product review",
    status: "Deferred",
  },
];

const statusColor = {
  Covered: "green",
  "Open gate": "gold",
  Deferred: "default",
};

const requirementColumns = [
  { title: "ID", dataIndex: "id", width: 100 },
  { title: "Requirement", dataIndex: "requirement", width: 250 },
  { title: "Priority", dataIndex: "priority", width: 90 },
  { title: "Design response", dataIndex: "design", width: 300 },
  { title: "Required evidence", dataIndex: "evidence", width: 230 },
  {
    title: "Status",
    dataIndex: "status",
    width: 110,
    render: (status) => <Tag color={statusColor[status]}>{status}</Tag>,
  },
];

const risks = [
  {
    risk: "Revocation propagation exceeds 60 seconds",
    impact: "A revoked session may remain authorized in one region.",
    control:
      "Measure end-to-end propagation, alert at 45 seconds, and stop the rollout on any breach.",
  },
  {
    risk: "A gateway serves a stale signing-key set",
    impact: "New tokens may be rejected during rotation.",
    control:
      "Keep both keys published for 10 minutes and refresh cached keys before promotion.",
  },
  {
    risk: "The regional deny list grows without bound",
    impact: "Authorization latency and memory use can rise.",
    control:
      "Expire entries with their access tokens and track list size per region.",
  },
];

const rollout = [
  {
    color: "blue",
    children: (
      <>
        <strong>Week 1 · Shadow in one region</strong>
        <br />
        <Typography.Text type="secondary">
          Compare local decisions with the central service. Exit when mismatches
          are explained and the key-rotation test passes.
        </Typography.Text>
      </>
    ),
  },
  {
    color: "gold",
    children: (
      <>
        <strong>Weeks 2–3 · Ramp from 5% to 25%</strong>
        <br />
        <Typography.Text type="secondary">
          Run multi-region revocation drills at each step. Pause if p99
          propagation exceeds 60 seconds.
        </Typography.Text>
      </>
    ),
  },
  {
    color: "gray",
    children: (
      <>
        <strong>Weeks 4–6 · Expand, then remove synchronous lookups</strong>
        <br />
        <Typography.Text type="secondary">
          Reach all regions before retiring the old path. Roll back by restoring
          synchronous checks; do not invalidate active tokens.
        </Typography.Text>
      </>
    ),
  },
];

export default function Techspec() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-card px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <Typography.Text
              type="secondary"
              className="font-mono text-xs uppercase tracking-[0.18em]"
            >
              RFC 042 · Identity Platform
            </Typography.Text>
            <div className="mt-1 font-semibold">Technical decision record</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Tag>Sample document</Tag>
            <Tag color="gold">Conditional approval</Tag>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <nav aria-label="RFC sections">
            <Typography.Text strong>On this page</Typography.Text>
            <ol className="mt-3 grid gap-1 text-sm text-muted-foreground">
              {sections.map(([id, label], index) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="block rounded-md px-3 py-2 hover:bg-card hover:text-foreground"
                  >
                    {String(index + 1).padStart(2, "0")} · {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <Card size="small" className="mt-6">
            <Typography.Text strong>About this artifact</Typography.Text>
            <Typography.Paragraph
              type="secondary"
              className="mb-0 mt-2 text-sm leading-6"
            >
              Illustrative RFC content for the yolojsx gallery. Statuses and
              dates are sample data, not a live review workflow.
            </Typography.Paragraph>
          </Card>
        </aside>

        <article className="min-w-0">
          <section id="decision" aria-labelledby="decision-heading">
            <Typography.Title id="decision-heading" className="mb-3">
              Session architecture v2
            </Typography.Title>
            <Typography.Paragraph
              type="secondary"
              className="max-w-3xl text-lg leading-8"
            >
              Adopt short-lived signed access tokens with regional revocation
              lists, removing the central session service from the normal
              authorization path.
            </Typography.Paragraph>

            <Alert
              className="mt-5"
              type="warning"
              showIcon
              message="Decision: approve implementation behind a feature flag"
              description="Production rollout remains blocked until a multi-region drill proves that revocation reaches every region within 60 seconds."
            />

            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["Selected design", "Hybrid token model"],
                ["Performance target", "Authorization p99 < 25 ms"],
                ["Planned rollout", "6 weeks with explicit gates"],
              ].map(([label, value]) => (
                <Card key={label} size="small">
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mb-0 mt-1 font-semibold">{value}</dd>
                </Card>
              ))}
            </dl>
          </section>

          <Divider />

          <section id="context" aria-labelledby="context-heading">
            <Typography.Title level={2} id="context-heading">
              Context and tradeoff
            </Typography.Title>
            <Typography.Paragraph className="max-w-3xl leading-7">
              Today, every protected request asks a central service whether its
              session is valid. That model makes revocation easy to reason
              about, but adds a cross-region dependency and turns control-plane
              maintenance into an application availability risk.
            </Typography.Paragraph>
            <blockquote className="max-w-3xl">
              A revoked session must stop authorizing quickly, while an
              unavailable control plane must not stop otherwise healthy traffic.
            </blockquote>

            <Typography.Title level={3} className="mt-7">
              Current and proposed behavior
            </Typography.Title>
            <Table
              columns={[
                { title: "Concern", dataIndex: "concern", width: 190 },
                { title: "Current", dataIndex: "current", width: 310 },
                { title: "Proposed", dataIndex: "proposed", width: 330 },
              ]}
              dataSource={comparison}
              pagination={false}
              rowKey="concern"
              scroll={{ x: 830 }}
              size="small"
            />
          </section>

          <Divider />

          <section id="architecture" aria-labelledby="architecture-heading">
            <Typography.Title level={2} id="architecture-heading">
              Proposed architecture
            </Typography.Title>
            <Typography.Paragraph className="max-w-3xl" type="secondary">
              The request path uses local or regional state; the identity core
              stays responsible for lifecycle changes.
            </Typography.Paragraph>
            <ol className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                [
                  "01",
                  "Identity core",
                  "Issues five-minute access tokens, refreshes sessions, publishes signing keys, and emits revocations.",
                ],
                [
                  "02",
                  "Regional state",
                  "Caches the signing-key set and session deny list, expiring each entry with its access token.",
                ],
                [
                  "03",
                  "Edge gateway",
                  "Validates signature, issuer, audience, expiry, and revocation before forwarding a request.",
                ],
              ].map(([number, title, copy]) => (
                <li key={title} className="list-none">
                  <Card className="h-full">
                    <span className="font-mono text-xs text-primary">
                      {number}
                    </span>
                    <Typography.Title level={3} className="mb-2 mt-3 text-lg">
                      {title}
                    </Typography.Title>
                    <Typography.Paragraph
                      type="secondary"
                      className="mb-0 leading-7"
                    >
                      {copy}
                    </Typography.Paragraph>
                  </Card>
                </li>
              ))}
            </ol>
          </section>

          <Divider />

          <section id="requirements" aria-labelledby="requirements-heading">
            <Typography.Title level={2} id="requirements-heading">
              Requirements and evidence
            </Typography.Title>
            <Typography.Paragraph className="max-w-3xl" type="secondary">
              “Covered” means the design has an answer. It does not replace the
              evidence required before rollout.
            </Typography.Paragraph>
            <Table
              columns={requirementColumns}
              dataSource={requirements}
              pagination={false}
              rowKey="id"
              scroll={{ x: 1080 }}
              size="small"
            />
          </section>

          <Divider />

          <section id="risks" aria-labelledby="risks-heading">
            <Typography.Title level={2} id="risks-heading">
              Unresolved risks
            </Typography.Title>
            <Alert
              type="error"
              showIcon
              message="Primary risk: revocation propagation is not yet proven"
              description="The architecture is not production-ready until AUTH-02 passes under realistic cross-region delay and partial-failure conditions."
            />
            <div className="mt-5 grid gap-3">
              {risks.map(({ risk, impact, control }) => (
                <Card key={risk} size="small">
                  <Typography.Title level={3} className="mb-2 text-base">
                    {risk}
                  </Typography.Title>
                  <dl className="grid gap-2 text-sm sm:grid-cols-[7rem_1fr]">
                    <dt className="font-semibold">Impact</dt>
                    <dd className="mb-0">{impact}</dd>
                    <dt className="font-semibold">Control</dt>
                    <dd className="mb-0">{control}</dd>
                  </dl>
                </Card>
              ))}
            </div>
          </section>

          <Divider />

          <section id="rollout" aria-labelledby="rollout-heading">
            <Typography.Title level={2} id="rollout-heading">
              Rollout and rollback
            </Typography.Title>
            <Typography.Paragraph className="max-w-3xl" type="secondary">
              Each phase has an observable exit condition. A failed gate pauses
              expansion rather than changing the acceptance criteria.
            </Typography.Paragraph>
            <Timeline className="mt-6" items={rollout} />
          </section>
        </article>
      </div>
    </main>
  );
}
