import { fields } from "../middlewares/validation.js";
import { transaction } from "./transaction.js";
import { HttpError } from "../middlewares/errors.js";
export function createMedicineModel(db) {
  return {
    async update(id, data) {
      if (data.categorias !== undefined)
        return transaction(db, async (connection) => {
          const model = createMedicineModel(connection);
          const { categorias, ...rest } = data;
          const result = await model.update(id, rest);
          if (!result) return undefined;
          await model.setCategories(
            id,
            categorias,
            data.classificacao_evidencia,
          );
          return model.find(id);
        });
      const [result] = await db.execute(
        "UPDATE medicamentos SET " +
          fields.map((k) => k + " = ?").join(",") +
          " WHERE id = ? AND arquivado = 0",
        [...fields.map((k) => data[k]), id],
      );
      return result.affectedRows ? this.find(id) : undefined;
    },
    async remove(id) {
      return transaction(db, async (connection) => {
        const [rows] = await connection.execute(
          "SELECT id FROM medicamentos WHERE id = ? AND arquivado = 0 FOR UPDATE",
          [id],
        );
        if (!rows.length) return false;
        const [references] = await connection.execute(
          "SELECT id FROM usuario_medicamentos WHERE medicamento_id = ? LIMIT 1",
          [id],
        );
        if (references.length) {
          await connection.execute(
            "UPDATE medicamentos SET arquivado = 1 WHERE id = ?",
            [id],
          );
          return "arquivado";
        }
        await connection.execute(
          "DELETE FROM medicamento_categorias WHERE medicamento_id = ?",
          [id],
        );
        await connection.execute("DELETE FROM medicamentos WHERE id = ?", [id]);
        return "excluido";
      });
    },
    async list(search = "", categories = []) {
      const escaped = search.replace(/[!%_]/g, (c) => "!" + c);
      const [rows] = await db.execute(
        "SELECT * FROM medicamentos m WHERE arquivado = 0 AND (nome LIKE ? ESCAPE '!' OR principio_ativo LIKE ? ESCAPE '!')" +
          (categories.length
            ? " AND EXISTS (SELECT 1 FROM medicamento_categorias mc JOIN categorias c ON c.id = mc.categoria_id AND c.ativo = 1 WHERE mc.medicamento_id = m.id AND mc.categoria_id IN (" +
              categories.map(() => "?").join(",") +
              "))"
            : "") +
          " ORDER BY nome, id",
        ["%" + escaped + "%", "%" + escaped + "%", ...categories],
      );
      return rows;
    },
    async find(id) {
      const [rows] = await db.execute(
        "SELECT * FROM medicamentos WHERE id = ? AND arquivado = 0",
        [id],
      );
      if (!rows[0]) return undefined;
      const [categories] = await db.execute(
        "SELECT categoria_id FROM medicamento_categorias WHERE medicamento_id = ?",
        [id],
      );
      return { ...rows[0], categorias: categories.map((c) => c.categoria_id) };
    },
    async create(data) {
      if (data.categorias !== undefined)
        return transaction(db, async (connection) => {
          const model = createMedicineModel(connection);
          const { categorias, ...rest } = data;
          const result = await model.create(rest);
          await model.setCategories(
            result.id,
            categorias,
            data.classificacao_evidencia,
          );
          return model.find(result.id);
        });
      const [result] = await db.execute(
        "INSERT INTO medicamentos (" +
          fields.join(",") +
          ") VALUES (" +
          fields.map(() => "?").join(",") +
          ")",
        fields.map((k) => data[k]),
      );
      return this.find(result.insertId);
    },
    async setCategories(id, categories, evidence) {
      if (categories.length) {
        const [valid] = await db.execute(
          "SELECT id FROM categorias WHERE ativo = 1 AND id IN (" +
            categories.map(() => "?").join(",") +
            ")",
          categories,
        );
        if (valid.length !== categories.length)
          throw new HttpError(400, "Categoria inválida ou inativa.");
      }
      await db.execute(
        "DELETE FROM medicamento_categorias WHERE medicamento_id = ?",
        [id],
      );
      for (const category of categories)
        await db.execute(
          "INSERT INTO medicamento_categorias(medicamento_id,categoria_id) VALUES (?,?)",
          [id, category],
        );
      await db.execute(
        "UPDATE medicamentos SET classificacao_status = ?, classificacao_evidencia = ? WHERE id = ?",
        [categories.length ? "revisada" : "pendente", evidence || null, id],
      );
    },
  };
}
