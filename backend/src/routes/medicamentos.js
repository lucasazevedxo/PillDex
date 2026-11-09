import { Router } from "express";
import { medicineController } from "../controllers/medicamentos.js";
export function medicineRoutes(model, authenticate, authorize) {
  const router = Router();
  const c = medicineController(model);
  router.get("/", c.list);
  router.get("/:id", c.find);
  router.post("/", authenticate, authorize, c.create);
  router.put("/:id", authenticate, authorize, c.update);
  router.delete("/:id", authenticate, authorize, c.remove);
  return router;
}
