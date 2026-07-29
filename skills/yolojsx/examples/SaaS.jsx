import { useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  InputNumber,
  Row,
  Segmented,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  LuCheck,
  LuLayoutDashboard,
  LuShieldCheck,
  LuWaypoints,
} from "react-icons/lu";
import icon from "./favicon.svg";

export const YOLOJSX = {
  title: "Nimbus — Product and Pricing Concept",
  icon,
};

const plans = [
  {
    name: "Starter",
    monthly: 19,
    maxSeats: 5,
    description: "For a small team shaping one repeatable workflow.",
    features: ["3 active projects", "5 collaborators", "7-day history"],
  },
  {
    name: "Scale",
    monthly: 49,
    maxSeats: 25,
    description: "For a growing team coordinating work across projects.",
    features: [
      "Unlimited projects",
      "25 collaborators",
      "Audit log",
      "Priority support",
    ],
  },
  {
    name: "Company",
    monthly: 99,
    maxSeats: Infinity,
    description: "For an organization that needs identity and data controls.",
    features: [
      "Unlimited collaborators",
      "SAML SSO",
      "Custom retention",
      "Private regions",
    ],
  },
];

const capabilities = [
  {
    icon: LuLayoutDashboard,
    title: "See the work",
    text: "Bring priorities, owners, and delivery status into one scannable view.",
  },
  {
    icon: LuWaypoints,
    title: "Keep decisions attached",
    text: "Record why work changed so the next handoff starts with context.",
  },
  {
    icon: LuShieldCheck,
    title: "Add control as you grow",
    text: "Move from a focused team workspace to identity and retention controls.",
  },
];

export default function SaaS() {
  const [billing, setBilling] = useState("Yearly");
  const [teamSize, setTeamSize] = useState(8);
  const yearly = billing === "Yearly";
  const recommended =
    plans.find((plan) => teamSize <= plan.maxSeats) ?? plans.at(-1);

  return (
    <main className="min-h-screen overflow-hidden">
      <nav
        aria-label="Nimbus concept navigation"
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6"
      >
        <a
          href="#top"
          className="flex items-center gap-3 text-lg font-bold no-underline"
        >
          <Avatar shape="square">N</Avatar>
          Nimbus
        </a>
        <div className="hidden items-center gap-7 text-sm md:flex">
          <a href="#workspace">Product</a>
          <a href="#capabilities">Capabilities</a>
          <a href="#pricing">Pricing</a>
        </div>
        <Button href="#pricing" type="primary">
          Compare plans
        </Button>
      </nav>

      <header id="top" className="relative px-4 pb-20 pt-14 sm:px-6 lg:pt-20">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[56rem] -translate-x-1/2 rounded-full bg-primary opacity-[0.08] blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <Tag color="blue" className="mb-5">
            Product concept
          </Tag>
          <Typography.Title className="mx-auto mb-5 max-w-4xl text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Turn scattered work into steady momentum.
          </Typography.Title>
          <Typography.Paragraph
            type="secondary"
            className="mx-auto mb-8 max-w-2xl text-lg leading-8"
          >
            Nimbus is a proposed team workspace for planning, decisions, and
            delivery. Explore the interface, then compare the illustrative plans
            for your team size.
          </Typography.Paragraph>
          <Space size="middle" wrap>
            <Button type="primary" size="large" href="#workspace">
              Explore the concept
            </Button>
            <Button size="large" href="#pricing">
              Compare pricing
            </Button>
          </Space>
        </div>

        <section
          id="workspace"
          aria-labelledby="workspace-heading"
          className="relative mx-auto mt-14 max-w-5xl rounded-2xl border border-border bg-card p-3 shadow-card"
        >
          <div className="rounded-xl border border-border bg-background">
            <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
              <span className="text-sm font-semibold">Nimbus workspace</span>
              <Tag>Illustrative interface</Tag>
            </div>
            <div className="grid md:grid-cols-[12rem_1fr]">
              <aside
                aria-label="Workspace sections"
                className="hidden border-r border-border p-4 text-sm text-muted-foreground md:grid md:content-start md:gap-3"
              >
                <strong className="text-foreground">Launch workspace</strong>
                <span>Overview</span>
                <span>My work</span>
                <span>Roadmap</span>
                <span>Decisions</span>
              </aside>
              <div className="p-5 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Typography.Text type="secondary">
                      EXAMPLE PROJECT
                    </Typography.Text>
                    <h2
                      id="workspace-heading"
                      className="mt-1 text-2xl font-semibold"
                    >
                      Launch readiness
                    </h2>
                  </div>
                  <Tag color="gold">2 decisions needed</Tag>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[
                    ["Onboarding", "Ready for review"],
                    ["Billing", "Decision needed"],
                    ["Launch kit", "Draft in progress"],
                  ].map(([item, status]) => (
                    <Card key={item} size="small">
                      <Typography.Text type="secondary" className="text-xs">
                        WORKSTREAM
                      </Typography.Text>
                      <h3 className="mb-2 mt-5 text-base font-semibold">
                        {item}
                      </h3>
                      <Typography.Text type="secondary">
                        {status}
                      </Typography.Text>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </header>

      <section
        id="capabilities"
        aria-labelledby="capabilities-heading"
        className="border-y border-border bg-card px-4 py-16 sm:px-6"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-2xl">
            <Typography.Title level={2} id="capabilities-heading">
              A calmer path from plan to delivery
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="text-base">
              The concept centers the information a team needs to choose,
              coordinate, and explain its next move.
            </Typography.Paragraph>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {capabilities.map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <Icon
                  aria-hidden="true"
                  className="mb-4 text-2xl text-primary"
                />
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 max-w-prose leading-7 text-muted-foreground">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="pricing"
        aria-labelledby="pricing-heading"
        className="px-4 py-20 sm:px-6"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-3xl">
            <Tag color="gold">Illustrative pricing</Tag>
            <Typography.Title
              level={2}
              id="pricing-heading"
              className="mb-2 mt-3"
            >
              Compare the right starting plan
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="text-base">
              Adjust team size and billing to compare this product concept.
              These prices are examples, not a live offer.
            </Typography.Paragraph>
          </div>

          <Card className="mb-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="team-size" className="mb-2 block font-semibold">
                  Team size
                </label>
                <InputNumber
                  id="team-size"
                  min={1}
                  max={500}
                  value={teamSize}
                  onChange={(value) =>
                    typeof value === "number" && setTeamSize(value)
                  }
                  className="w-full"
                  addonAfter="people"
                />
              </div>
              <div role="group" aria-labelledby="billing-label">
                <div id="billing-label" className="mb-2 font-semibold">
                  Billing cycle
                </div>
                <Segmented
                  block
                  options={["Monthly", "Yearly"]}
                  value={billing}
                  onChange={setBilling}
                />
              </div>
            </div>
          </Card>

          <div aria-live="polite" className="mb-6">
            <Alert
              type="info"
              showIcon
              title={`${recommended.name} fits a ${teamSize}-person team`}
              description={
                yearly
                  ? "Yearly billing reduces the displayed monthly equivalent by 20%."
                  : "Switch to yearly billing to compare the 20% illustrative discount."
              }
            />
          </div>

          <Row gutter={[20, 20]}>
            {plans.map((plan) => {
              const fits = teamSize <= plan.maxSeats;
              const monthly = yearly
                ? Math.round(plan.monthly * 0.8)
                : plan.monthly;
              const annual = Math.round(plan.monthly * 12 * 0.8);
              const recommendedPlan = plan.name === recommended.name;

              return (
                <Col key={plan.name} xs={24} lg={8}>
                  <Card
                    className={`h-full ${recommendedPlan ? "border-primary shadow-card" : ""}`}
                  >
                    <div className="flex min-h-8 items-start justify-between gap-3">
                      <h3 className="text-xl font-semibold">{plan.name}</h3>
                      {recommendedPlan && <Tag color="blue">Best fit</Tag>}
                    </div>
                    <Typography.Paragraph type="secondary" className="min-h-12">
                      {plan.description}
                    </Typography.Paragraph>
                    <div className="my-6">
                      <span className="text-4xl font-semibold">${monthly}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        / team / month
                      </span>
                      <Typography.Text type="secondary" className="mt-2 block">
                        {yearly ? `Billed $${annual} yearly` : "Billed monthly"}
                      </Typography.Text>
                    </div>
                    {!fits && (
                      <Tag color="gold" className="mb-4">
                        Supports fewer than {teamSize} people
                      </Tag>
                    )}
                    <ul className="grid gap-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex gap-2">
                          <LuCheck
                            aria-hidden="true"
                            className="mt-1 shrink-0 text-success"
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
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
