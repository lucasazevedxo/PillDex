import { Router } from "express";
import { medicineController } from "../controllers/medicamentos.js";
export function medicineRoutes(model) {
  const router = Router();
  const c = medicineController(model);
  router.get("/", c.list);
  router.get("/:id", c.find);
  router.post("/", c.create);
  return router;
}
