import { pool } from "../src/config/db.js";
import { readFile } from "node:fs/promises";
try {
  const [columns] = await pool.execute(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'atualizado_em'",
  );
  if (!columns.length)
    await pool.query(
      "ALTER TABLE usuarios ADD COLUMN atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
    );
  for (const [name, definition] of [
    ["arquivado", "BOOLEAN NOT NULL DEFAULT FALSE"],
    ["classificacao_status", "VARCHAR(30) NOT NULL DEFAULT 'pendente'"],
    ["classificacao_evidencia", "TEXT NULL"],
  ]) {
    const [found] = await pool.execute(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'medicamentos' AND COLUMN_NAME = ?",
      [name],
    );
    if (!found.length)
      await pool.query(
        `ALTER TABLE medicamentos ADD COLUMN ${name} ${definition}`,
      );
  }
  const sql = await readFile(
    new URL("../../database/migration-melhorias.sql", import.meta.url),
    "utf8",
  );
  for (const statement of sql
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean))
    await pool.query(statement);
  console.log(
    "Migrações Entrega 3 e melhorias aplicadas (ou já existentes). Nenhum registro removido.",
  );
} finally {
  await pool.end();
}
