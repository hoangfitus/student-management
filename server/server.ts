import express, { Request, Response } from "express";
import sqlite3, { Database } from "sqlite3";
import fs from "fs";
import path from "path";
import cors from "cors";
import XLSX from "xlsx";
import { fileURLToPath } from "url";
import multer from "multer";
import logger from "./logger";
import { Student } from "../src/types";

const app = express();
const PORT = process.env.PORT || 3001;

// Cấu hình middleware
app.use(cors());
app.use(express.json());

// Lấy đường dẫn file hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn đến thư mục db nằm cùng cấp với folder server
const dbFolderPath = path.join(__dirname, "..", "db");
if (!fs.existsSync(dbFolderPath)) {
  fs.mkdirSync(dbFolderPath, { recursive: true });
}
const dbPath = path.join(dbFolderPath, "db.sqlite");

// Kiểm tra xem file db có tồn tại không
const dbExists: boolean = fs.existsSync(dbPath);

// Kết nối đến cơ sở dữ liệu SQLite
const db: Database = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    logger.error(`Error connecting to database: ${err.message}`);
  } else {
    logger.info(`Connected to SQLite database at ${dbPath}`);
  }
});

// Bật hỗ trợ khóa ngoại trong SQLite
db.run("PRAGMA foreign_keys = ON");

// Nếu file db không tồn tại, tạo bảng
if (!dbExists) {
  db.serialize(() => {
    // Bảng students
    db.run(
      `CREATE TABLE IF NOT EXISTS students (
        mssv TEXT PRIMARY KEY,
        name TEXT,
        dob TEXT,
        gender TEXT,
        faculty TEXT,
        course TEXT,
        program TEXT,
        address TEXT,
        email TEXT,
        phone TEXT,
        status TEXT
      )`,
      (err) => {
        if (err) {
          logger.error(`Error creating table: ${err.message}`);
        } else {
          logger.info('Table "students" created successfully.');
        }
      }
    );

    // Bảng faculties
    db.run(
      `CREATE TABLE IF NOT EXISTS faculties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      )`,
      (err) => {
        if (err) {
          logger.error(`Error creating faculties table: ${err.message}`);
        } else {
          logger.info('Table "faculties" created successfully.');
          // Thêm các giá trị mặc định
          const defaultFaculties = [
            "Công nghệ thông tin",
            "Luật",
            "Tiếng Anh thương mại",
            "Tiếng Nhật",
            "Tiếng Pháp",
          ];
          const stmt = db.prepare("INSERT INTO faculties (name) VALUES (?)");
          for (const faculty of defaultFaculties) {
            stmt.run(faculty);
          }
          stmt.finalize();
          // Sau khi tạo bảng faculties và thêm giá trị mặc định:
          db.run(
            `CREATE TRIGGER IF NOT EXISTS update_students_department
            AFTER UPDATE ON faculties
            FOR EACH ROW
            BEGIN
            UPDATE students SET faculty = NEW.name WHERE faculty = OLD.name;
            END;`,
            (err) => {
              if (err) {
                logger.error(
                  `Error creating trigger update_students_department: ${err.message}`
                );
              } else {
                logger.info(
                  "Trigger update_students_department created successfully."
                );
              }
            }
          );
        }
      }
    );

    // Bảng student_statuses
    db.run(
      `CREATE TABLE IF NOT EXISTS student_statuses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      )`,
      (err) => {
        if (err) {
          logger.error(`Error creating student_statuses table: ${err.message}`);
        } else {
          logger.info('Table "student_statuses" created successfully.');
          // Thêm các giá trị mặc định
          const defaultStatuses = [
            "Đang học",
            "Đã tốt nghiệp",
            "Đã thôi học",
            "Tạm dừng học",
          ];
          const stmt = db.prepare(
            "INSERT INTO student_statuses (name) VALUES (?)"
          );
          for (const status of defaultStatuses) {
            stmt.run(status);
          }
          stmt.finalize();
          // Sau khi tạo bảng student_statuses và thêm giá trị mặc định:
          db.run(
            `CREATE TRIGGER IF NOT EXISTS update_students_status
             AFTER UPDATE ON student_statuses
             FOR EACH ROW
             BEGIN
               UPDATE students SET status = NEW.name WHERE status = OLD.name;
             END;`,
            (err) => {
              if (err) {
                logger.error(
                  `Error creating trigger update_students_status: ${err.message}`
                );
              } else {
                logger.info(
                  "Trigger update_students_status created successfully."
                );
              }
            }
          );
        }
      }
    );

    // Bảng programs
    db.run(
      `CREATE TABLE IF NOT EXISTS programs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      )`,
      (err) => {
        if (err) {
          logger.error(`Error creating programs table: ${err.message}`);
        } else {
          logger.info('Table "programs" created successfully.');
          // Thêm các giá trị mặc định
          const defaultPrograms = [
            "Đại trà",
            "Chất lượng cao",
            "Cử nhân tài năng",
            "Việt Pháp",
            "Tăng cường tiếng anh",
          ];
          const stmt = db.prepare("INSERT INTO programs (name) VALUES (?)");
          for (const program of defaultPrograms) {
            stmt.run(program);
          }
          stmt.finalize();
          // Sau khi tạo bảng programs và thêm giá trị mặc định:
          db.run(
            `CREATE TRIGGER IF NOT EXISTS update_students_program
             AFTER UPDATE ON programs
             FOR EACH ROW
             BEGIN
               UPDATE students SET program = NEW.name WHERE program = OLD.name;
             END;`,
            (err) => {
              if (err) {
                logger.error(
                  `Error creating trigger update_students_program: ${err.message}`
                );
              } else {
                logger.info(
                  "Trigger update_students_program created successfully."
                );
              }
            }
          );
        }
      }
    );
  });
}

// --- API endpoints ---

// GET /students?search=&faculty=&page=0&limit=20
app.get("/students", (req: Request, res: Response) => {
  const search: string = (req.query.search as string) || "";
  const faculty: string = (req.query.faculty as string) || "";
  const page: number = parseInt(req.query.page as string) || 0;
  const limit: number = parseInt(req.query.limit as string) || 20;
  const offset: number = page * limit;
  const searchParam = `%${search}%`;
  const facultyParam = `%${faculty}%`;

  logger.info(
    `GET /students called with search="${search}", faculty="${faculty}", page=${page}, limit=${limit}`
  );

  // Xây dựng phần điều kiện SQL
  const baseWhere = "WHERE (mssv LIKE ? OR name LIKE ?)";
  const countParams: (string | number)[] = [searchParam, searchParam];
  const dataParams: (string | number)[] = [searchParam, searchParam];
  let additionalWhere = "";

  if (faculty) {
    additionalWhere = " AND faculty LIKE ?";
    countParams.push(facultyParam);
    dataParams.push(facultyParam);
  }

  const countQuery = `SELECT COUNT(*) as count FROM students ${baseWhere}${additionalWhere}`;
  const dataQuery = `SELECT * FROM students ${baseWhere}${additionalWhere} ORDER BY mssv LIMIT ? OFFSET ?`;
  dataParams.push(limit, offset);

  db.get(countQuery, countParams, (err, row: { count: number }) => {
    if (err) {
      logger.error(`Error fetching student count: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    const total: number = row ? row.count : 0;
    db.all(dataQuery, dataParams, (err, rows: Student[]) => {
      if (err) {
        logger.error(`Error fetching student records: ${err.message}`);
        return res.status(500).json({ error: err.message });
      }
      logger.info(`Fetched ${rows.length} student records (total: ${total})`);
      res.json({ total, students: rows });
    });
  });
});

// POST /students - Thêm sinh viên mới
app.post("/students", (req: Request, res: Response) => {
  const student: Student = req.body;
  const sql =
    "INSERT INTO students (mssv, name, dob, gender, faculty, course, program, address, email, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const params = [
    student.mssv,
    student.name,
    new Date(student.dob).toLocaleDateString("vi-VN"),
    student.gender,
    student.faculty,
    student.course,
    student.program,
    student.address,
    student.email,
    student.phone,
    student.status,
  ];

  logger.info(`POST /students called for student MSSV: ${student.mssv}`);

  db.run(sql, params, function (err) {
    if (err) {
      logger.error(`Error adding student ${student.mssv}: ${err.message}`);
      res.status(400).json({ error: err.message });
      return;
    }
    logger.info(`Student ${student.mssv} added successfully`);
    res.json({ message: "Student added successfully", student });
  });
});

// PUT /students/:mssv - Cập nhật thông tin sinh viên
app.put("/students/:mssv", (req: Request, res: Response) => {
  const student: Student = req.body;
  const mssv = req.params.mssv;
  const sql =
    "UPDATE students SET name=?, dob=?, gender=?, faculty=?, course=?, program=?, address=?, email=?, phone=?, status=? WHERE mssv=?";
  const params = [
    student.name,
    student.dob,
    student.gender,
    student.faculty,
    student.course,
    student.program,
    student.address,
    student.email,
    student.phone,
    student.status,
    mssv,
  ];

  logger.info(`PUT /students/${mssv} called for update`);

  db.run(sql, params, function (err) {
    if (err) {
      logger.error(`Error updating student ${mssv}: ${err.message}`);
      res.status(400).json({ error: err.message });
      return;
    }
    logger.info(`Student ${mssv} updated successfully`);
    res.json({ message: "Student updated successfully", student });
  });
});

// DELETE /students/:mssv - Xóa sinh viên
app.delete("/students/:mssv", (req: Request, res: Response) => {
  const mssv = req.params.mssv;
  logger.info(`DELETE /students/${mssv} called`);

  db.run("DELETE FROM students WHERE mssv = ?", mssv, function (err) {
    if (err) {
      logger.error(`Error deleting student ${mssv}: ${err.message}`);
      res.status(400).json({ error: err.message });
      return;
    }
    logger.info(`Student ${mssv} deleted successfully`);
    res.json({ message: "Student deleted successfully" });
  });
});

// Helper function to format a date value to "dd/mm/yyyy"
function formatDateForCSV(value: string | number | Date): string {
  let d: Date;
  console.log(value);
  if (typeof value === "number") {
    // Convert Excel serial date to JavaScript Date
    d = new Date((value - 25569) * 86400 * 1000);
  } else if (typeof value === "string") {
    // Try to parse the string as a date
    d = new Date(value);
  } else if (value instanceof Date) {
    d = value;
  } else {
    return "";
  }
  if (isNaN(d.getTime())) {
    return String(value);
  }
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// GET /export - Export data as Excel or CSV based on query parameter
app.get("/export", (req: Request, res: Response) => {
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
});

// Cấu hình multer để lưu file tạm vào folder "uploads"
const upload = multer({ dest: "uploads/" });

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
app.post(
  "/import/data",
  upload.single("file"),
  (req: Request, res: Response) => {
    logger.info("POST /import/data called");
    let filePath = "";
    let fileType = "";
    if (req.query.sample === "true") {
      // Use sample file from folder "sample" (assumed to be Excel if not specified)
      filePath = path.join(__dirname, "..", "sample", "sample.xlsx");
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
        const lines = csvData
          .split(/\r?\n/)
          .filter((line) => line.trim() !== "");
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
      console.log(records);
      db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        const stmt = db.prepare(`INSERT OR REPLACE INTO students 
          (mssv, name, dob, gender, faculty, course, program, address, email, phone, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        for (const record of records) {
          stmt.run(
            record.mssv,
            record.name,
            record.dob.includes("/")
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
  }
);

// GET /version - Trả về thông tin version và build date
app.get("/version", (req: Request, res: Response) => {
  logger.info("GET /version called");
  const versionFilePath = path.join(__dirname, "..", "version.json");
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
});

// GET /faculties - Lấy danh sách khoa
app.get("/faculties", (req: Request, res: Response) => {
  logger.info("GET /faculties called");
  db.all("SELECT * FROM faculties ORDER BY name", (err, rows) => {
    if (err) {
      logger.error(`Error fetching faculties: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST /faculties - Thêm mới
app.post("/faculties", (req: Request, res: Response) => {
  logger.info("POST /faculties called to add new faculty");
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  db.run("INSERT INTO faculties (name) VALUES (?)", [name], function (err) {
    if (err) {
      logger.error(`Error adding faculty: ${err.message}`);
      return res.status(400).json({ error: err.message });
    }
    logger.info(`Faculty added successfully: ${name}`);
    res.json({ message: "Faculty added successfully", id: this.lastID, name });
  });
});

// PUT /faculties/:id - Cập nhật thông tin khoa
app.put("/faculties/:id", (req: Request, res: Response) => {
  logger.info("PUT /faculties/:id called");
  const { name } = req.body;
  const id = req.params.id;
  if (!name) return res.status(400).json({ error: "Name is required" });
  db.run(
    "UPDATE faculties SET name = ? WHERE id = ?",
    [name, id],
    function (err) {
      if (err) {
        logger.error(`Error updating faculty id ${id}: ${err.message}`);
        return res.status(400).json({ error: err.message });
      }
      logger.info(`Faculty id ${id} updated successfully to: ${name}`);
      res.json({ message: "Faculty updated successfully", id, name });
    }
  );
});

// GET /student_statuses - Lấy danh sách tình trạng sinh viên
app.get("/student_statuses", (req: Request, res: Response) => {
  logger.info("GET /student_statuses called");
  db.all("SELECT * FROM student_statuses ORDER BY name", (err, rows) => {
    if (err) {
      logger.error(`Error fetching student statuses: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST /student_statuses - Thêm tình trạng sinh viên mới
app.post("/student_statuses", (req: Request, res: Response) => {
  logger.info("POST /student_statuses called");
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  db.run(
    "INSERT INTO student_statuses (name) VALUES (?)",
    [name],
    function (err) {
      if (err) {
        logger.error(`Error adding student status: ${err.message}`);
        return res.status(400).json({ error: err.message });
      }
      logger.info(`Student status added successfully: ${name}`);
      res.json({
        message: "Student status added successfully",
        id: this.lastID,
        name,
      });
    }
  );
});

// PUT /student_statuses/:id - Cập nhật tình trạng sinh viên
app.put("/student_statuses/:id", (req: Request, res: Response) => {
  logger.info("PUT /student_statuses/:id called");
  const { name } = req.body;
  const id = req.params.id;
  if (!name) return res.status(400).json({ error: "Name is required" });
  db.run(
    "UPDATE student_statuses SET name = ? WHERE id = ?",
    [name, id],
    function (err) {
      if (err) {
        logger.error(`Error updating student status id ${id}: ${err.message}`);
        return res.status(400).json({ error: err.message });
      }
      logger.info(`Student status id ${id} updated successfully to: ${name}`);
      res.json({ message: "Student status updated successfully", id, name });
    }
  );
});

// GET /programs - Lấy danh sách chương trình
app.get("/programs", (req: Request, res: Response) => {
  logger.info("GET /programs called");
  db.all("SELECT * FROM programs ORDER BY name", (err, rows) => {
    if (err) {
      logger.error(`Error fetching programs: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST /programs - Thêm chương trình mới
app.post("/programs", (req: Request, res: Response) => {
  logger.info("POST /programs called");
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  db.run("INSERT INTO programs (name) VALUES (?)", [name], function (err) {
    if (err) {
      logger.error(`Error adding program: ${err.message}`);
      return res.status(400).json({ error: err.message });
    }
    logger.info(`Program added successfully: ${name}`);
    res.json({ message: "Program added successfully", id: this.lastID, name });
  });
});

// PUT /programs/:id - Cập nhật thông tin chương trình
app.put("/programs/:id", (req: Request, res: Response) => {
  logger.info("PUT /programs/:id called");
  const { name } = req.body;
  const id = req.params.id;
  if (!name) return res.status(400).json({ error: "Name is required" });
  db.run(
    "UPDATE programs SET name = ? WHERE id = ?",
    [name, id],
    function (err) {
      if (err) {
        logger.error(`Error updating program id ${id}: ${err.message}`);
        return res.status(400).json({ error: err.message });
      }
      logger.info(`Program id ${id} updated successfully to: ${name}`);
      res.json({ message: "Program updated successfully", id, name });
    }
  );
});

// GET /version - Trả về thông tin version và build date
app.get("/version", (req: Request, res: Response) => {
  logger.info("GET /version called");
  const versionFilePath = path.join(__dirname, "..", "version.json");
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
});

// Khởi chạy server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
