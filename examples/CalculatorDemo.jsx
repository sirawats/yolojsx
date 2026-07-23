import { useMemo, useState } from "react";
import {
  Alert,
  Card,
  Col,
  InputNumber,
  Progress,
  Row,
  Segmented,
  Slider,
  Statistic,
  Typography,
} from "antd";

const scenarios = {
  Conservative: 0.8,
  Expected: 1,
  Ambitious: 1.25,
};

function MetricInput({ label, value, onChange, min, max, step = 1, suffix }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <Typography.Text strong>{label}</Typography.Text>
        <Typography.Text className="text-yolo-text-muted">{value.toLocaleString()}{suffix}</Typography.Text>
      </div>
      <div className="grid grid-cols-[1fr_120px] gap-4">
        <Slider min={min} max={max} step={step} value={value} onChange={onChange} tooltip={{ formatter: null }} />
        <InputNumber className="w-full" min={min} max={max} step={step} value={value} onChange={(next) => onChange(Number(next ?? min))} />
      </div>
    </div>
  );
}

export default function CalculatorDemo() {
  const [customers, setCustomers] = useState(420);
  const [revenue, setRevenue] = useState(79);
  const [margin, setMargin] = useState(82);
  const [churn, setChurn] = useState(2.4);
  const [acquisitionCost, setAcquisitionCost] = useState(310);
  const [scenario, setScenario] = useState("Expected");

  const result = useMemo(() => {
    const factor = scenarios[scenario];
    const monthlyRevenue = customers * revenue * factor;
    const grossProfit = monthlyRevenue * (margin / 100);
    const lifetimeMonths = churn > 0 ? 1 / (churn / 100) : 120;
    const lifetimeValue = revenue * (margin / 100) * lifetimeMonths;
    return {
      monthlyRevenue,
      annualRevenue: monthlyRevenue * 12,
      grossProfit,
      lifetimeValue,
      ratio: lifetimeValue / acquisitionCost,
      payback: acquisitionCost / Math.max(revenue * (margin / 100), 1),
    };
  }, [acquisitionCost, churn, customers, margin, revenue, scenario]);

  const healthy = result.ratio >= 3;

  return (
    <main className="min-h-screen bg-yolo-canvas px-5 py-10 text-yolo-text lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="mb-3 inline-flex rounded-full bg-yolo-code-background px-3 py-1 text-xs font-semibold text-yolo-primary">INTERACTIVE MODEL</div>
            <Typography.Title className="!mb-2 !text-4xl">SaaS unit economics calculator</Typography.Title>
            <Typography.Paragraph className="!mb-0 !text-lg text-yolo-text-muted">Stress-test revenue, payback, and LTV:CAC assumptions.</Typography.Paragraph>
          </div>
          <Segmented options={Object.keys(scenarios)} value={scenario} onChange={setScenario} />
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="yolo-surface" title="Model assumptions">
            <div className="grid gap-7">
              <MetricInput label="Paying customers" value={customers} onChange={setCustomers} min={25} max={2500} step={25} />
              <MetricInput label="Monthly revenue per customer" value={revenue} onChange={setRevenue} min={10} max={500} suffix=" USD" />
              <MetricInput label="Gross margin" value={margin} onChange={setMargin} min={20} max={98} suffix="%" />
              <MetricInput label="Monthly churn" value={churn} onChange={setChurn} min={0.5} max={12} step={0.1} suffix="%" />
              <MetricInput label="Customer acquisition cost" value={acquisitionCost} onChange={setAcquisitionCost} min={25} max={2500} step={25} suffix=" USD" />
            </div>
          </Card>

          <div className="grid gap-6">
            <section className="rounded-2xl bg-yolo-primary p-7 text-yolo-primary-text shadow-yolo-surface">
              <div className="text-sm opacity-75">Projected annual recurring revenue</div>
              <div className="mt-2 text-5xl font-semibold tracking-tight">${Math.round(result.annualRevenue).toLocaleString()}</div>
              <div className="mt-6 grid grid-cols-2 gap-5 border-t border-current/20 pt-5">
                <div><div className="text-xs opacity-70">Monthly revenue</div><strong className="text-xl">${Math.round(result.monthlyRevenue).toLocaleString()}</strong></div>
                <div><div className="text-xs opacity-70">Gross profit</div><strong className="text-xl">${Math.round(result.grossProfit).toLocaleString()}</strong></div>
              </div>
            </section>

            <Card className="yolo-surface" title="Efficiency scorecard">
              <Row gutter={[20, 20]}>
                <Col span={12}><Statistic title="Lifetime value" value={Math.round(result.lifetimeValue)} prefix="$" /></Col>
                <Col span={12}><Statistic title="LTV : CAC" value={result.ratio} precision={1} suffix="×" /></Col>
                <Col span={12}><Statistic title="Payback" value={result.payback} precision={1} suffix=" mo" /></Col>
                <Col span={12}><Statistic title="Gross margin" value={margin} suffix="%" /></Col>
              </Row>
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm"><span>Efficiency target</span><span>{Math.min(Math.round((result.ratio / 5) * 100), 100)}%</span></div>
                <Progress percent={Math.min(Math.round((result.ratio / 5) * 100), 100)} showInfo={false} status={healthy ? "success" : "normal"} />
              </div>
            </Card>

            <Alert
              type={healthy ? "success" : "warning"}
              showIcon
              title={healthy ? "Healthy acquisition model" : "Acquisition needs attention"}
              description={healthy ? "LTV:CAC is above the common 3× benchmark with a manageable payback window." : "Try improving retention, margin, or acquisition efficiency until LTV:CAC reaches 3×."}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
