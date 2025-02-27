// services/db.service.ts
import sqlite3, { Database } from "sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import logger from "../logger";

// Lấy đường dẫn file hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn đến thư mục db nằm cùng cấp với folder server
const dbFolderPath = path.join(__dirname, "..", "..", "db");
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

export default db;
