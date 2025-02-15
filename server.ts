// server.ts

import express, { Request, Response } from "express";
import sqlite3, { Database } from "sqlite3";
import fs from "fs";
import path from "path";
import cors from "cors";
import XLSX from "xlsx";
import { fileURLToPath } from "url";

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
// Lấy thư mục chứa file hiện tại
const __dirname = path.dirname(__filename);

// Đường dẫn đến thư mục db nằm cùng cấp với src
const dbFolderPath = path.join(__dirname, "db");
// Nếu thư mục không tồn tại thì tạo mới
if (!fs.existsSync(dbFolderPath)) {
  fs.mkdirSync(dbFolderPath, { recursive: true });
}

// Đường dẫn file db trong thư mục db
const dbPath = path.join(dbFolderPath, "db.sqlite");

// Kiểm tra xem file db có tồn tại không
const dbExists: boolean = fs.existsSync(dbPath);

// Kết nối đến cơ sở dữ liệu SQLite
const db: Database = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to SQLite database at", dbPath);
  }
});

// Nếu file db không tồn tại, tạo bảng
if (!dbExists) {
  db.serialize(() => {
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
        if (err) console.error("Error creating table:", err.message);
        else console.log('Table "students" created successfully.');
      }
    );
  });
}

// --- API endpoints ---

// GET /students?search=&page=0&limit=20
app.get("/students", (req: Request, res: Response) => {
  const search: string = (req.query.search as string) || "";
  const page: number = parseInt(req.query.page as string) || 0;
  const limit: number = parseInt(req.query.limit as string) || 20;
  const offset: number = page * limit;
  const searchParam = `%${search}%`;

  // Đếm tổng số sinh viên thỏa điều kiện tìm kiếm
  db.get(
    "SELECT COUNT(*) as count FROM students WHERE mssv LIKE ? OR name LIKE ?",
    [searchParam, searchParam],
    (err, row: { count: number }) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      const total: number = row ? (row.count as number) : 0;
      // Lấy danh sách sinh viên theo LIMIT và OFFSET
      db.all(
        "SELECT * FROM students WHERE mssv LIKE ? OR name LIKE ? ORDER BY mssv LIMIT ? OFFSET ?",
        [searchParam, searchParam, limit, offset],
        (err, rows: Student[]) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({ total, students: rows });
        }
      );
    }
  );
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
  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
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
  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: "Student updated successfully", student });
  });
});

// DELETE /students/:mssv - Xóa sinh viên
app.delete("/students/:mssv", (req: Request, res: Response) => {
  const mssv = req.params.mssv;
  db.run("DELETE FROM students WHERE mssv = ?", mssv, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: "Student deleted successfully" });
  });
});

// GET /export - Xuất dữ liệu ra file Excel
app.get("/export", (req: Request, res: Response) => {
  db.all("SELECT * FROM students", (err, rows: Student[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Chuyển dữ liệu JSON thành worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    // Xuất workbook thành buffer (dạng file xlsx)
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });
    res.setHeader("Content-Disposition", "attachment; filename=students.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(excelBuffer);
  });
});

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
