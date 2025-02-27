import { Router } from "express";
import * as studentController from "../controllers/student.controller";

const router = Router();

router.get("/", studentController.getStudents);
router.post("/", studentController.addStudent);
router.put("/:mssv", studentController.updateStudent);
router.delete("/:mssv", studentController.deleteStudent);

export default router;
