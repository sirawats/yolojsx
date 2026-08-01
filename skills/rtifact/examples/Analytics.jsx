import { useState } from "react";
import {
  Alert,
  Badge,
  Card,
  Col,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import icon from "./favicon.svg";

export const RTIFACT = {
  title: "Platform Operations Analytics",
  icon,
};

const incidents = [
  {
    key: "1",
    service: "Checkout API",
    region: "eu-west",
    latency: "842 ms",
    change: "+18%",
    health: "Degraded",
  },
  {
    key: "2",
    service: "Event ingest",
    region: "us-east",
    latency: "118 ms",
    change: "−4%",
    health: "Healthy",
  },
  {
    key: "3",
    service: "Search index",
    region: "ap-south",
    latency: "390 ms",
    change: "+7%",
    health: "Watching",
  },
  {
    key: "4",
    service: "Identity",
    region: "global",
    latency: "76 ms",
    change: "−12%",
    health: "Healthy",
  },
];

const metrics = [
  {
    title: "Requests",
    value: 28.4,
    suffix: "M",
    precision: 1,
    delta: "+12.8%",
  },
  {
    title: "Availability",
    value: 99.982,
    suffix: "%",
    precision: 3,
    delta: "+0.014%",
  },
  {
    title: "p95 latency",
    value: 184,
    suffix: "ms",
    delta: "−8.2%",
  },
  {
    title: "Open incidents",
    value: 3,
    delta: "−2 today",
  },
];

const columns = [
  {
    title: "Service",
    dataIndex: "service",
    render: (value) => <strong>{value}</strong>,
  },
  {
    title: "Region",
    dataIndex: "region",
    render: (value) => <code>{value}</code>,
  },
  { title: "p95 latency", dataIndex: "latency" },
  {
    title: "24h",
    dataIndex: "change",
    render: (value) => (
      <Typography.Text type={value.startsWith("+") ? "danger" : "success"}>
        {value}
      </Typography.Text>
    ),
  },
  {
    title: "Health",
    dataIndex: "health",
    render: (value) => (
      <Badge
        status={
          value === "Healthy"
            ? "success"
            : value === "Degraded"
              ? "error"
              : "warning"
        }
        text={value}
      />
    ),
  },
];

function SparkBars({ values }) {
  return (
    <div
      className="flex h-24 items-end gap-1"
      role="img"
      aria-label="Illustrative request volume rises overall with several short dips."
    >
      {values.map((value, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="min-w-1 flex-1 rounded-t-sm bg-primary opacity-70"
          style={{ height: `${value}%` }}
        />
      ))}
    </div>
  );
}

export default function Analytics() {
  const [health, setHealth] = useState("All");
  const visibleServices =
    health === "All"
      ? incidents
      : incidents.filter((service) => service.health === health);

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <article className="mx-auto max-w-7xl">
        <header className="mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <Space orientation="vertical" size={2}>
              <Typography.Text
                type="secondary"
                className="text-xs uppercase tracking-[0.16em]"
              >
                Illustrative 24-hour snapshot
              </Typography.Text>
              <Typography.Title className="m-0">
                Platform operations
              </Typography.Title>
              <Typography.Paragraph
                type="secondary"
                className="mb-0 max-w-2xl text-base leading-relaxed"
              >
                A static example of how a portable operations report can surface
                the conclusion first, then preserve the evidence for review.
              </Typography.Paragraph>
            </Space>
            <Tag color="blue">Example data · not live</Tag>
          </div>
        </header>

        <section aria-labelledby="summary-heading">
          <Typography.Title id="summary-heading" level={2} className="sr-only">
            Operations summary
          </Typography.Title>
          <Alert
            type="warning"
            showIcon
            title="Checkout latency needs attention"
            description="Checkout API is the only degraded service shown: p95 latency is 842 ms, up 18% in this illustrative snapshot. Search index remains on watch."
            className="mb-4"
          />

          <Row gutter={[16, 16]}>
            {metrics.map(({ title, value, suffix, precision, delta }) => (
              <Col key={title} xs={24} sm={12} xl={6}>
                <Card className="h-full">
                  <Statistic
                    title={title}
                    value={value}
                    precision={precision}
                    suffix={suffix}
                  />
                  <Typography.Text
                    type={
                      delta.startsWith("−") || title === "Availability"
                        ? "success"
                        : undefined
                    }
                    className="mt-3 block text-sm"
                  >
                    {delta}{" "}
                    <Typography.Text type="secondary">
                      vs previous 24h
                    </Typography.Text>
                  </Typography.Text>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_0.75fr]">
          <section aria-labelledby="traffic-heading">
            <Card
              className="h-full"
              title={
                <Typography.Title
                  id="traffic-heading"
                  level={2}
                  className="m-0"
                >
                  Request volume
                </Typography.Title>
              }
              extra={<Tag>24 hours</Tag>}
            >
              <figure className="m-0 grid gap-5 md:grid-cols-[1fr_180px]">
                <div>
                  <SparkBars
                    values={[
                      28, 35, 31, 42, 48, 44, 53, 61, 58, 67, 74, 69, 77, 84,
                      72, 88, 82, 91, 87, 76, 83, 89, 94, 90,
                    ]}
                  />
                  <figcaption className="mt-2 text-sm text-muted-foreground">
                    Relative volume by hour; bars show shape, not an exact
                    scale.
                  </figcaption>
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm md:grid-cols-1">
                  <div>
                    <dt className="text-muted-foreground">Peak</dt>
                    <dd className="m-0 text-xl font-semibold">1.42k/s</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Average</dt>
                    <dd className="m-0 text-xl font-semibold">986/s</dd>
                  </div>
                </dl>
              </figure>
            </Card>
          </section>

          <section aria-labelledby="budget-heading">
            <Card
              className="h-full"
              title={
                <Typography.Title id="budget-heading" level={2} className="m-0">
                  Error budget
                </Typography.Title>
              }
            >
              <div className="flex items-center justify-center py-2">
                <Progress
                  type="dashboard"
                  percent={73}
                  aria-label="73 percent of error budget remaining"
                />
              </div>
              <dl className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <dt className="text-sm text-muted-foreground">Remaining</dt>
                  <dd className="m-0 font-semibold">6h 34m</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Burn rate</dt>
                  <dd className="m-0 font-semibold">2.1%</dd>
                </div>
              </dl>
            </Card>
          </section>
        </div>

        <section aria-labelledby="health-heading" className="mt-4">
          <Card
            title={
              <div>
                <Typography.Title id="health-heading" level={2} className="m-0">
                  Service health
                </Typography.Title>
              </div>
            }
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <Typography.Text type="secondary">
                {visibleServices.length} of {incidents.length} illustrative
                services shown
              </Typography.Text>
              <div>
                <label htmlFor="health-filter" className="sr-only">
                  Filter services by health
                </label>
                <Select
                  id="health-filter"
                  value={health}
                  onChange={setHealth}
                  aria-label="Filter services by health"
                  className="w-36"
                  options={["All", "Degraded", "Watching", "Healthy"].map(
                    (value) => ({ value, label: value }),
                  )}
                />
              </div>
            </div>
            <Table
              columns={columns}
              dataSource={visibleServices}
              pagination={false}
              scroll={{ x: 760 }}
              rowKey="key"
            />
          </Card>
        </section>
      </article>
    </main>
  );
}
