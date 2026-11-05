import { fields } from "../middlewares/validation.js";
export function createMedicineModel(db) {
  return {
    async list(search = "") {
      const escaped = search.replace(/[!%_]/g, (c) => "!" + c);
      const [rows] = await db.execute(
        "SELECT * FROM medicamentos WHERE nome LIKE ? ESCAPE '!' OR principio_ativo LIKE ? ESCAPE '!' ORDER BY nome, id",
        ["%" + escaped + "%", "%" + escaped + "%"],
      );
      return rows;
    },
    async find(id) {
      const [rows] = await db.execute(
        "SELECT * FROM medicamentos WHERE id = ?",
        [id],
      );
      return rows[0];
    },
    async create(data) {
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
  };
}
