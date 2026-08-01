import { useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Descriptions,
  Menu,
  Segmented,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import { LuCheck, LuCopy, LuExternalLink } from "react-icons/lu";
import Prism from "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-python";
import "prismjs/components/prism-json";
import icon from "./favicon.svg";

export const RTIFACT = {
  title: "Open API Atlas",
  icon,
  prismTheme: "prism",
};

const apis = {
  "Open-Meteo": {
    category: "Weather",
    description:
      "Retrieve current conditions and forecasts from an open-source weather service. No API key is required for non-commercial use.",
    origin: "https://api.open-meteo.com",
    path: "/v1/forecast?latitude=13.7563&longitude=100.5018&current=temperature_2m,wind_speed_10m&timezone=Asia%2FBangkok",
    docs: "https://open-meteo.com/en/docs",
    source: "https://github.com/open-meteo/open-meteo",
    parameters: [
      ["latitude", "number · required", "WGS84 latitude."],
      ["longitude", "number · required", "WGS84 longitude."],
      [
        "current",
        "string list",
        "Current variables to return, separated by commas.",
      ],
      ["timezone", "string", "IANA timezone used for timestamps."],
    ],
    schema: [
      ["latitude / longitude", "number", "Coordinates of the forecast grid."],
      ["timezone", "string", "Timezone applied to the response."],
      ["current_units", "object", "Units for each current variable."],
      ["current", "object", "Requested current values and observation time."],
    ],
    response: `{
  "latitude": 13.75,
  "longitude": 100.5,
  "timezone": "Asia/Bangkok",
  "current_units": {
    "temperature_2m": "°C",
    "wind_speed_10m": "km/h"
  },
  "current": {
    "time": "2026-07-26T12:00",
    "temperature_2m": 31.2,
    "wind_speed_10m": 12.4
  }
}`,
  },
  PokéAPI: {
    category: "Games",
    description:
      "Look up Pokémon game data by numeric ID or name through a free, open-source REST API.",
    origin: "https://pokeapi.co",
    path: "/api/v2/pokemon/pikachu",
    docs: "https://pokeapi.co/docs/v2#pokemon",
    source: "https://github.com/PokeAPI/pokeapi",
    parameters: [
      [
        "id or name",
        "integer | string · required",
        "Pokémon identifier or lowercase name.",
      ],
    ],
    schema: [
      ["id", "integer", "Resource identifier."],
      ["name", "string", "Canonical lowercase name."],
      [
        "height / weight",
        "integer",
        "Height in decimetres and weight in hectograms.",
      ],
      ["abilities", "array", "Abilities and whether each one is hidden."],
      ["types", "array", "Type assignments and their slots."],
    ],
    response: `{
  "id": 25,
  "name": "pikachu",
  "height": 4,
  "weight": 60,
  "abilities": [
    { "ability": { "name": "static" }, "is_hidden": false }
  ],
  "types": [
    { "slot": 1, "type": { "name": "electric" } }
  ]
}`,
  },
  "Open Library": {
    category: "Books",
    description:
      "Search the Internet Archive's open library catalog for works, authors, editions, and publication data.",
    origin: "https://openlibrary.org",
    path: "/search.json?q=the+lord+of+the+rings&fields=key,title,author_name,first_publish_year&limit=3",
    docs: "https://openlibrary.org/dev/docs/api/search",
    source: "https://github.com/internetarchive/openlibrary",
    parameters: [
      ["q", "string · required", "Full-text search query."],
      ["fields", "string list", "Response fields to include."],
      ["limit", "integer", "Maximum works returned for this page."],
      ["page", "integer", "One-based result page."],
    ],
    schema: [
      ["numFound", "integer", "Number of matching works."],
      ["start", "integer", "Offset of the first returned work."],
      ["docs", "array", "Matching work records with requested fields."],
    ],
    response: `{
  "numFound": 629,
  "start": 0,
  "docs": [
    {
      "key": "/works/OL27448W",
      "title": "The Lord of the Rings",
      "author_name": ["J. R. R. Tolkien"],
      "first_publish_year": 1954
    }
  ]
}`,
  },
  "Nager.Date": {
    category: "Calendars",
    description:
      "Retrieve public holidays for more than 100 countries from an MIT-licensed project and public REST API.",
    origin: "https://date.nager.at",
    path: "/api/v3/PublicHolidays/2026/US",
    docs: "https://date.nager.at/Api",
    source: "https://github.com/nager/Nager.Date",
    parameters: [
      ["year", "integer · required", "Four-digit calendar year."],
      ["countryCode", "string · required", "ISO 3166-1 alpha-2 country code."],
    ],
    schema: [
      ["date", "string", "Holiday date in YYYY-MM-DD format."],
      ["localName / name", "string", "Local and English holiday names."],
      ["countryCode", "string", "ISO country code."],
      ["global", "boolean", "Whether the holiday applies nationwide."],
      ["types", "array", "Holiday classifications."],
    ],
    response: `[
  {
    "date": "2026-01-01",
    "localName": "New Year's Day",
    "name": "New Year's Day",
    "countryCode": "US",
    "global": true,
    "types": ["Public"]
  }
]`,
  },
  Frankfurter: {
    category: "Finance",
    description:
      "Read daily reference exchange rates collected from central banks through a free, open-source currency API.",
    origin: "https://api.frankfurter.dev",
    path: "/v2/rate/EUR/USD",
    docs: "https://frankfurter.dev/",
    source: "https://github.com/lineofflight/frankfurter",
    parameters: [
      ["base", "string · required", "Base ISO 4217 currency code."],
      ["quote", "string · required", "Quote ISO 4217 currency code."],
      ["date", "date", "Optional historical date."],
      ["providers", "string list", "Optional central-bank provider filter."],
    ],
    schema: [
      ["date", "string", "Effective rate date."],
      ["base", "string", "Base currency code."],
      ["quote", "string", "Quote currency code."],
      ["rate", "number", "Units of quote currency for one base unit."],
    ],
    response: `{
  "date": "2026-07-14",
  "base": "EUR",
  "quote": "USD",
  "rate": 1.1426
}`,
  },
};

const apiOptions = Object.entries(apis).map(([name, api]) => ({
  label: name,
  value: name,
  category: api.category,
}));

const requestExamples = {
  cURL: (url) => `curl --request GET \\
  --url '${url}' \\
  --header 'Accept: application/json'`,
  JavaScript: (
    url,
  ) => `const response = await fetch("https://${url.slice(8)}", {
  headers: { Accept: "application/json" },
});

if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
const data = await response.json();`,
  Python: (url) => `response = requests.get(
    "${url}",
    headers={"Accept": "application/json"},
    timeout=10,
)
response.raise_for_status()
data = response.json()`,
};

function getHighlightedHtml(source, lang) {
  const grammar = Prism.languages[lang];
  if (!grammar) return source;
  return Prism.highlight(source, grammar, lang);
}

export default function APIDocs() {
  const [selected, setSelected] = useState("Open-Meteo");
  const [language, setLanguage] = useState("cURL");
  const [copyStatus, setCopyStatus] = useState("");
  const api = apis[selected];
  const url = `${api.origin}${api.path}`;
  const code = requestExamples[language](url);

  function selectApi(value) {
    setSelected(value);
    setCopyStatus("");
  }

  async function copyRequest() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Copy failed");
    }
  }

  const prismLang = language === "cURL" ? "bash" : language.toLowerCase();

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-4 px-4 py-4 sm:px-6">
          <Avatar shape="square">{"{}"}</Avatar>
          <div className="mr-auto">
            <strong className="block text-base">Open API Atlas</strong>
            <span className="text-sm text-muted-foreground">
              Practical requests for real open-source services
            </span>
          </div>
          <Tag color="blue">5 APIs</Tag>
          <Tag color="green">No API keys</Tag>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <section aria-labelledby="atlas-title" className="mb-8 max-w-3xl">
          <Typography.Title id="atlas-title" level={1}>
            Explore open APIs
          </Typography.Title>
          <Typography.Paragraph className="max-w-[65ch] text-lg leading-relaxed">
            Choose an API to inspect one documented endpoint, its parameters,
            response shape, and ready-to-copy requests.
          </Typography.Paragraph>
          <Alert
            type="info"
            showIcon
            title="Live third-party services"
            description="Examples follow the linked public documentation. Check each maintainer's current usage policy before relying on an API in production."
          />
        </section>

        <div className="grid items-start gap-8 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_minmax(340px,430px)]">
          <nav aria-label="Open APIs" className="lg:sticky lg:top-6">
            <Typography.Title level={2} className="text-lg">
              APIs
            </Typography.Title>
            <Select
              aria-label="Choose an API"
              className="w-full lg:hidden"
              options={apiOptions}
              value={selected}
              onChange={selectApi}
            />
            <Menu
              className="hidden lg:block"
              selectedKeys={[selected]}
              onClick={({ key }) => selectApi(key)}
              items={apiOptions.map(({ label, value, category }) => ({
                key: value,
                label: (
                  <span className="flex items-center justify-between gap-3">
                    <span>{label}</span>
                    <span className="text-xs text-muted-foreground">
                      {category}
                    </span>
                  </span>
                ),
              }))}
            />
          </nav>

          <article className="min-w-0">
            <Space wrap>
              <Tag color="green">GET</Tag>
              <Tag>{api.category}</Tag>
              <Tag>No authentication</Tag>
            </Space>
            <Typography.Title level={2} className="mb-2 mt-4">
              {selected}
            </Typography.Title>
            <Typography.Paragraph className="max-w-[65ch] text-lg leading-relaxed">
              {api.description}
            </Typography.Paragraph>
            <Space className="mb-8" wrap>
              <Button
                href={api.docs}
                target="_blank"
                rel="noreferrer"
                icon={<LuExternalLink aria-hidden="true" />}
              >
                Documentation
              </Button>
              <Button
                href={api.source}
                target="_blank"
                rel="noreferrer"
                icon={<LuExternalLink aria-hidden="true" />}
              >
                Source code
              </Button>
            </Space>

            <section aria-labelledby="endpoint-title">
              <Typography.Title id="endpoint-title" level={3}>
                Endpoint
              </Typography.Title>
              <Card>
                <Space wrap>
                  <Tag color="green">GET</Tag>
                  <code className="break-all px-2 py-1 text-sm">{url}</code>
                </Space>
              </Card>
            </section>

            <section aria-labelledby="parameters-title" className="mt-10">
              <Typography.Title id="parameters-title" level={3}>
                Parameters
              </Typography.Title>
              <Card>
                <Descriptions
                  column={1}
                  items={api.parameters.map(([name, type, detail]) => ({
                    key: name,
                    label: <code>{name}</code>,
                    children: (
                      <>
                        <strong>{type}</strong> · {detail}
                      </>
                    ),
                  }))}
                />
              </Card>
            </section>

            <section aria-labelledby="schema-title" className="mt-10">
              <Typography.Title id="schema-title" level={3}>
                Response fields
              </Typography.Title>
              <Card>
                <Descriptions
                  column={1}
                  items={api.schema.map(([name, type, detail]) => ({
                    key: name,
                    label: <code>{name}</code>,
                    children: (
                      <>
                        <strong>{type}</strong> · {detail}
                      </>
                    ),
                  }))}
                />
              </Card>
            </section>
          </article>

          <aside
            aria-labelledby="request-example-title"
            className="min-w-0 lg:col-start-2 xl:col-start-3 xl:row-start-1"
          >
            <div className="xl:sticky xl:top-6">
              <Typography.Title
                id="request-example-title"
                level={2}
                className="text-lg"
              >
                Request example
              </Typography.Title>
              <Card>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <Segmented
                    block
                    options={Object.keys(requestExamples)}
                    value={language}
                    onChange={(value) => {
                      setLanguage(value);
                      setCopyStatus("");
                    }}
                  />
                  <Button
                    aria-describedby="copy-status"
                    icon={
                      copyStatus === "Copied" ? (
                        <LuCheck aria-hidden="true" />
                      ) : (
                        <LuCopy aria-hidden="true" />
                      )
                    }
                    onClick={copyRequest}
                  >
                    Copy
                  </Button>
                  <span
                    id="copy-status"
                    role="status"
                    className={
                      copyStatus === "Copy failed"
                        ? "text-sm text-danger"
                        : "text-sm text-success"
                    }
                  >
                    {copyStatus}
                  </span>
                </div>
                <pre
                  className={`language-${prismLang} max-w-full overflow-x-auto p-4 text-sm leading-6`}
                >
                  <code
                    className={`language-${prismLang}`}
                    dangerouslySetInnerHTML={{
                      __html: getHighlightedHtml(code, prismLang),
                    }}
                  />
                </pre>
              </Card>

              <Card className="mt-6" title="Example response shape">
                <pre className="language-json max-w-full overflow-x-auto p-4 text-sm leading-6">
                  <code
                    className="language-json"
                    dangerouslySetInnerHTML={{
                      __html: getHighlightedHtml(api.response, "json"),
                    }}
                  />
                </pre>
              </Card>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
