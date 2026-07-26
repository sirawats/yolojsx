import path from "node:path";
import { fileURLToPath } from "node:url";

const skillsDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../skills",
);

export default async () => ({
  config: async (config) => {
    config.skills ??= {};
    config.skills.paths ??= [];
    if (!config.skills.paths.includes(skillsDirectory)) {
      config.skills.paths.push(skillsDirectory);
    }
  },
});
