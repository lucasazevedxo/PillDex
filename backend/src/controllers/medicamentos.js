import { HttpError } from "../middlewares/errors.js";
import { parseId, validateMedicine } from "../middlewares/validation.js";
export function medicineController(model) {
  return {
    list: async (req, res) => {
      const search = req.query.busca ?? "";
      if (typeof search !== "string" || search.length > 150)
        throw new HttpError(400, "Busca inválida: máximo de 150 caracteres.");
      res.json({ success: true, data: await model.list(search.trim()) });
    },
    find: async (req, res) => {
      const data = await model.find(parseId(req.params.id));
      if (!data) throw new HttpError(404, "Medicamento não encontrado.");
      res.json({ success: true, data });
    },
    create: async (req, res) => {
      const data = await model.create(validateMedicine(req.body));
      res
        .location("/api/medicamentos/" + data.id)
        .status(201)
        .json({ success: true, data });
    },
  };
}
