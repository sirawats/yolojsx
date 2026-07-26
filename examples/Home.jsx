import { Card, Space, Typography } from "antd";
import icon from "./favicon.svg";

export const YOLOJSX = {
  title: "yolojsx — Build First, Configure Never",
  icon,
};

export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center p-6 sm:p-10">
      <Card className="w-full max-w-xl">
        <Space orientation="vertical" size="large" className="w-full">
          <header>
            <Typography.Title>Build first. Configure never.</Typography.Title>
            <Typography.Paragraph type="secondary" className="max-w-prose">
              Turn one JSX file into a portable, interactive React app—without
              setting up a frontend project.
            </Typography.Paragraph>
          </header>
          <section aria-labelledby="first-build">
            <Typography.Title level={2} id="first-build">
              Your first build
            </Typography.Title>
            <Typography.Text code copyable>
              yolojsx Home.jsx
            </Typography.Text>
            <Typography.Paragraph type="secondary" className="mt-4">
              Open Home.html locally or send it to someone else.
            </Typography.Paragraph>
          </section>
        </Space>
      </Card>
    </main>
  );
}
