import { Button, Card, Space, Typography } from "antd";
import icon from "./favicon.svg";

export const YOLOJSX = {
  title: "yolojsx — Build First, Configure Never",
  icon,
};

export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center p-8">
      <Card className="max-w-xl">
        <Space orientation="vertical" size="large">
          <Typography.Title>Build first. Configure never.</Typography.Title>
          <Typography.Text type="secondary">
            This page combines Tailwind CSS utilities with Ant Design
            components.
          </Typography.Text>
          <Button type="primary">Hello from yolojsx</Button>
        </Space>
      </Card>
    </main>
  );
}
