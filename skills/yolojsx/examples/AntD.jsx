import { useRef, useState } from "react";
import {
  Affix,
  Alert,
  Anchor,
  App as AntApp,
  AutoComplete,
  Avatar,
  Badge,
  BorderBeam,
  Breadcrumb,
  Button,
  Calendar,
  Card,
  Carousel,
  Cascader,
  Checkbox,
  Col,
  Collapse,
  ColorPicker,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Dropdown,
  Empty,
  Flex,
  FloatButton,
  Form,
  Image,
  Input,
  InputNumber,
  Layout,
  List,
  Masonry,
  Mentions,
  Menu,
  Modal,
  Pagination,
  Popconfirm,
  Popover,
  Progress,
  QRCode,
  Radio,
  Rate,
  Result,
  Row,
  Segmented,
  Select,
  Skeleton,
  Slider,
  Space,
  Spin,
  Splitter,
  Statistic,
  Steps,
  Switch,
  Table,
  Tabs,
  Tag,
  TimePicker,
  Timeline,
  Tooltip,
  Tour,
  Transfer,
  Tree,
  TreeSelect,
  Typography,
  Upload,
  Watermark,
} from "antd";
import {
  LuBell,
  LuCheck,
  LuEllipsis,
  LuInbox,
  LuUpload,
  LuUser,
} from "react-icons/lu";
import icon from "./favicon.svg";

export const YOLOJSX = {
  title: "Ant Design Component Theme Review",
  icon,
};

const CATALOG = {
  General: ["Button", "FloatButton", "Typography"],
  Layout: [
    "Divider",
    "Flex",
    "Grid (Row / Col)",
    "Layout",
    "Space",
    "Splitter",
  ],
  Navigation: [
    "Affix",
    "Anchor",
    "Breadcrumb",
    "Dropdown",
    "Menu",
    "Pagination",
    "Steps",
  ],
  "Data Entry": [
    "AutoComplete",
    "Cascader",
    "Checkbox",
    "ColorPicker",
    "DatePicker",
    "Form",
    "Input",
    "InputNumber",
    "Mentions",
    "Radio",
    "Rate",
    "Select",
    "Slider",
    "Switch",
    "TimePicker",
    "Transfer",
    "TreeSelect",
    "Upload",
  ],
  "Data Display": [
    "Avatar",
    "Badge",
    "BorderBeam",
    "Calendar",
    "Card",
    "Carousel",
    "Collapse",
    "Descriptions",
    "Empty",
    "Image",
    "List",
    "Masonry",
    "Popover",
    "QRCode",
    "Segmented",
    "Statistic",
    "Table",
    "Tabs",
    "Tag",
    "Timeline",
    "Tooltip",
    "Tour",
    "Tree",
  ],
  Feedback: [
    "Alert",
    "Drawer",
    "message",
    "Modal",
    "notification",
    "Popconfirm",
    "Progress",
    "Result",
    "Skeleton",
    "Spin",
    "Watermark",
  ],
  Infrastructure: ["App"],
};

const COMPONENT_COUNT = Object.values(CATALOG).flat().length;
const options = ["Alpha", "Beta", "Gamma"].map((value) => ({
  value: value.toLowerCase(),
  label: value,
}));
const treeData = [
  {
    title: "Design system",
    key: "design",
    children: [
      { title: "Foundations", key: "foundations" },
      { title: "Components", key: "components" },
    ],
  },
  { title: "Applications", key: "applications" },
];
const transferData = options.map(({ value, label }) => ({
  key: value,
  title: label,
}));
const tableColumns = [
  { title: "Component", dataIndex: "component" },
  { title: "State", dataIndex: "state" },
  {
    title: "Status",
    dataIndex: "status",
    render: (status) => (
      <Tag color={status === "Ready" ? "success" : "warning"}>{status}</Tag>
    ),
  },
];
const tableData = [
  { key: 1, component: "Table", state: "Default", status: "Ready" },
  { key: 2, component: "Slider", state: "Enabled", status: "Review" },
  { key: 3, component: "Input", state: "Disabled", status: "Ready" },
];
const masonryItems = [
  { key: 1, data: { title: "Compact", lines: 1 } },
  { key: 2, data: { title: "Medium", lines: 3 } },
  { key: 3, data: { title: "Tall", lines: 5 } },
  { key: 4, data: { title: "Compact", lines: 2 } },
];

const { Header, Sider, Content, Footer } = Layout;
const { TextArea } = Input;
const { Dragger } = Upload;

function Demo({ title, children, wide = false }) {
  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <Typography.Text strong className="mb-3 block">
        {title}
      </Typography.Text>
      <div className="min-w-0 rounded-md border border-border p-4">
        {children}
      </div>
    </div>
  );
}

function Section({ id, title, components, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-4">
      <Card
        title={
          <div>
            <Typography.Title id={`${id}-heading`} level={2} className="m-0">
              {title}
            </Typography.Title>
            <Typography.Text type="secondary" className="text-sm font-normal">
              {components.join(" · ")}
            </Typography.Text>
          </div>
        }
      >
        <div className="grid gap-5 md:grid-cols-2">{children}</div>
      </Card>
    </section>
  );
}

function Showcase() {
  const { message, notification, modal } = AntApp.useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [transferTargetKeys, setTransferTargetKeys] = useState(["gamma"]);
  const tourTarget = useRef(null);

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <FloatButton.Group shape="square">
        <Tooltip title="Theme review actions" placement="left">
          <FloatButton icon={<LuEllipsis aria-hidden="true" />} />
        </Tooltip>
        <FloatButton
          icon={<LuBell aria-hidden="true" />}
          onClick={() => notification.info({ message: "Notification sample" })}
        />
        <FloatButton.BackTop visibilityHeight={300} />
      </FloatButton.Group>

      <article className="mx-auto max-w-7xl space-y-5">
        <header>
          <Flex justify="space-between" align="start" gap="middle" wrap>
            <div>
              <Typography.Text
                type="secondary"
                className="text-xs uppercase tracking-[0.16em]"
              >
                Ant Design 6.5 theme audit
              </Typography.Text>
              <Typography.Title className="mb-2 mt-1">
                Component theme review
              </Typography.Title>
              <Typography.Paragraph
                type="secondary"
                className="mb-0 max-w-3xl text-base"
              >
                Review enabled, disabled, selected, status, surface, overlay,
                and motion states across the complete visual component catalog.
              </Typography.Paragraph>
            </div>
            <Badge count={COMPONENT_COUNT} overflowCount={999}>
              <Tag color="blue" className="px-3 py-1 text-sm">
                Components covered
              </Tag>
            </Badge>
          </Flex>
        </header>

        <Alert
          showIcon
          type="info"
          message="How to review"
          description="Change the yolojsx theme, scan every section, and interact with hover, focus, selected, disabled, popup, and portal states. Infrastructure-only exports are documented at the end."
        />

        <Card size="small">
          <Anchor
            direction="horizontal"
            items={Object.keys(CATALOG).map((category) => ({
              key: category,
              href: `#${category.toLowerCase().replaceAll(" ", "-")}`,
              title: category,
            }))}
          />
        </Card>

        <Section id="general" title="General" components={CATALOG.General}>
          <Demo title="Button">
            <Space wrap>
              <Button type="primary">Primary</Button>
              <Button>Default</Button>
              <Button type="dashed">Dashed</Button>
              <Button type="text">Text</Button>
              <Button type="link">Link</Button>
              <Button danger>Danger</Button>
              <Button disabled>Disabled</Button>
              <Button loading>Loading</Button>
            </Space>
          </Demo>
          <Demo title="Typography">
            <Typography.Title level={3}>Heading level three</Typography.Title>
            <Typography.Paragraph>
              Body copy with <Typography.Text strong>strong</Typography.Text>,{" "}
              <Typography.Text code>code</Typography.Text>,{" "}
              <Typography.Text mark>marked</Typography.Text>, and{" "}
              <Typography.Link href="#general">linked text</Typography.Link>.
            </Typography.Paragraph>
            <Typography.Text type="secondary">Secondary text</Typography.Text>
          </Demo>
        </Section>

        <Section id="layout" title="Layout" components={CATALOG.Layout}>
          <Demo title="Flex · Space · Divider · Grid">
            <Flex gap="small" wrap>
              <Tag>Flex one</Tag>
              <Tag>Flex two</Tag>
              <Tag>Flex three</Tag>
            </Flex>
            <Divider orientation="left">Grid</Divider>
            <Row gutter={[8, 8]}>
              {[1, 2, 3, 4].map((value) => (
                <Col key={value} xs={12} sm={6}>
                  <Card size="small" className="text-center">
                    Col {value}
                  </Card>
                </Col>
              ))}
            </Row>
            <Space
              className="mt-3"
              wrap
              split={<Divider orientation="vertical" />}
            >
              <Typography.Text>Space</Typography.Text>
              <Typography.Text>with</Typography.Text>
              <Typography.Text>split</Typography.Text>
            </Space>
          </Demo>
          <Demo title="Splitter">
            <Splitter className="h-40 rounded-md border border-border">
              <Splitter.Panel min="25%">
                <div className="p-4">Resizable panel</div>
              </Splitter.Panel>
              <Splitter.Panel>
                <div className="p-4">Second panel</div>
              </Splitter.Panel>
            </Splitter>
          </Demo>
          <Demo title="Layout" wide>
            <Layout className="overflow-hidden rounded-md">
              <Header className="px-4">Header</Header>
              <Layout>
                <Sider width={120} className="p-4">
                  Sider
                </Sider>
                <Content className="min-h-28 p-4">Content</Content>
              </Layout>
              <Footer className="p-4 text-center">Footer</Footer>
            </Layout>
          </Demo>
        </Section>

        <Section
          id="navigation"
          title="Navigation"
          components={CATALOG.Navigation}
        >
          <Demo title="Breadcrumb · Dropdown">
            <Breadcrumb
              className="mb-4"
              items={[
                { title: "Home" },
                { title: "Review" },
                { title: "Theme" },
              ]}
            />
            <Dropdown
              menu={{
                items: [
                  { key: "edit", label: "Edit" },
                  { key: "duplicate", label: "Duplicate" },
                  { type: "divider" },
                  { key: "archive", label: "Archive", danger: true },
                ],
              }}
            >
              <Button>Open dropdown</Button>
            </Dropdown>
          </Demo>
          <Demo title="Menu">
            <Menu
              mode="inline"
              defaultSelectedKeys={["components"]}
              items={[
                { key: "overview", label: "Overview" },
                { key: "components", label: "Components" },
                {
                  key: "tokens",
                  label: "Tokens",
                  children: [
                    { key: "global", label: "Global" },
                    { key: "component", label: "Component" },
                  ],
                },
              ]}
            />
          </Demo>
          <Demo title="Pagination">
            <Pagination defaultCurrent={3} total={80} showSizeChanger />
          </Demo>
          <Demo title="Steps">
            <Steps
              current={1}
              items={[
                { title: "Choose" },
                { title: "Review" },
                { title: "Approve" },
              ]}
            />
          </Demo>
          <Demo title="Affix">
            <Affix offsetTop={8}>
              <Button>Affixed while scrolling</Button>
            </Affix>
          </Demo>
          <Demo title="Anchor">
            <Anchor
              items={[
                { key: "entry", href: "#data-entry", title: "Data Entry" },
                {
                  key: "display",
                  href: "#data-display",
                  title: "Data Display",
                },
                { key: "feedback", href: "#feedback", title: "Feedback" },
              ]}
            />
          </Demo>
        </Section>

        <Section
          id="data-entry"
          title="Data Entry"
          components={CATALOG["Data Entry"]}
        >
          <Demo title="Input · AutoComplete · Mentions">
            <Space orientation="vertical" className="w-full">
              <Input placeholder="Text input" allowClear />
              <Input.Password placeholder="Password" />
              <Input.Search placeholder="Search input" />
              <Input.OTP length={4} />
              <TextArea rows={2} placeholder="Text area" />
              <AutoComplete
                className="w-full"
                options={options}
                placeholder="AutoComplete"
              />
              <Mentions
                className="w-full"
                placeholder="Mention a reviewer"
                options={options}
              />
              <Input disabled value="Disabled input" />
            </Space>
          </Demo>
          <Demo title="Select · Cascader · TreeSelect">
            <Space orientation="vertical" className="w-full">
              <Select
                className="w-full"
                defaultValue="alpha"
                options={options}
              />
              <Select
                mode="multiple"
                className="w-full"
                defaultValue={["alpha", "beta"]}
                options={options}
              />
              <Cascader
                className="w-full"
                placeholder="Cascader"
                options={[
                  {
                    value: "design",
                    label: "Design",
                    children: options,
                  },
                ]}
              />
              <TreeSelect
                className="w-full"
                placeholder="TreeSelect"
                treeData={treeData.map(({ title, key, children }) => ({
                  title,
                  value: key,
                  children: children?.map((item) => ({
                    title: item.title,
                    value: item.key,
                  })),
                }))}
              />
            </Space>
          </Demo>
          <Demo title="Checkbox · Radio · Switch">
            <Space orientation="vertical">
              <Checkbox defaultChecked>Checked checkbox</Checkbox>
              <Checkbox>Unchecked checkbox</Checkbox>
              <Checkbox disabled>Disabled checkbox</Checkbox>
              <Radio.Group defaultValue="alpha" options={options} />
              <Radio.Group
                optionType="button"
                defaultValue="beta"
                options={options}
              />
              <Space>
                <Switch
                  defaultChecked
                  checkedChildren="On"
                  unCheckedChildren="Off"
                />
                <Switch disabled />
              </Space>
            </Space>
          </Demo>
          <Demo title="Slider · Rate">
            <Typography.Text>Enabled</Typography.Text>
            <Slider defaultValue={42} />
            <Typography.Text>Range</Typography.Text>
            <Slider range defaultValue={[25, 70]} />
            <Typography.Text type="secondary">
              Disabled comparison
            </Typography.Text>
            <Slider disabled defaultValue={42} />
            <Rate allowHalf defaultValue={3.5} />
          </Demo>
          <Demo title="DatePicker · TimePicker · ColorPicker · InputNumber">
            <Space wrap>
              <DatePicker />
              <TimePicker />
              <ColorPicker defaultValue="#1677ff" showText />
              <InputNumber min={0} max={100} defaultValue={42} />
              <InputNumber disabled defaultValue={42} />
            </Space>
          </Demo>
          <Demo title="Form">
            <Form layout="vertical">
              <Form.Item
                label="Project name"
                required
                validateStatus="success"
                help="Available"
              >
                <Input defaultValue="Theme review" />
              </Form.Item>
              <Form.Item
                label="Owner"
                validateStatus="error"
                help="Choose an owner"
              >
                <Select
                  status="error"
                  placeholder="Select owner"
                  options={options}
                />
              </Form.Item>
              <Button type="primary">Submit</Button>
            </Form>
          </Demo>
          <Demo title="Transfer" wide>
            <div className="overflow-x-auto">
              <Transfer
                dataSource={transferData}
                targetKeys={transferTargetKeys}
                onChange={setTransferTargetKeys}
                render={(item) => item.title}
                titles={["Available", "Selected"]}
                showSearch
              />
            </div>
          </Demo>
          <Demo title="Upload" wide>
            <Space orientation="vertical" className="w-full">
              <Upload
                beforeUpload={() => false}
                defaultFileList={[
                  { uid: "sample", name: "theme-review.png", status: "done" },
                ]}
              >
                <Button icon={<LuUpload aria-hidden="true" />}>
                  Choose file
                </Button>
              </Upload>
              <Dragger beforeUpload={() => false} showUploadList={false}>
                <LuInbox className="mx-auto mb-2 h-8 w-8" aria-hidden="true" />
                <Typography.Text>Click or drag a file here</Typography.Text>
              </Dragger>
            </Space>
          </Demo>
        </Section>

        <Section
          id="data-display"
          title="Data Display"
          components={CATALOG["Data Display"]}
        >
          <Demo title="Avatar · Badge · Tag">
            <Space wrap size="large">
              <Avatar icon={<LuUser aria-hidden="true" />} />
              <Avatar.Group>
                <Avatar>A</Avatar>
                <Avatar>B</Avatar>
                <Avatar>C</Avatar>
              </Avatar.Group>
              <Badge count={8}>
                <Avatar shape="square">N</Avatar>
              </Badge>
              <Badge status="success" text="Healthy" />
              <Tag color="success">Success</Tag>
              <Tag color="warning">Warning</Tag>
              <Tag color="error">Error</Tag>
            </Space>
          </Demo>
          <Demo title="Card · BorderBeam">
            <BorderBeam>
              <Card
                title="Beam card"
                extra={<Tag color="processing">Active</Tag>}
                actions={[
                  <Button key="action" type="text">
                    Action
                  </Button>,
                ]}
              >
                Animated border using the current component tokens.
              </Card>
            </BorderBeam>
          </Demo>
          <Demo title="Statistic">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="Components" value={COMPONENT_COUNT} />
              </Col>
              <Col span={12}>
                <Statistic title="Coverage" value={100} suffix="%" />
              </Col>
            </Row>
          </Demo>
          <Demo title="Segmented">
            <Segmented
              block
              defaultValue="Default"
              options={["Default", "Hover", "Selected", "Disabled"]}
            />
          </Demo>
          <Demo title="Descriptions" wide>
            <Descriptions
              bordered
              column={{ xs: 1, sm: 2, md: 3 }}
              items={[
                { key: "version", label: "Version", children: "6.5.1" },
                { key: "theme", label: "Theme", children: "CLI selected" },
                {
                  key: "state",
                  label: "Review state",
                  children: <Badge status="processing" text="In progress" />,
                },
              ]}
            />
          </Demo>
          <Demo title="Collapse">
            <Collapse
              defaultActiveKey={["tokens"]}
              items={[
                {
                  key: "tokens",
                  label: "Component tokens",
                  children:
                    "Inspect fills, borders, text, focus, and elevation.",
                },
                {
                  key: "states",
                  label: "Interactive states",
                  children: "Inspect hover, active, selected, and disabled.",
                },
              ]}
            />
          </Demo>
          <Demo title="Tabs">
            <Tabs
              defaultActiveKey="one"
              items={[
                { key: "one", label: "Overview", children: "Overview panel" },
                { key: "two", label: "Tokens", children: "Token panel" },
                { key: "three", label: "Disabled", disabled: true },
              ]}
            />
          </Demo>
          <Demo title="Carousel">
            <Carousel>
              {["First", "Second", "Third"].map((label) => (
                <div key={label}>
                  <div className="flex h-32 items-center justify-center rounded-md bg-code text-lg font-semibold">
                    {label} slide
                  </div>
                </div>
              ))}
            </Carousel>
          </Demo>
          <Demo title="Calendar">
            <Calendar fullscreen={false} />
          </Demo>
          <Demo title="Image · QRCode">
            <Space wrap size="large">
              <Image src={icon} width={96} alt="yolojsx icon" preview={false} />
              <QRCode value="https://github.com/sirawats/yolojsx" />
            </Space>
          </Demo>
          <Demo title="Tooltip · Popover">
            <Space wrap>
              <Tooltip title="Tooltip content">
                <Button>Hover for tooltip</Button>
              </Tooltip>
              <Popover
                title="Popover title"
                content="Popover content using elevated theme tokens."
              >
                <Button>Open popover</Button>
              </Popover>
            </Space>
          </Demo>
          <Demo title="Tree">
            <Tree
              checkable
              defaultExpandedKeys={["design"]}
              defaultCheckedKeys={["components"]}
              treeData={treeData}
            />
          </Demo>
          <Demo title="Timeline">
            <Timeline
              items={[
                { color: "green", children: "Theme loaded" },
                { color: "blue", children: "Components rendered" },
                { color: "gray", children: "Visual review pending" },
              ]}
            />
          </Demo>
          <Demo title="List">
            <List
              bordered
              dataSource={["Default state", "Selected state", "Disabled state"]}
              renderItem={(item) => (
                <List.Item actions={[<Button key="inspect">Inspect</Button>]}>
                  <List.Item.Meta
                    avatar={<Avatar>{item[0]}</Avatar>}
                    title={item}
                    description="Theme token sample"
                  />
                </List.Item>
              )}
            />
          </Demo>
          <Demo title="Masonry">
            <Masonry
              columns={{ xs: 2, sm: 3 }}
              gutter={8}
              items={masonryItems}
              itemRender={({ data }) => (
                <Card size="small" title={data.title}>
                  {Array.from({ length: data.lines }, (_, index) => (
                    <Typography.Paragraph key={index} type="secondary">
                      Content line {index + 1}
                    </Typography.Paragraph>
                  ))}
                </Card>
              )}
            />
          </Demo>
          <Demo title="Table" wide>
            <Table
              columns={tableColumns}
              dataSource={tableData}
              pagination={false}
              scroll={{ x: 560 }}
            />
          </Demo>
          <Demo title="Empty">
            <Empty description="No components filtered out" />
          </Demo>
          <Demo title="Tour">
            <Button ref={tourTarget} onClick={() => setTourOpen(true)}>
              Start tour
            </Button>
            <Tour
              open={tourOpen}
              onClose={() => setTourOpen(false)}
              steps={[
                {
                  title: "Tour component",
                  description: "Inspect the mask, popup, text, and buttons.",
                  target: () => tourTarget.current,
                },
              ]}
            />
          </Demo>
        </Section>

        <Section id="feedback" title="Feedback" components={CATALOG.Feedback}>
          <Demo title="Alert" wide>
            <Space orientation="vertical" className="w-full">
              {["success", "info", "warning", "error"].map((type) => (
                <Alert
                  key={type}
                  type={type}
                  showIcon
                  message={`${type[0].toUpperCase()}${type.slice(1)} alert`}
                  description="Foreground, background, border, and icon state."
                />
              ))}
            </Space>
          </Demo>
          <Demo title="Message · Notification">
            <Space wrap>
              <Button
                onClick={() => message.success("Message component looks good")}
              >
                Show message
              </Button>
              <Button
                onClick={() =>
                  notification.warning({
                    message: "Notification",
                    description:
                      "Review its elevated surface and status colors.",
                  })
                }
              >
                Show notification
              </Button>
            </Space>
          </Demo>
          <Demo title="Modal · Drawer">
            <Space wrap>
              <Button type="primary" onClick={() => setModalOpen(true)}>
                Open modal
              </Button>
              <Button onClick={() => setDrawerOpen(true)}>Open drawer</Button>
              <Button
                onClick={() =>
                  modal.confirm({
                    title: "Confirm modal",
                    content: "Review primary and secondary actions.",
                  })
                }
              >
                Confirm modal
              </Button>
            </Space>
            <Modal
              title="Modal component"
              open={modalOpen}
              onOk={() => setModalOpen(false)}
              onCancel={() => setModalOpen(false)}
            >
              Modal content on an elevated theme surface.
            </Modal>
            <Drawer
              title="Drawer component"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
            >
              Drawer content on an elevated theme surface.
            </Drawer>
          </Demo>
          <Demo title="Popconfirm">
            <Popconfirm
              title="Approve theme?"
              description="Check popup text and action contrast."
            >
              <Button>Open confirmation</Button>
            </Popconfirm>
          </Demo>
          <Demo title="Progress">
            <Space orientation="vertical" className="w-full">
              <Progress percent={68} />
              <Progress percent={100} status="success" />
              <Space wrap>
                <Progress type="circle" percent={68} size={90} />
                <Progress type="dashboard" percent={68} size={90} />
              </Space>
            </Space>
          </Demo>
          <Demo title="Skeleton · Spin">
            <Spin spinning>
              <Skeleton active paragraph={{ rows: 2 }} />
            </Spin>
          </Demo>
          <Demo title="Result">
            <Result
              status="success"
              title="Component rendered"
              subTitle="Inspect icon, heading, secondary text, and action."
              extra={<Button type="primary">Continue</Button>}
            />
          </Demo>
          <Demo title="Watermark" wide>
            <Watermark content="yolojsx theme review">
              <Card className="min-h-48">
                Watermark contrast should remain subtle without disappearing.
              </Card>
            </Watermark>
          </Demo>
        </Section>

        <Section
          id="infrastructure"
          title="Infrastructure"
          components={CATALOG.Infrastructure}
        >
          <Demo title="App">
            <Space>
              <LuCheck aria-hidden="true" />
              <Typography.Text>
                This entire showcase runs inside Ant Design App context.
              </Typography.Text>
            </Space>
          </Demo>
        </Section>
      </article>
    </main>
  );
}

export default function AntDesignShowcase() {
  return (
    <AntApp>
      <Showcase />
    </AntApp>
  );
}
