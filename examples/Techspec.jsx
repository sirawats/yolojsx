import {
  Card,
  Divider,
  Progress,
  Space,
  Table,
  Tag,
  Timeline,
  Typography,
} from "antd";

const requirements = [
  {
    id: "AUTH-01",
    requirement: "Rotate signing keys without downtime",
    priority: "Must",
    status: "Accepted",
  },
  {
    id: "AUTH-02",
    requirement: "Revoke a session within 60 seconds",
    priority: "Must",
    status: "In review",
  },
  {
    id: "AUTH-03",
    requirement: "Expose device-level session history",
    priority: "Should",
    status: "Draft",
  },
];

const columns = [
  { title: "ID", dataIndex: "id", width: 110 },
  { title: "Requirement", dataIndex: "requirement" },
  { title: "Priority", dataIndex: "priority", width: 100 },
  {
    title: "Status",
    dataIndex: "status",
    width: 110,
    render: (status) => (
      <Tag
        color={
          status === "Accepted"
            ? "green"
            : status === "In review"
              ? "gold"
              : "blue"
        }
      >
        {status}
      </Tag>
    ),
  },
];

export default function Techspec() {
  return (
    <main>
      <header className="border-b border-border bg-card px-6 py-4 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <Typography.Text
              type="secondary"
              className="font-mono text-xs uppercase tracking-[0.18em]"
            >
              RFC 042 · Identity Platform
            </Typography.Text>
            <Typography.Title level={3} className="mb-0 mt-1">
              Session architecture v2
            </Typography.Title>
          </div>
          <Space wrap>
            <Tag color="green">Ready for implementation</Tag>
            <Typography.Text type="secondary">
              Updated 22 Jul 2026
            </Typography.Text>
          </Space>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-10">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Typography.Text strong>On this page</Typography.Text>
          <nav className="mt-4 grid gap-1 text-sm text-muted-foreground">
            {[
              "Summary",
              "Context",
              "Architecture",
              "Requirements",
              "Rollout",
            ].map((item, index) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`rounded-md px-3 py-2 ${index === 0 ? "bg-code text-primary" : "hover:bg-card"}`}
              >
                {String(index + 1).padStart(2, "0")} · {item}
              </a>
            ))}
          </nav>
          <Card size="small" className="mt-6">
            <Typography.Text type="secondary" className="text-xs">
              Review progress
            </Typography.Text>
            <Progress percent={78} size="small" className="mt-2" />
            <Typography.Text type="secondary" className="text-xs">
              7 of 9 reviewers
            </Typography.Text>
          </Card>
        </aside>

        <article className="min-w-0">
          <section id="summary" className="mb-10">
            <Typography.Title className="mb-3 text-4xl">
              Durable sessions without a central bottleneck
            </Typography.Title>
            <Typography.Paragraph
              type="secondary"
              className="max-w-3xl text-lg leading-8"
            >
              Move session verification to signed, short-lived access tokens
              while retaining fast revocation through a compact regional deny
              list.
            </Typography.Paragraph>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["Decision", "Hybrid token model"],
                ["Target latency", "p99 < 25 ms"],
                ["Rollout window", "6 weeks"],
              ].map(([label, value]) => (
                <Card key={label} size="small">
                  <Typography.Text
                    type="secondary"
                    className="text-xs uppercase tracking-wider"
                  >
                    {label}
                  </Typography.Text>
                  <div className="mt-1 font-semibold">{value}</div>
                </Card>
              ))}
            </div>
          </section>

          <Divider />

          <section id="context" className="mb-10">
            <Typography.Title level={2}>Context</Typography.Title>
            <Typography.Paragraph className="max-w-3xl leading-7">
              The current session service is consulted on every request. It is
              simple to reason about, but creates a cross-region dependency and
              turns routine maintenance into a coordinated event.
            </Typography.Paragraph>
            <blockquote>
              A revoked session must stop authorizing requests quickly, but an
              unavailable control plane must not stop healthy traffic.
            </blockquote>
          </section>

          <section id="architecture" className="mb-10">
            <Typography.Title level={2}>Proposed architecture</Typography.Title>
            <div className="mt-5 grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
              {[
                ["01", "Edge gateway", "Verify signature and expiry"],
                ["02", "Regional cache", "Check compact revocation set"],
                ["03", "Identity core", "Issue, refresh, and revoke"],
              ].map(([number, title, copy], index) => (
                <div className="contents" key={title}>
                  <Card>
                    <span className="font-mono text-xs text-primary">
                      {number}
                    </span>
                    <Typography.Title level={4} className="mb-1 mt-3">
                      {title}
                    </Typography.Title>
                    <Typography.Text type="secondary">{copy}</Typography.Text>
                  </Card>
                  {index < 2 && (
                    <div className="hidden self-center text-2xl text-muted-foreground md:block">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section id="requirements" className="mb-10">
            <Typography.Title level={2}>Requirements</Typography.Title>
            <Table
              className="overflow-hidden rounded-lg border border-border"
              columns={columns}
              dataSource={requirements}
              pagination={false}
              rowKey="id"
              scroll={{ x: 680 }}
            />
          </section>

          <section id="rollout">
            <Typography.Title level={2}>Rollout plan</Typography.Title>
            <Timeline
              className="mt-6"
              items={[
                {
                  color: "green",
                  children: (
                    <>
                      <strong>Week 1</strong>
                      <br />
                      <Typography.Text type="secondary">
                        Shadow verification in one region
                      </Typography.Text>
                    </>
                  ),
                },
                {
                  color: "blue",
                  children: (
                    <>
                      <strong>Weeks 2–3</strong>
                      <br />
                      <Typography.Text type="secondary">
                        Progressive traffic ramp and revocation drills
                      </Typography.Text>
                    </>
                  ),
                },
                {
                  color: "gray",
                  children: (
                    <>
                      <strong>Weeks 4–6</strong>
                      <br />
                      <Typography.Text type="secondary">
                        Global rollout, then remove synchronous lookups
                      </Typography.Text>
                    </>
                  ),
                },
              ]}
            />
          </section>
        </article>
      </div>
    </main>
  );
}
