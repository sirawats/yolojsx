import { Badge, Card, Col, Progress, Row, Select, Space, Statistic, Table, Tag, Typography } from "antd";

const incidents = [
  { key: "1", service: "Checkout API", region: "eu-west", latency: "842 ms", change: "+18%", health: "Degraded" },
  { key: "2", service: "Event ingest", region: "us-east", latency: "118 ms", change: "−4%", health: "Healthy" },
  { key: "3", service: "Search index", region: "ap-south", latency: "390 ms", change: "+7%", health: "Watching" },
  { key: "4", service: "Identity", region: "global", latency: "76 ms", change: "−12%", health: "Healthy" },
];

const columns = [
  { title: "Service", dataIndex: "service", render: (value) => <strong>{value}</strong> },
  { title: "Region", dataIndex: "region", render: (value) => <code>{value}</code> },
  { title: "p95 latency", dataIndex: "latency" },
  { title: "24h", dataIndex: "change", render: (value) => <Typography.Text type={value.startsWith("+") ? "danger" : "success"}>{value}</Typography.Text> },
  { title: "Health", dataIndex: "health", render: (value) => <Badge status={value === "Healthy" ? "success" : value === "Degraded" ? "error" : "warning"} text={value} /> },
];

function SparkBars({ values }) {
  return <div className="flex h-20 items-end gap-1">{values.map((value, index) => <span key={index} className="min-w-1 flex-1 rounded-t-sm bg-primary opacity-70" style={{ height: `${value}%` }} />)}</div>;
}

export default function Analytics() {
  return (
    <main className="p-5 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <Space orientation="vertical" size={0}>
            <Typography.Text type="secondary" className="text-xs uppercase tracking-[0.16em]">CONTROL ROOM</Typography.Text>
            <Typography.Title>Platform operations</Typography.Title>
          </Space>
          <Space wrap><Badge status="success" text="All systems reporting" /><Select defaultValue="24h" options={[{ value: "1h", label: "Last hour" }, { value: "24h", label: "Last 24 hours" }, { value: "7d", label: "Last 7 days" }]} /><Tag>UTC 10:42</Tag></Space>
        </header>

        <Row gutter={[16, 16]}>
          {[
            ["Requests", 28.4, "M", "+12.8%"],
            ["Availability", 99.982, "%", "+0.014%"],
            ["p95 latency", 184, "ms", "−8.2%"],
            ["Open incidents", 3, "", "−2 today"],
          ].map(([title, value, suffix, delta]) => <Col key={title} xs={24} sm={12} xl={6}><Card><Statistic title={title} value={value} precision={title === "Availability" ? 3 : title === "Requests" ? 1 : 0} suffix={suffix} /><Typography.Text type="success" className="mt-3 block text-xs">{delta} <Typography.Text type="secondary">vs previous</Typography.Text></Typography.Text></Card></Col>)}
        </Row>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_0.75fr]">
          <Card title="Request volume" extra={<Tag color="blue">Live</Tag>}>
            <div className="grid gap-6 md:grid-cols-[1fr_180px]">
              <SparkBars values={[28, 35, 31, 42, 48, 44, 53, 61, 58, 67, 74, 69, 77, 84, 72, 88, 82, 91, 87, 76, 83, 89, 94, 90]} />
              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-1"><div><Typography.Text type="secondary">Peak</Typography.Text><strong className="block text-xl">1.42k/s</strong></div><div><Typography.Text type="secondary">Average</Typography.Text><strong className="block text-xl">986/s</strong></div></div>
            </div>
          </Card>
          <Card title="Error budget">
            <div className="flex items-center justify-center py-2"><Progress type="dashboard" percent={73} /></div>
            <div className="grid grid-cols-2 gap-4 text-center"><div><strong>6h 34m</strong><Typography.Text type="secondary" className="block text-xs">remaining</Typography.Text></div><div><strong>2.1%</strong><Typography.Text type="secondary" className="block text-xs">burn rate</Typography.Text></div></div>
          </Card>
        </div>

        <Card className="mt-4" title="Service health" extra={<Typography.Text type="secondary">4 of 18 services shown</Typography.Text>}>
          <Table columns={columns} dataSource={incidents} pagination={false} scroll={{ x: 760 }} />
        </Card>
      </div>
    </main>
  );
}
