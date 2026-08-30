import express from "express";
import cors from "cors";
import campRoutes from "./routes/campRoutes";
import emergencyContactRoutes from "./routes/emergencyContactRoutes";
import authRoutes from "./routes/authRoutes";
import campManagerRoutes from "./routes/campManagerRoutes";
import dmaCampRoutes from "./routes/dmaCampRoutes";
import resourceRoutes from "./routes/resourceRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";
import resourceRequestRoutes from "./routes/resourceRequestRoutes";
import duplicateCheckRoutes from "./routes/duplicateCheckRoutes";
import requestAssignmentRoutes from "./routes/requestAssignmentRoutes";
import teamRoutes from "./routes/teamRoutes";
import taskRoutes from "./routes/taskRoutes";

const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.send("Disaster Relief Backend Running");
});
app.use("/api/auth", authRoutes);
app.use("/api/camps", campRoutes);
app.use(
    "/api/emergency-contacts",
    emergencyContactRoutes
);
app.use(
    "/api/camp-manager",
    campManagerRoutes
);
app.use("/api/dma/camps", dmaCampRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use(
    "/api/resource-requests",
    resourceRequestRoutes
);
app.use(
    "/api/duplicate-checks",
    duplicateCheckRoutes
);
app.use(
    "/api/request-assignments",
    requestAssignmentRoutes
);
app.use("/api/teams", teamRoutes);
app.use("/api/tasks", taskRoutes);

export default app;