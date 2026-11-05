import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { pool } from "../src/config/db.js";
const server = createApp().listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const base = "http://127.0.0.1:" + server.address().port + "/api";
async function call(path, options) {
  const r = await fetch(base + path, options);
  const b = await r.json();
  assert.ok(r.ok, JSON.stringify(b));
  return b.data;
}
const connection = await pool.getConnection();
await connection.beginTransaction();
try {
  const health = await call("/health");
  assert.equal(health.database, "online");
  const original = await call("/medicamentos");
  assert.ok(Array.isArray(original));
  // Registro não clínico, identificado como teste; fica persistido para auditoria.
  const nome = "Teste de integração PillDex " + Date.now();
  const created = await call("/medicamentos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome,
      principio_ativo: "Marcador técnico",
      descricao: "Registro técnico de teste, sem conteúdo farmacêutico.",
      fonte: "Teste automatizado local",
    }),
  });
  const found = await call("/medicamentos/" + created.id);
  assert.equal(found.nome, nome);
  const search = await call("/medicamentos?busca=" + encodeURIComponent(nome));
  assert.ok(search.some((x) => x.id === created.id));
  const byActive = await call("/medicamentos?busca=Marcador%20técnico");
  assert.ok(byActive.some((x) => x.id === created.id));
  const [rows] = await connection.execute(
    "SELECT nome FROM medicamentos WHERE id = ?",
    [created.id],
  );
  assert.equal(rows[0].nome, nome);
  console.log(
    "PASS: health, GET, POST, ID, busca nome/princípio ativo, persistência SQL; registro técnico id=" +
      created.id,
  );
} finally {
  await connection.rollback();
  connection.release();
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
}
