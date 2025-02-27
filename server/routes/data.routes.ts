import { Router } from "express";
import * as dataController from "../controllers/data.controller";
import upload from "../services/upload.service";

const router = Router();

router.get("/export", dataController.exportData);
router.post("/import", upload.single("file"), dataController.importData);

export default router;
