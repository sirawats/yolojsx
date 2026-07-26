import { useState } from "react";
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
  Tag,
  Typography,
} from "antd";
import icon from "./favicon.svg";

export const YOLOJSX = {
  title: "SaaS Unit Economics Calculator",
  icon,
};

const scenarios = {
  Conservative: 0.8,
  Expected: 1,
  Ambitious: 1.25,
};

function MetricInput({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix = "",
}) {
  const update = (next) => {
    if (typeof next === "number" && Number.isFinite(next)) {
      onChange(Math.min(max, Math.max(min, next)));
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={id} className="font-semibold">
          {label}
        </label>
        <Typography.Text type="secondary" id={`${id}-value`}>
          {value.toLocaleString()}
          {suffix}
        </Typography.Text>
      </div>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
        <Slider
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={update}
          aria-label={`${label} slider`}
          aria-describedby={`${id}-value`}
          tooltip={{ formatter: null }}
        />
        <InputNumber
          id={id}
          className="w-full"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={update}
          aria-label={label}
          aria-describedby={`${id}-value`}
        />
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

  const monthlyGrossProfitPerCustomer = revenue * (margin / 100);
  const monthlyRevenue = customers * revenue * scenarios[scenario];
  const grossProfit = monthlyRevenue * (margin / 100);
  const lifetimeValue = monthlyGrossProfitPerCustomer / (churn / 100);
  const ratio = lifetimeValue / acquisitionCost;
  const payback = acquisitionCost / monthlyGrossProfitPerCustomer;
  const targetMet = ratio >= 3;
  const targetProgress = Math.min(Math.round((ratio / 3) * 100), 100);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <div className="max-w-3xl">
            <Tag color="blue">Interactive model</Tag>
            <Typography.Title className="mt-3 text-3xl sm:text-4xl">
              SaaS unit economics calculator
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="text-lg">
              Change the assumptions to test recurring revenue, payback, and
              LTV:CAC. Results update instantly.
            </Typography.Paragraph>
          </div>
        </header>

        <div aria-live="polite" className="mb-6">
          <Alert
            type={targetMet ? "success" : "warning"}
            showIcon
            title={targetMet ? "LTV:CAC target met" : "LTV:CAC below target"}
            description={
              targetMet
                ? `Estimated at ${ratio.toFixed(1)}× with ${payback.toFixed(1)}-month payback. Test the conservative revenue outlook before sharing the plan.`
                : `Estimated at ${ratio.toFixed(1)}× with ${payback.toFixed(1)}-month payback. Reduce churn or acquisition cost, or improve margin, to reach 3×.`
            }
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section aria-labelledby="assumptions-heading">
            <Card
              title={
                <h2
                  id="assumptions-heading"
                  className="m-0 text-lg font-semibold"
                >
                  Model assumptions
                </h2>
              }
            >
              <div className="grid gap-7">
                <MetricInput
                  id="customers"
                  label="Paying customers"
                  value={customers}
                  onChange={setCustomers}
                  min={25}
                  max={2500}
                  step={25}
                />
                <MetricInput
                  id="revenue"
                  label="Monthly revenue per customer"
                  value={revenue}
                  onChange={setRevenue}
                  min={10}
                  max={500}
                  suffix=" USD"
                />
                <MetricInput
                  id="margin"
                  label="Gross margin"
                  value={margin}
                  onChange={setMargin}
                  min={20}
                  max={98}
                  suffix="%"
                />
                <MetricInput
                  id="churn"
                  label="Monthly churn"
                  value={churn}
                  onChange={setChurn}
                  min={0.5}
                  max={12}
                  step={0.1}
                  suffix="%"
                />
                <MetricInput
                  id="acquisition-cost"
                  label="Customer acquisition cost"
                  value={acquisitionCost}
                  onChange={setAcquisitionCost}
                  min={25}
                  max={2500}
                  step={25}
                  suffix=" USD"
                />
              </div>
            </Card>
          </section>

          <section aria-labelledby="results-heading" className="grid gap-6">
            <Card
              title={
                <h2 id="results-heading" className="m-0 text-lg font-semibold">
                  Revenue outlook
                </h2>
              }
            >
              <div
                className="mb-6"
                role="group"
                aria-labelledby="outlook-label"
              >
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <Typography.Text strong id="outlook-label">
                    Customer-volume scenario
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    {Math.round(scenarios[scenario] * 100)}% of current volume
                  </Typography.Text>
                </div>
                <Segmented
                  block
                  options={Object.keys(scenarios)}
                  value={scenario}
                  onChange={setScenario}
                />
              </div>

              <Statistic
                title="Projected annual recurring revenue"
                value={Math.round(monthlyRevenue * 12)}
                prefix="$"
              />
              <Row className="mt-6" gutter={[20, 20]}>
                <Col xs={24} sm={12}>
                  <Statistic
                    title="Monthly revenue"
                    value={Math.round(monthlyRevenue)}
                    prefix="$"
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Statistic
                    title="Monthly gross profit"
                    value={Math.round(grossProfit)}
                    prefix="$"
                  />
                </Col>
              </Row>
            </Card>

            <Card
              title={
                <h2 className="m-0 text-lg font-semibold">
                  Efficiency scorecard
                </h2>
              }
            >
              <Row gutter={[20, 20]}>
                <Col xs={24} sm={12}>
                  <Statistic
                    title="Lifetime value"
                    value={Math.round(lifetimeValue)}
                    prefix="$"
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Statistic
                    title="LTV : CAC"
                    value={ratio}
                    precision={1}
                    suffix="×"
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Statistic
                    title="Payback"
                    value={payback}
                    precision={1}
                    suffix=" mo"
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Statistic title="Gross margin" value={margin} suffix="%" />
                </Col>
              </Row>
              <div className="mt-6">
                <div className="mb-2 flex justify-between gap-4 text-sm">
                  <span>Progress to 3× LTV:CAC target</span>
                  <span>{targetProgress}%</span>
                </div>
                <Progress
                  percent={targetProgress}
                  showInfo={false}
                  status={targetMet ? "success" : "normal"}
                />
              </div>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
