import { pool } from "../src/config/db.js";
try {
  const [columns] = await pool.execute(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'atualizado_em'",
  );
  if (!columns.length)
    await pool.query(
      "ALTER TABLE usuarios ADD COLUMN atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
    );
  console.log(
    "Migração Entrega 3 aplicada (ou já existente). Nenhum registro removido.",
  );
} finally {
  await pool.end();
}
