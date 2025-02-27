import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import logger from "../logger";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET /version - Trả về thông tin version và build date
export const getVersion = (req: Request, res: Response) => {
  logger.info("GET /version called");
  const versionFilePath = path.join(__dirname, "..", "..", "version.json");
  fs.readFile(versionFilePath, "utf8", (err, data) => {
    if (err) {
      logger.error(`Error reading version file: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    try {
      const versionData = JSON.parse(data);
      res.json(versionData);
    } catch (parseErr) {
      logger.error(`Error parsing version file: ${parseErr.message}`);
      res.status(500).json({ error: parseErr.message });
    }
  });
};
