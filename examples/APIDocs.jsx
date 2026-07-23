import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Collapse,
  Descriptions,
  Input,
  Segmented,
  Space,
  Tabs,
  Tag,
  Typography,
} from "antd";

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

export default function APIDocs() {
  const [selected, setSelected] = useState("List events");
  const [language, setLanguage] = useState("cURL");
  const endpoint = endpoints[selected];
  const code = useMemo(() => requestExamples[language](endpoint), [endpoint, language]);

  return (
    <main className="min-h-screen bg-yolo-canvas text-yolo-text">
      <header className="border-b border-yolo-border bg-yolo-surface px-5 py-3">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-4">
          <div className="mr-auto flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg bg-yolo-primary font-bold text-yolo-primary-text">O</div>
            <strong>Orbit API</strong>
            <Tag>v1.8</Tag>
          </div>
          <Input.Search placeholder="Search documentation" className="max-w-sm" />
          <Button type="primary">Get API key</Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[250px_minmax(0,1fr)_minmax(340px,0.8fr)]">
        <aside className="border-r border-yolo-border px-5 py-7 lg:min-h-[calc(100vh-65px)]">
          <Typography.Text className="text-xs font-semibold uppercase tracking-wider text-yolo-text-muted">Endpoints</Typography.Text>
          <div className="mt-3 grid gap-1">
            {Object.entries(endpoints).map(([name, item]) => (
              <button
                key={name}
                type="button"
                onClick={() => setSelected(name)}
                className={`flex cursor-pointer items-center gap-3 border-0 px-3 py-2.5 text-left ${selected === name ? "bg-yolo-code-background text-yolo-primary" : "bg-transparent text-yolo-text-muted"}`}
              >
                <span className={`w-12 font-yolo-mono text-[11px] font-bold ${item.method === "GET" ? "text-yolo-success" : item.method === "POST" ? "text-yolo-primary" : "text-yolo-danger"}`}>
                  {item.method}
                </span>
                <span>{name}</span>
              </button>
            ))}
          </div>
          <Typography.Text className="mt-8 block text-xs font-semibold uppercase tracking-wider text-yolo-text-muted">Guides</Typography.Text>
          <nav className="mt-3 grid gap-2 text-sm text-yolo-text-muted">
            <a href="#authentication">Authentication</a>
            <a href="#pagination">Pagination</a>
            <a href="#errors">Errors</a>
            <a href="#webhooks">Webhooks</a>
          </nav>
        </aside>

        <article className="min-w-0 px-6 py-8 xl:px-10">
          <Space className="mb-4" wrap>
            <Tag color={endpoint.method === "GET" ? "green" : endpoint.method === "POST" ? "blue" : "red"}>{endpoint.method}</Tag>
            <code className="px-2 py-1 text-sm">{endpoint.path}</code>
          </Space>
          <Typography.Title className="!mb-3">{selected}</Typography.Title>
          <Typography.Paragraph className="!text-lg text-yolo-text-muted">{endpoint.description}</Typography.Paragraph>

          <Card className="yolo-surface mt-8" title="Request">
            <Descriptions
              column={1}
              items={[
                { key: "authorization", label: "Authorization", children: <><code>Bearer token</code> <Tag color="red">required</Tag></> },
                { key: "limit", label: "limit", children: <>Integer · 1–100 · default 25</> },
                { key: "cursor", label: "cursor", children: <>Opaque pagination cursor</> },
              ]}
            />
          </Card>

          <Typography.Title level={2} className="!mt-10">Response schema</Typography.Title>
          <Collapse
            items={[
              { key: "data", label: <><Badge status="success" /> <code>data</code> · array</>, children: "The ordered collection of event objects." },
              { key: "cursor", label: <><Badge status="default" /> <code>next_cursor</code> · string | null</>, children: "Pass this value as cursor to request the next page." },
              { key: "request", label: <><Badge status="default" /> <code>request_id</code> · string</>, children: "Include this identifier when contacting support." },
            ]}
            defaultActiveKey={["data"]}
          />
        </article>

        <aside className="border-l border-yolo-border bg-yolo-code-background p-5 xl:p-7">
          <div className="sticky top-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <Segmented options={["cURL", "JavaScript", "Python"]} value={language} onChange={setLanguage} />
              <Button size="small">Copy</Button>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-[#111827] p-5 text-sm leading-6 text-[#dbeafe]"><code>{code}</code></pre>
            <Tabs
              className="mt-6"
              defaultActiveKey="response"
              items={[
                { key: "response", label: "200 Response", children: <pre className="overflow-x-auto rounded-lg bg-[#111827] p-5 text-sm leading-6 text-[#d1fae5]"><code>{endpoint.response}</code></pre> },
                { key: "headers", label: "Headers", children: <pre className="rounded-lg bg-[#111827] p-5 text-sm text-[#dbeafe]"><code>{`x-request-id: req_7ab\nx-ratelimit-remaining: 998`}</code></pre> },
              ]}
            />
          </div>
        </aside>
      </div>
    </main>
  );
}
