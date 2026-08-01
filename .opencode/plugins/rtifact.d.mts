interface OpenCodeConfig {
  skills?: { paths: string[] };
}

interface OpenCodePlugin {
  config(config: OpenCodeConfig): Promise<void>;
}

export default function createPlugin(): Promise<OpenCodePlugin>;
