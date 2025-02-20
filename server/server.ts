import express, { Request, Response } from "express";
import sqlite3, { Database } from "sqlite3";
import fs from "fs";
import path from "path";
import cors from "cors";
import XLSX from "xlsx";
import { fileURLToPath } from "url";
import multer from "multer";
import logger from "./logger";

// Định nghĩa interface cho sinh viên
interface Student {
  mssv: string;
  name: string;
  dob: string;
  gender: string;
  department: string;
  course: string;
  program: string;
  address: string;
  email: string;
  phone: string;
  status: string;
}

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
        department TEXT,
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
    additionalWhere = " AND department LIKE ?";
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
    "INSERT INTO students (mssv, name, dob, gender, department, course, program, address, email, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const params = [
    student.mssv,
    student.name,
    student.dob,
    student.gender,
    student.department,
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
    "UPDATE students SET name=?, dob=?, gender=?, department=?, course=?, program=?, address=?, email=?, phone=?, status=? WHERE mssv=?";
  const params = [
    student.name,
    student.dob,
    student.gender,
    student.department,
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

// GET /export - Xuất dữ liệu ra file Excel
app.get("/export", (req: Request, res: Response) => {
  logger.info("GET /export called to export data as Excel");

  db.all("SELECT * FROM students", (err, rows: Student[]) => {
    if (err) {
      logger.error(`Error exporting Excel: ${err.message}`);
      res.status(500).json({ error: err.message });
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });
    res.setHeader("Content-Disposition", "attachment; filename=students.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    logger.info(`Exported ${rows.length} student records to Excel`);
    res.send(excelBuffer);
  });
});

// Cấu hình multer để lưu file tạm vào folder "uploads"
const upload = multer({ dest: "uploads/" });

// POST /import/excel - Import dữ liệu từ file Excel
app.post(
  "/import/excel",
  upload.single("file"),
  (req: Request, res: Response) => {
    logger.info("POST /import/excel called");
    if (!req.file) {
      logger.warn("Excel import attempted without a file upload");
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      // Đọc file Excel dưới dạng buffer
      const fileBuffer = fs.readFileSync(req.file.path);
      // Đọc workbook từ buffer
      const workbook = XLSX.read(fileBuffer, {
        type: "buffer",
        raw: false,
        codepage: 65001,
      });
      // Giả sử dữ liệu nằm ở sheet đầu tiên
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      // Chuyển sheet thành JSON, đảm bảo header trùng với tên các trường (mssv, name, dob, gender, department, course, program, address, email, phone, status)
      const records: Student[] = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
      });

      db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        const stmt = db.prepare(`INSERT OR REPLACE INTO students 
        (mssv, name, dob, gender, department, course, program, address, email, phone, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        for (const record of records) {
          stmt.run(
            record.mssv,
            record.name,
            record.dob,
            record.gender,
            record.department,
            record.course,
            record.program,
            record.address,
            record.email,
            record.phone,
            record.status
          );
        }
        stmt.finalize();
        db.run("COMMIT", (err) => {
          if (err) {
            logger.error(
              `Error committing Excel import transaction: ${err.message}`
            );
            return res.status(500).json({ error: err.message });
          }
          logger.info(`Imported ${records.length} student records from Excel`);
          res.json({
            message: "Excel data imported successfully",
            imported: records.length,
          });
        });
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error(`Excel import error: ${err.message}`);
      res.status(500).json({ error: err.message });
    } finally {
      // Xóa file Excel tạm sau khi xử lý
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) {
          logger.error(
            `Error deleting uploaded Excel file: ${unlinkErr.message}`
          );
        }
      });
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

// Khởi chạy server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
