import { useState } from "react";
import {
  Alert,
  Card,
  Col,
  InputNumber,
  Progress,
  Radio,
  Row,
  Segmented,
  Slider,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  LuCalculator,
  LuChartPie,
  LuShieldAlert,
  LuTrendingUp,
  LuUserCheck,
} from "react-icons/lu";
import icon from "./favicon.svg";

export const YOLOJSX = {
  title: "Illustrative Tax Estimator",
  icon,
};

const FILING_PROFILES = {
  individual: {
    label: "Individual",
    standardDeduction: 12000,
    brackets: [
      { rate: 0.1, min: 0, max: 10000 },
      { rate: 0.15, min: 10000, max: 40000 },
      { rate: 0.2, min: 40000, max: 90000 },
      { rate: 0.25, min: 90000, max: 160000 },
      { rate: 0.3, min: 160000, max: 300000 },
      { rate: 0.35, min: 300000, max: Infinity },
    ],
  },
  joint: {
    label: "Joint household",
    standardDeduction: 24000,
    brackets: [
      { rate: 0.1, min: 0, max: 20000 },
      { rate: 0.15, min: 20000, max: 80000 },
      { rate: 0.2, min: 80000, max: 180000 },
      { rate: 0.25, min: 180000, max: 320000 },
      { rate: 0.3, min: 320000, max: 600000 },
      { rate: 0.35, min: 600000, max: Infinity },
    ],
  },
  caregiver: {
    label: "Caregiver household",
    standardDeduction: 18000,
    brackets: [
      { rate: 0.1, min: 0, max: 15000 },
      { rate: 0.15, min: 15000, max: 55000 },
      { rate: 0.2, min: 55000, max: 120000 },
      { rate: 0.25, min: 120000, max: 200000 },
      { rate: 0.3, min: 200000, max: 380000 },
      { rate: 0.35, min: 380000, max: Infinity },
    ],
  },
};

function formatAmount(amount) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function TaxCalculator() {
  const [grossIncome, setGrossIncome] = useState(95000);
  const [filingStatus, setFilingStatus] = useState("individual");
  const [deductionType, setDeductionType] = useState("standard");
  const [itemizedAmount, setItemizedAmount] = useState(18000);
  const [taxCredits, setTaxCredits] = useState(1500);

  const profile = FILING_PROFILES[filingStatus];
  const appliedDeduction =
    deductionType === "standard" ? profile.standardDeduction : itemizedAmount;

  const taxableIncome = Math.max(0, grossIncome - appliedDeduction);

  let grossTax = 0;
  const bracketBreakdown = profile.brackets.map((bracket) => {
    if (taxableIncome <= bracket.min) {
      return { ...bracket, taxableInBracket: 0, taxInBracket: 0 };
    }
    const taxableInBracket = Math.min(
      taxableIncome - bracket.min,
      bracket.max - bracket.min,
    );
    const taxInBracket = taxableInBracket * bracket.rate;
    grossTax += taxInBracket;
    return { ...bracket, taxableInBracket, taxInBracket };
  });

  const finalTax = Math.max(0, grossTax - taxCredits);
  const effectiveRate = grossIncome > 0 ? (finalTax / grossIncome) * 100 : 0;
  const takeHome = Math.max(0, grossIncome - finalTax);
  const monthlyTakeHome = takeHome / 12;

  const topBracket = bracketBreakdown.findLast((b) => b.taxableInBracket > 0);
  const marginalRate = topBracket ? topBracket.rate * 100 : 0;

  const bracketTableColumns = [
    {
      title: "Rate",
      dataIndex: "rate",
      key: "rate",
      render: (rate) => <Tag color="blue">{`${(rate * 100).toFixed(0)}%`}</Tag>,
    },
    {
      title: "Bracket Range",
      key: "range",
      render: (_, record) =>
        record.max === Infinity
          ? `Over ${formatAmount(record.min)} units`
          : `${formatAmount(record.min)} - ${formatAmount(record.max)} units`,
    },
    {
      title: "Taxable Amount",
      dataIndex: "taxableInBracket",
      key: "taxableInBracket",
      render: (amount) => `${formatAmount(amount)} units`,
    },
    {
      title: "Tax in Bracket",
      dataIndex: "taxInBracket",
      key: "taxInBracket",
      render: (amount) => `${formatAmount(amount)} units`,
    },
  ];

  return (
    <main className="min-h-screen bg-background p-4 text-foreground sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-card">
              <LuCalculator className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <Typography.Title level={2} className="m-0">
                Illustrative Tax Estimator
              </Typography.Title>
              <Typography.Text type="secondary">
                Interactive progressive tax model with custom deductions and
                credits
              </Typography.Text>
            </div>
          </div>
          <Tag color="cyan" className="px-3 py-1 text-sm font-medium">
            Educational Demo
          </Tag>
        </header>

        <Alert
          type="info"
          showIcon
          icon={
            <LuShieldAlert
              className="h-5 w-5 text-primary"
              aria-hidden="true"
            />
          }
          message="Illustrative Model Disclaimer"
          description="This calculator uses invented profiles, brackets, and illustrative units to demonstrate progressive calculations and state management. It is not tied to any jurisdiction or currency and does not constitute tax, legal, or financial advice."
        />

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <span className="flex items-center gap-2 font-semibold">
                  <LuUserCheck className="text-primary" aria-hidden="true" />
                  Tax Profile & Inputs
                </span>
              }
              className="shadow-sm"
            >
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="gross-income-input"
                    className="mb-2 block font-medium"
                  >
                    Gross Annual Income (illustrative units)
                  </label>
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <Slider
                      id="gross-income-slider"
                      aria-label="Gross annual income in illustrative units"
                      min={0}
                      max={400000}
                      step={1000}
                      value={grossIncome}
                      onChange={(v) =>
                        typeof v === "number" && setGrossIncome(v)
                      }
                    />
                    <InputNumber
                      id="gross-income-input"
                      min={0}
                      max={2000000}
                      step={1000}
                      formatter={(v) =>
                        `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(v) =>
                        v ? Number(v.replace(/\$\s?|(,*)/g, "")) : 0
                      }
                      value={grossIncome}
                      onChange={(v) =>
                        typeof v === "number" && setGrossIncome(v)
                      }
                      style={{ width: 140 }}
                    />
                  </div>
                </div>

                <div>
                  <div
                    id="filing-status-label"
                    className="mb-2 block font-medium"
                  >
                    Filing Profile
                  </div>
                  <Segmented
                    aria-labelledby="filing-status-label"
                    block
                    options={[
                      { label: "Individual", value: "individual" },
                      { label: "Joint household", value: "joint" },
                      { label: "Caregiver household", value: "caregiver" },
                    ]}
                    value={filingStatus}
                    onChange={(v) => setFilingStatus(String(v))}
                  />
                </div>

                <div>
                  <div id="deductions-label" className="mb-2 block font-medium">
                    Deductions (illustrative units)
                  </div>
                  <Radio.Group
                    aria-labelledby="deductions-label"
                    value={deductionType}
                    onChange={(e) => setDeductionType(e.target.value)}
                    className="mb-3 block"
                  >
                    <Radio value="standard">
                      Standard ({formatAmount(profile.standardDeduction)} units)
                    </Radio>
                    <Radio value="itemized">Itemized Deductions</Radio>
                  </Radio.Group>

                  {deductionType === "itemized" && (
                    <div className="mt-2">
                      <label
                        htmlFor="itemized-deduction-input"
                        className="mb-2 block text-sm text-muted-foreground"
                      >
                        Itemized amount (illustrative units)
                      </label>
                      <InputNumber
                        id="itemized-deduction-input"
                        min={0}
                        max={200000}
                        formatter={(v) =>
                          `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(v) =>
                          v ? Number(v.replace(/\$\s?|(,*)/g, "")) : 0
                        }
                        value={itemizedAmount}
                        onChange={(v) =>
                          typeof v === "number" && setItemizedAmount(v)
                        }
                        style={{ width: "100%" }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="tax-credits-input"
                    className="mb-2 block font-medium"
                  >
                    Tax Credits (illustrative units; direct reduction)
                  </label>
                  <InputNumber
                    id="tax-credits-input"
                    min={0}
                    max={50000}
                    formatter={(v) =>
                      `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(v) =>
                      v ? Number(v.replace(/\$\s?|(,*)/g, "")) : 0
                    }
                    value={taxCredits}
                    onChange={(v) => typeof v === "number" && setTaxCredits(v)}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <span className="flex items-center gap-2 font-semibold">
                  <LuTrendingUp className="text-primary" aria-hidden="true" />
                  Estimated Tax Summary
                </span>
              }
              className="h-full shadow-sm"
            >
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Estimated Tax (units)"
                    value={formatAmount(finalTax)}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Effective Rate"
                    value={`${effectiveRate.toFixed(1)}%`}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Marginal Bracket"
                    value={`${marginalRate.toFixed(0)}%`}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Monthly Take-Home (units)"
                    value={formatAmount(monthlyTakeHome)}
                  />
                </Col>
              </Row>

              <div className="mt-6 rounded-lg bg-card p-4">
                <div className="mb-2 flex items-center justify-between text-sm font-medium">
                  <span>Take-Home vs Tax Share</span>
                  <span>
                    {((takeHome / (grossIncome || 1)) * 100).toFixed(1)}%
                    Take-Home
                  </span>
                </div>
                <Progress
                  percent={Number(
                    ((takeHome / (grossIncome || 1)) * 100).toFixed(1),
                  )}
                  showInfo={false}
                />
              </div>

              <div className="mt-6 space-y-3 border-t border-border pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Gross Annual Income (units)</span>
                  <span className="font-semibold text-foreground">
                    {formatAmount(grossIncome)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Deduction Applied ({deductionType})</span>
                  <span className="font-semibold text-foreground">
                    -{formatAmount(appliedDeduction)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxable Income</span>
                  <span className="font-semibold text-foreground">
                    {formatAmount(taxableIncome)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Gross Tax (before credits)</span>
                  <span className="font-semibold text-foreground">
                    {formatAmount(grossTax)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax Credits Applied</span>
                  <span className="font-semibold text-foreground">
                    -{formatAmount(taxCredits)}
                  </span>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24}>
            <Card
              title={
                <span className="flex items-center gap-2 font-semibold">
                  <LuChartPie className="text-primary" aria-hidden="true" />
                  Progressive Bracket Breakdown
                </span>
              }
              className="shadow-sm"
            >
              <Table
                dataSource={bracketBreakdown.map((row, idx) => ({
                  ...row,
                  key: idx,
                }))}
                columns={bracketTableColumns}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </main>
  );
}
