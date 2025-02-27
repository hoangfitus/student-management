import { Router } from "express";
import * as categoryController from "../controllers/category.controller";

const router = Router();

router.get("/faculties", categoryController.getFaculties);
router.post("/faculties", categoryController.addFaculty);
router.put("/faculties/:id", categoryController.updateFaculty);

router.get("/student_statuses", categoryController.getStudentStatuses);
router.post("/student_statuses", categoryController.addStudentStatus);
router.put("/student_statuses/:id", categoryController.updateStudentStatus);

router.get("/programs", categoryController.getPrograms);
router.post("/programs", categoryController.addProgram);
router.put("/programs/:id", categoryController.updateProgram);

export default router;
