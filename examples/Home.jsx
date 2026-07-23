import { Button, Card, Space, Typography } from "antd";

export default function Home() {
  return (
    <main className="min-h-screen bg-yolo-canvas p-8 text-yolo-text">
      <Card className="yolo-surface mx-auto max-w-xl">
        <Space orientation="vertical" size="large">
          <Typography.Title className="m-0">
            Build first. Configure never.
          </Typography.Title>
          <Typography.Text className="text-yolo-text-muted">
            This page combines Tailwind CSS utilities with Ant Design components.
          </Typography.Text>
          <Button type="primary">Hello from yolo-jsx</Button>
        </Space>
      </Card>
    </main>
  );
}
