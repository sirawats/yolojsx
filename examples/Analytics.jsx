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
  { title: "24h", dataIndex: "change", render: (value) => <span className={value.startsWith("+") ? "text-yolo-danger" : "text-yolo-success"}>{value}</span> },
  { title: "Health", dataIndex: "health", render: (value) => <Badge status={value === "Healthy" ? "success" : value === "Degraded" ? "error" : "warning"} text={value} /> },
];

function SparkBars({ values }) {
  return <div className="flex h-20 items-end gap-1">{values.map((value, index) => <span key={index} className="min-w-1 flex-1 rounded-t-sm bg-yolo-primary opacity-70" style={{ height: `${value}%` }} />)}</div>;
}

export default function Analytics() {
  return (
    <main className="min-h-screen bg-yolo-canvas p-5 text-yolo-text lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div><Typography.Text className="text-xs uppercase tracking-[0.16em] text-yolo-text-muted">CONTROL ROOM</Typography.Text><Typography.Title className="!mb-0 !mt-1">Platform operations</Typography.Title></div>
          <Space wrap><Badge status="success" text="All systems reporting" /><Select defaultValue="24h" options={[{ value: "1h", label: "Last hour" }, { value: "24h", label: "Last 24 hours" }, { value: "7d", label: "Last 7 days" }]} /><Tag>UTC 10:42</Tag></Space>
        </header>

        <Row gutter={[16, 16]}>
          {[
            ["Requests", 28.4, "M", "+12.8%"],
            ["Availability", 99.982, "%", "+0.014%"],
            ["p95 latency", 184, "ms", "−8.2%"],
            ["Open incidents", 3, "", "−2 today"],
          ].map(([title, value, suffix, delta]) => <Col key={title} xs={24} sm={12} xl={6}><Card className="yolo-surface"><Statistic title={title} value={value} precision={title === "Availability" ? 3 : title === "Requests" ? 1 : 0} suffix={suffix} /><div className="mt-3 text-xs text-yolo-success">{delta} <span className="text-yolo-text-muted">vs previous</span></div></Card></Col>)}
        </Row>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_0.75fr]">
          <Card className="yolo-surface" title="Request volume" extra={<Tag color="blue">Live</Tag>}>
            <div className="grid gap-6 md:grid-cols-[1fr_180px]">
              <SparkBars values={[28, 35, 31, 42, 48, 44, 53, 61, 58, 67, 74, 69, 77, 84, 72, 88, 82, 91, 87, 76, 83, 89, 94, 90]} />
              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-1"><div><span className="text-yolo-text-muted">Peak</span><strong className="block text-xl">1.42k/s</strong></div><div><span className="text-yolo-text-muted">Average</span><strong className="block text-xl">986/s</strong></div></div>
            </div>
          </Card>
          <Card className="yolo-surface" title="Error budget">
            <div className="flex items-center justify-center py-2"><Progress type="dashboard" percent={73} strokeColor="var(--yolo-primary)" /></div>
            <div className="grid grid-cols-2 gap-4 text-center"><div><strong>6h 34m</strong><div className="text-xs text-yolo-text-muted">remaining</div></div><div><strong>2.1%</strong><div className="text-xs text-yolo-text-muted">burn rate</div></div></div>
          </Card>
        </div>

        <Card className="yolo-surface mt-4" title="Service health" extra={<Typography.Text className="text-yolo-text-muted">4 of 18 services shown</Typography.Text>}>
          <Table columns={columns} dataSource={incidents} pagination={false} scroll={{ x: 760 }} />
        </Card>
      </div>
    </main>
  );
}
