import { HttpError } from "../middlewares/errors.js";
import { parseId, validateMedicine } from "../middlewares/validation.js";
export function medicineController(model) {
  return {
    update: async (req, res) => {
      const id = parseId(req.params.id);
      const data = await model.update(id, validateMedicine(req.body));
      if (!data) throw new HttpError(404, "Medicamento não encontrado.");
      res.json({ success: true, data });
    },
    remove: async (req, res) => {
      const action = await model.remove(parseId(req.params.id));
      if (!action) throw new HttpError(404, "Medicamento não encontrado.");
      res.json({
        success: true,
        data: {
          action,
          message:
            action === "arquivado"
              ? "Medicamento arquivado. Bibliotecas pessoais preservadas."
              : "Medicamento excluído com sucesso.",
        },
      });
    },
    list: async (req, res) => {
      const search = req.query.busca ?? "";
      if (typeof search !== "string" || search.length > 150)
        throw new HttpError(400, "Busca inválida: máximo de 150 caracteres.");
      const raw = req.query.categorias ?? "";
      if (
        typeof raw !== "string" ||
        raw.length > 300 ||
        (raw && !/^[1-9]\d*(,[1-9]\d*)*$/.test(raw))
      )
        throw new HttpError(400, "Categorias inválidas.");
      const categories = [...new Set(raw ? raw.split(",").map(parseId) : [])];
      if (categories.length > 30)
        throw new HttpError(400, "Selecione até 30 categorias.");
      res.json({
        success: true,
        data: await model.list(search.trim(), categories),
      });
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
