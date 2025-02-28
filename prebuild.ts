import fs from "fs";
import path from "path";
import pkg from "./package.json";
import { fileURLToPath } from "url";

const versionInfo = {
  version: pkg.version,
  buildDate: new Date().toISOString(),
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "version.json");
fs.writeFileSync(filePath, JSON.stringify(versionInfo, null, 2));
