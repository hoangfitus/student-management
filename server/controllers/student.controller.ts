import { Request, Response } from "express";
import db from "../services/db.service";
import logger from "../logger";
import { Student } from "../../src/types";

// GET /students?search=&faculty=&page=0&limit=20
export const getStudents = (req: Request, res: Response) => {
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
};

// POST /students - Thêm sinh viên mới
export const addStudent = (req: Request, res: Response) => {
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
};

// PUT /students/:mssv - Cập nhật thông tin sinh viên
export const updateStudent = (req: Request, res: Response) => {
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
};

// DELETE /students/:mssv - Xóa sinh viên
export const deleteStudent = (req: Request, res: Response) => {
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
};
