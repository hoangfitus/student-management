import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import XLSX from "xlsx";
import logger from "../logger";
import { Student } from "../../src/types";
import db from "../services/db.service";
import { fileURLToPath } from "url";
import { formatDateForCSV } from "../utils/format";
// Lấy đường dẫn file hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET /export - Export data as Excel or CSV based on query parameter
export const exportData = (req: Request, res: Response) => {
  logger.info("GET /export called to export data");
  const exportType = req.query.type
    ? req.query.type.toString().toLowerCase()
    : "excel";
  db.all("SELECT * FROM students", (err, rows: Student[]) => {
    if (err) {
      logger.error(`Error exporting data: ${err.message}`);
      res.status(500).json({ error: err.message });
      return;
    }
    if (exportType === "csv") {
      const headers = [
        "mssv",
        "name",
        "dob",
        "gender",
        "faculty",
        "course",
        "program",
        "address",
        "email",
        "phone",
        "status",
      ];
      const csvRows = [headers.join(",")];
      rows.forEach((row) => {
        const values = headers.map((header) => {
          let val = row[header as keyof Student];
          if (header === "dob") {
            // Format the date field to dd/mm/yyyy
            val = formatDateForCSV(val);
          }
          // Ensure string values with commas are enclosed in quotes
          if (typeof val === "string" && val.includes(",")) {
            val = `"${val}"`;
          }
          return val;
        });
        csvRows.push(values.join(","));
      });
      const csvData = csvRows.join("\n");
      res.setHeader("Content-Disposition", "attachment; filename=students.csv");
      res.setHeader("Content-Type", "text/csv");
      logger.info(`Exported ${rows.length} student records to CSV`);
      res.send(csvData);
    } else {
      // Export as Excel
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
      const excelBuffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=students.xlsx"
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      logger.info(`Exported ${rows.length} student records to Excel`);
      res.send(excelBuffer);
    }
  });
};

function formatPhone(phone: string | number): string {
  let phoneStr = "";
  if (typeof phone === "number") {
    phoneStr = phone.toString();
  } else if (typeof phone === "string") {
    phoneStr = phone;
  }
  // Giả sử số điện thoại cần có 10 chữ số, thêm số 0 ở đầu nếu thiếu
  return phoneStr.padStart(10, "0");
}

// POST /import/data - Import dữ liệu
export const importData = (req: Request, res: Response) => {
  logger.info("POST /import called");
  let filePath = "";
  let fileType = "";
  if (req.query.sample === "true") {
    // Use sample file from folder "sample" (assumed to be Excel if not specified)
    filePath = path.join(__dirname, "..", "..", "sample", "sample.xlsx");
    fileType = path.extname(filePath).toLowerCase();
    logger.info(`Importing sample data from ${filePath}`);
  } else if (req.file) {
    filePath = req.file.path;
    fileType = path.extname(req.file.originalname).toLowerCase();
  }

  if (!filePath) {
    logger.warn("Data import attempted without a file upload");
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    let records: Student[] = [];
    if (fileType === ".csv") {
      // Process CSV file
      const csvData = fs.readFileSync(filePath, "utf8");
      const lines = csvData.split(/\r?\n/).filter((line) => line.trim() !== "");
      if (lines.length < 2)
        throw new Error("CSV file is empty or missing header");
      const headers = lines[0].split(",");
      records = lines.slice(1).map((line) => {
        const values: string[] = [];
        let inQuotes = false;
        let value = "";
        for (const char of line) {
          if (char === '"' && !inQuotes) {
            inQuotes = true;
          } else if (char === '"' && inQuotes) {
            inQuotes = false;
          } else if (char === "," && !inQuotes) {
            values.push(value.trim());
            value = "";
          } else {
            value += char;
          }
        }
        values.push(value.trim());

        const record: Student = {} as Student;
        headers.forEach((header, i) => {
          if (header.trim() === "dob") {
            record[header.trim()] = values[i]
              ? values[i].trim().replace("-", "/")
              : "";
          } else record[header.trim()] = values[i] ? values[i].trim() : "";
        });
        return record as Student;
      });
    } else if (fileType === ".xlsx" || fileType === ".xls") {
      // Process Excel file
      const fileBuffer = fs.readFileSync(filePath);
      const workbook = XLSX.read(fileBuffer, {
        type: "buffer",
        cellDates: true,
        raw: false,
        codepage: 65001,
      });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      records = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");
      const stmt = db.prepare(`INSERT OR REPLACE INTO students 
            (mssv, name, dob, gender, faculty, course, program, address, email, phone, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      for (const record of records) {
        stmt.run(
          record.mssv,
          record.name,
          String(record.dob).includes("/")
            ? record.dob
            : new Date(record.dob).toLocaleDateString("vi-VN"),
          record.gender,
          record.faculty,
          record.course,
          record.program,
          record.address,
          record.email,
          formatPhone(record.phone),
          record.status
        );
      }
      stmt.finalize();
      db.run("COMMIT", (err) => {
        if (err) {
          logger.error(
            `Error committing data import transaction: ${err.message}`
          );
          return res.status(500).json({ error: err.message });
        }
        logger.info(
          `Imported ${records.length} student records from ${fileType}`
        );
        res.json({
          message: "Data imported successfully",
          imported: records.length,
        });
      });
    });
  } catch (error: unknown) {
    const err = error as Error;
    logger.error(`Data import error: ${err.message}`);
    res.status(500).json({ error: err.message });
  } finally {
    // Only delete the uploaded file if it exists (do not delete sample file)
    if (!req.query.sample && req.file && req.file.path) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) {
          logger.error(`Error deleting uploaded file: ${unlinkErr.message}`);
        }
      });
    }
  }
};
