import { useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Collapse,
  Descriptions,
  Flex,
  Input,
  Layout,
  Menu,
  Segmented,
  Space,
  Tabs,
  Tag,
  Typography,
} from "antd";
import icon from "./favicon.svg";

export const YOLOJSX = {
  title: "Orbit API Reference",
  icon,
};

const endpoints = {
  "List events": {
    method: "GET",
    path: "/v1/events",
    description: "Return a cursor-paginated stream of workspace events.",
    response: `{
  "data": [
    { "id": "evt_9d2", "type": "deploy.ready", "created_at": "2026-07-22T10:04:18Z" }
  ],
  "next_cursor": "eyJpZCI6ImV2dF85ZDIifQ"
}`,
  },
  "Create token": {
    method: "POST",
    path: "/v1/tokens",
    description: "Create a scoped access token for a service identity.",
    response: `{
  "id": "tok_live_k8q",
  "secret": "shown_once",
  "scopes": ["events:read"]
}`,
  },
  "Revoke token": {
    method: "DELETE",
    path: "/v1/tokens/{token_id}",
    description: "Revoke an access token immediately and idempotently.",
    response: `{ "id": "tok_live_k8q", "revoked": true }`,
  },
};

const requestExamples = {
  cURL: (endpoint) => `curl --request ${endpoint.method} \\
  --url https://api.orbit.dev${endpoint.path} \\
  --header 'Authorization: Bearer $ORBIT_TOKEN'`,
  JavaScript: (endpoint) => `const response = await fetch(
  "https://api.orbit.dev${endpoint.path}",
  { method: "${endpoint.method}", headers: { Authorization: \`Bearer \${token}\` } }
);

const result = await response.json();`,
  Python: (endpoint) => `response = requests.${endpoint.method.toLowerCase()}(
    "https://api.orbit.dev${endpoint.path}",
    headers={"Authorization": f"Bearer {token}"},
)

result = response.json()`,
};

const methodColor = {
  GET: "green",
  POST: "blue",
  DELETE: "red",
};

const navigationItems = [
  {
    type: "group",
    label: "Endpoints",
    children: Object.entries(endpoints).map(([name, endpoint]) => ({
      key: name,
      label: (
        <>
          <Tag color={methodColor[endpoint.method]}>{endpoint.method}</Tag>
          {name}
        </>
      ),
    })),
  },
  {
    type: "group",
    label: "Guides",
    children: ["Authentication", "Pagination", "Errors", "Webhooks"].map(
      (name) => ({
        key: `guide-${name.toLowerCase()}`,
        label: <a href={`#${name.toLowerCase()}`}>{name}</a>,
      }),
    ),
  },
];

export default function APIDocs() {
  const [selected, setSelected] = useState("List events");
  const [language, setLanguage] = useState("cURL");
  const endpoint = endpoints[selected];
  const code = useMemo(
    () => requestExamples[language](endpoint),
    [endpoint, language],
  );

  return (
    <Layout className="min-h-screen">
      <Layout.Header className="border-b border-border">
        <Flex
          className="mx-auto h-full max-w-[1500px]"
          align="center"
          gap="middle"
          wrap
        >
          <Flex className="mr-auto" align="center" gap="small">
            <Avatar shape="square">O</Avatar>
            <strong>Orbit API</strong>
            <Tag>v1.8</Tag>
          </Flex>
          <Input.Search
            placeholder="Search documentation"
            className="max-w-sm"
          />
          <Button type="primary">Get API key</Button>
        </Flex>
      </Layout.Header>

      <Layout className="mx-auto w-full max-w-[1500px]">
        <Layout.Sider
          width={250}
          breakpoint="lg"
          collapsedWidth={0}
          theme="light"
        >
          <Menu
            mode="inline"
            items={navigationItems}
            selectedKeys={[selected]}
            onClick={({ key }) => {
              if (endpoints[key]) setSelected(key);
            }}
          />
        </Layout.Sider>

        <Layout.Content className="min-w-0 px-6 py-8 xl:px-10">
          <Space className="mb-4" wrap>
            <Tag color={methodColor[endpoint.method]}>{endpoint.method}</Tag>
            <code className="px-2 py-1 text-sm">{endpoint.path}</code>
          </Space>
          <Typography.Title>{selected}</Typography.Title>
          <Typography.Paragraph type="secondary" className="text-lg">
            {endpoint.description}
          </Typography.Paragraph>

          <Card className="mt-8" title="Request">
            <Descriptions
              column={1}
              items={[
                {
                  key: "authorization",
                  label: "Authorization",
                  children: (
                    <>
                      <code>Bearer token</code> <Tag color="red">required</Tag>
                    </>
                  ),
                },
                {
                  key: "limit",
                  label: "limit",
                  children: <>Integer · 1–100 · default 25</>,
                },
                {
                  key: "cursor",
                  label: "cursor",
                  children: <>Opaque pagination cursor</>,
                },
              ]}
            />
          </Card>

          <Typography.Title level={2} className="mt-10">
            Response schema
          </Typography.Title>
          <Collapse
            items={[
              {
                key: "data",
                label: (
                  <>
                    <Badge status="success" /> <code>data</code> · array
                  </>
                ),
                children: "The ordered collection of event objects.",
              },
              {
                key: "cursor",
                label: (
                  <>
                    <Badge status="default" /> <code>next_cursor</code> · string
                    | null
                  </>
                ),
                children: "Pass this value as cursor to request the next page.",
              },
              {
                key: "request",
                label: (
                  <>
                    <Badge status="default" /> <code>request_id</code> · string
                  </>
                ),
                children: "Include this identifier when contacting support.",
              },
            ]}
            defaultActiveKey={["data"]}
          />
        </Layout.Content>

        <aside className="border-l border-border bg-card p-5 xl:p-7">
          <div className="sticky top-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <Segmented
                options={["cURL", "JavaScript", "Python"]}
                value={language}
                onChange={setLanguage}
              />
              <Button size="small">Copy</Button>
            </div>
            <pre className="p-5 text-sm leading-6">
              <code>{code}</code>
            </pre>
            <Tabs
              className="mt-6"
              defaultActiveKey="response"
              items={[
                {
                  key: "response",
                  label: "200 Response",
                  children: (
                    <pre className="p-5 text-sm leading-6">
                      <code>{endpoint.response}</code>
                    </pre>
                  ),
                },
                {
                  key: "headers",
                  label: "Headers",
                  children: (
                    <pre className="p-5 text-sm">
                      <code>{`x-request-id: req_7ab\nx-ratelimit-remaining: 998`}</code>
                    </pre>
                  ),
                },
              ]}
            />
          </div>
        </aside>
      </Layout>
    </Layout>
  );
}
