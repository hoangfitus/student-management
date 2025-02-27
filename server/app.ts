// app.ts
import express from "express";
import cors from "cors";
import studentRoutes from "./routes/student.routes";
import categoryRoutes from "./routes/category.routes";
import dataRoutes from "./routes/data.routes";
import versionRoutes from "./routes/version.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/students", studentRoutes);
app.use("/", categoryRoutes); // categories routes (faculties, statuses, programs)
app.use("/", dataRoutes); // for /import/data and /export endpoints
app.use("/version", versionRoutes);

export default app;
