import express from "express";
import cors from "cors";
import { pool } from "./config/db.js";
import { createMedicineModel } from "./models/medicamentos.js";
import { medicineRoutes } from "./routes/medicamentos.js";
import { HttpError, errorHandler } from "./middlewares/errors.js";
export function createApp(db = pool) {
  const app = express();
  app.disable("x-powered-by");
  const origins = (
    process.env.CORS_ORIGINS || "http://localhost:8081,http://127.0.0.1:8081"
  )
    .split(",")
    .map((s) => s.trim());
  app.use(
    cors({
      origin(origin, cb) {
        cb(
          origin && !origins.includes(origin)
            ? new HttpError(403, "Origem não autorizada.")
            : null,
          true,
        );
      },
    }),
  );
  app.use(express.json({ limit: "128kb" }));
  app.get("/api/health", async (req, res) => {
    try {
      await db.query("SELECT 1");
      res.json({
        success: true,
        data: { server: "online", database: "online" },
      });
    } catch {
      res.status(503).json({
        success: false,
        data: { server: "online", database: "offline" },
      });
    }
  });
  app.use("/api/medicamentos", medicineRoutes(createMedicineModel(db)));
  app.use((req, res, next) => next(new HttpError(404, "Rota não encontrada.")));
  app.use(errorHandler);
  return app;
}
