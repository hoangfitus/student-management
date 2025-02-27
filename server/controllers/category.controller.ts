import { Request, Response } from "express";
import db from "../services/db.service";
import logger from "../logger";

// GET /faculties - Lấy danh sách khoa
export const getFaculties = (req: Request, res: Response) => {
  logger.info("GET /faculties called");
  db.all("SELECT * FROM faculties ORDER BY name", (err, rows) => {
    if (err) {
      logger.error(`Error fetching faculties: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// POST /faculties - Thêm mới
export const addFaculty = (req: Request, res: Response) => {
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
};

// PUT /faculties/:id - Cập nhật thông tin khoa
export const updateFaculty = (req: Request, res: Response) => {
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
};

// GET /student_statuses - Lấy danh sách tình trạng sinh viên
export const getStudentStatuses = (req: Request, res: Response) => {
  logger.info("GET /student_statuses called");
  db.all("SELECT * FROM student_statuses ORDER BY name", (err, rows) => {
    if (err) {
      logger.error(`Error fetching student statuses: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// POST /student_statuses - Thêm tình trạng sinh viên mới
export const addStudentStatus = (req: Request, res: Response) => {
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
};

// PUT /student_statuses/:id - Cập nhật tình trạng sinh viên
export const updateStudentStatus = (req: Request, res: Response) => {
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
};

// GET /programs - Lấy danh sách chương trình
export const getPrograms = (req: Request, res: Response) => {
  logger.info("GET /programs called");
  db.all("SELECT * FROM programs ORDER BY name", (err, rows) => {
    if (err) {
      logger.error(`Error fetching programs: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// POST /programs - Thêm chương trình mới
export const addProgram = (req: Request, res: Response) => {
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
};

// PUT /programs/:id - Cập nhật thông tin chương trình
export const updateProgram = (req: Request, res: Response) => {
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
};
