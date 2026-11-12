import express from "express";
import cors from "cors";
import { pool } from "./config/db.js";
import { createMedicineModel } from "./models/medicamentos.js";
import { medicineRoutes } from "./routes/medicamentos.js";
import { HttpError, errorHandler } from "./middlewares/errors.js";
import { createUserModel } from "./models/usuarios.js";
import { authRoutes } from "./routes/auth.js";
import { authenticate, autorizarNivel } from "./auth.js";
import { personalRoutes } from "./routes/personal.js";
export function createApp(db = pool) {
  const app = express();
  app.disable("x-powered-by");
  const origins = (
    process.env.CORS_ORIGINS ||
    "http://localhost:8081,http://localhost:8082,http://127.0.0.1:8081,http://127.0.0.1:8082"
  )
    .split(",")
    .map((s) => s.trim());
  app.use(
    // CORS global também responde OPTIONS antes de JSON, banco e rotas.
    cors({
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      optionsSuccessStatus: 204,
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
  const users = createUserModel(db);
  app.use("/api/auth", authRoutes(users));
  app.get("/api/categorias", async (req, res) => {
    const [rows] = await db.execute(
      "SELECT * FROM categorias WHERE ativo = 1 ORDER BY nome",
    );
    res.json({ success: true, data: rows });
  });
  app.use("/api", personalRoutes(db, authenticate(users)));
  app.use(
    "/api/medicamentos",
    medicineRoutes(
      createMedicineModel(db),
      authenticate(users),
      autorizarNivel("admin"),
    ),
  );
  app.use((req, res, next) => next(new HttpError(404, "Rota não encontrada.")));
  app.use(errorHandler);
  return app;
}
