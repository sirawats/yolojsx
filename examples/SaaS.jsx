import { useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Row,
  Segmented,
  Space,
  Tag,
  Typography,
} from "antd";
import icon from "./favicon.svg";

export const YOLOJSX = {
  title: "Nimbus — Calm Teamwork",
  icon,
};

const plans = [
  {
    name: "Starter",
    monthly: 19,
    description: "For focused teams proving a workflow.",
    features: ["3 projects", "5 collaborators", "7-day history"],
  },
  {
    name: "Scale",
    monthly: 49,
    description: "For growing teams running critical work.",
    features: [
      "Unlimited projects",
      "25 collaborators",
      "Audit log",
      "Priority support",
    ],
    featured: true,
  },
  {
    name: "Company",
    monthly: 99,
    description: "For organizations with advanced controls.",
    features: [
      "SAML SSO",
      "Custom retention",
      "Private regions",
      "Success manager",
    ],
  },
];

export default function SaaS() {
  const [billing, setBilling] = useState("Yearly");
  const yearly = billing === "Yearly";

  return (
    <main className="overflow-hidden">
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-3 text-lg font-bold">
          <Avatar shape="square">N</Avatar>Nimbus
        </div>
        <div className="hidden gap-7 text-sm text-muted-foreground md:flex">
          <a href="#product">Product</a>
          <a href="#proof">Customers</a>
          <a href="#pricing">Pricing</a>
        </div>
        <Space>
          <Button type="text">Sign in</Button>
          <Button type="primary">Start free</Button>
        </Space>
      </nav>

      <section className="relative px-6 pb-24 pt-16 text-center lg:pt-24">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary opacity-[0.08] blur-3xl" />
        <div className="relative mx-auto max-w-4xl">
          <Tag color="blue" className="mb-6">
            Nimbus 2.0 is live
          </Tag>
          <Typography.Title className="mx-auto mb-6 max-w-4xl text-5xl leading-[1.05] lg:text-7xl">
            Turn scattered work into steady momentum.
          </Typography.Title>
          <Typography.Paragraph
            type="secondary"
            className="mx-auto mb-8 max-w-2xl text-xl leading-8"
          >
            One calm workspace for planning, decisions, and delivery—designed
            for teams who would rather ship than manage their tools.
          </Typography.Paragraph>
          <Space size="middle" wrap>
            <Button type="primary" size="large">
              Start building free
            </Button>
            <Button size="large">Watch 90-sec tour</Button>
          </Space>
          <Typography.Text type="secondary" className="mt-4 block text-xs">
            No credit card · Setup in two minutes
          </Typography.Text>
        </div>

        <div
          id="product"
          className="relative mx-auto mt-16 max-w-5xl rounded-2xl border border-border bg-card p-3 shadow-card"
        >
          <div className="rounded-xl border border-border bg-background text-left">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <i className="size-2.5 rounded-full bg-danger" />
              <i className="size-2.5 rounded-full bg-warning" />
              <i className="size-2.5 rounded-full bg-success" />
              <span className="ml-3 text-xs text-muted-foreground">
                Product launch · Command center
              </span>
            </div>
            <div className="grid md:grid-cols-[190px_1fr]">
              <aside className="hidden border-r border-border p-4 text-sm text-muted-foreground md:grid md:gap-3">
                <strong className="text-foreground">Nimbus</strong>
                <span>◫ Overview</span>
                <span>✓ My work</span>
                <span>⌁ Roadmap</span>
                <span>◌ Insights</span>
              </aside>
              <div className="p-5 md:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">
                      SPRINT 18
                    </div>
                    <h2 className="mt-1 text-2xl font-semibold">
                      Launch readiness
                    </h2>
                  </div>
                  <Tag color="green">82% on track</Tag>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[
                    "Polish onboarding",
                    "Verify billing",
                    "Publish launch kit",
                  ].map((item, index) => (
                    <Card key={item} size="small">
                      <Typography.Text
                        type="secondary"
                        className="mb-8 block text-xs"
                      >
                        {index === 2 ? "MARKETING" : "PRODUCT"}
                      </Typography.Text>
                      <strong>{item}</strong>
                      <Typography.Text
                        type="secondary"
                        className="mt-3 block text-xs"
                      >
                        {index + 2} tasks · Due Friday
                      </Typography.Text>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="proof" className="border-y border-border bg-card px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-8 text-center md:grid-cols-3">
          <div>
            <strong className="text-4xl">38%</strong>
            <div className="mt-2 text-muted-foreground">
              fewer status meetings
            </div>
          </div>
          <div>
            <strong className="text-4xl">2.4×</strong>
            <div className="mt-2 text-muted-foreground">
              faster decision cycles
            </div>
          </div>
          <div>
            <strong className="text-4xl">11 hrs</strong>
            <div className="mt-2 text-muted-foreground">
              saved per teammate monthly
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div>
              <Typography.Title className="mb-2">
                Simple plans, no procurement maze.
              </Typography.Title>
              <Typography.Text type="secondary">
                Every plan includes a 14-day trial.
              </Typography.Text>
            </div>
            <Segmented
              options={["Monthly", "Yearly"]}
              value={billing}
              onChange={setBilling}
            />
          </div>
          <Row gutter={[20, 20]}>
            {plans.map((plan) => {
              const price = yearly
                ? Math.round(plan.monthly * 0.8)
                : plan.monthly;
              return (
                <Col key={plan.name} xs={24} lg={8}>
                  <Card
                    className={`h-full ${plan.featured ? "border-primary shadow-card" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <Typography.Title level={3}>{plan.name}</Typography.Title>
                      {plan.featured && <Tag color="blue">Most popular</Tag>}
                    </div>
                    <Typography.Paragraph type="secondary" className="min-h-12">
                      {plan.description}
                    </Typography.Paragraph>
                    <div className="my-6">
                      <span className="text-4xl font-semibold">${price}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        / user / mo
                      </span>
                    </div>
                    <Button
                      type={plan.featured ? "primary" : "default"}
                      block
                      size="large"
                    >
                      Choose {plan.name}
                    </Button>
                    <div className="mt-6 grid gap-3">
                      {plan.features.map((feature) => (
                        <div key={feature}>
                          ✓ <span className="ml-2">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      </section>
    </main>
  );
}
