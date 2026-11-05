import { pool } from "../src/config/db.js";
const oldDescription =
  "Registro de demonstra??o. Informa??es farmac?uticas pendentes de valida??o.";
try {
  const [result] = await pool.execute(
    "UPDATE medicamentos SET descricao = ?, fonte = ? WHERE nome IN (?,?,?) AND descricao = ?",
    [
      "Registro de demonstração. Informações farmacêuticas pendentes de validação.",
      "Anvisa — Bulário Eletrônico; conteúdo clínico pendente de validação",
      "Paracetamol",
      "Dipirona",
      "Ibuprofeno",
      oldDescription,
    ],
  );
  console.log("Registros de demonstração corrigidos: " + result.affectedRows);
} finally {
  await pool.end();
}
