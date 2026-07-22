import { Button, Card, Space, Typography } from "antd";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <Card className="mx-auto max-w-xl shadow-lg">
        <Space orientation="vertical" size="large">
          <Typography.Title className="m-0">
            Build first. Configure never.
          </Typography.Title>
          <Typography.Paragraph>
            This page combines Tailwind CSS utilities with Ant Design components.
          </Typography.Paragraph>
          <Button type="primary">Hello from yolo-jsx</Button>
        </Space>
      </Card>
    </main>
  );
}
