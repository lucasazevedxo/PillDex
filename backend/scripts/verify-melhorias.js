import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { createApp } from "../src/app.js";
import { pool } from "../src/config/db.js";
import { issueToken } from "../src/auth.js";
process.env.JWT_SECRET = randomBytes(48).toString("hex");
const marker = "TESTE MELHORIAS " + randomBytes(8).toString("hex");
const server = createApp().listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const base = `http://127.0.0.1:${server.address().port}/api`;
const users = [],
  medicines = [];
let checks = 0;
async function call(path, method = "GET", body, token, status = 200) {
  const response = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();
  assert.equal(
    response.status,
    status,
    `${method} ${path}: ${JSON.stringify(result)}`,
  );
  checks++;
  return result.data;
}
try {
  for (const nivel of ["admin", "usuario", "usuario"]) {
    const [row] = await pool.execute(
      "INSERT INTO usuarios(nome,email,senha_hash,nivel) VALUES (?,?,?,?)",
      [
        marker,
        `${users.length}-${marker.replaceAll(" ", "")}@example.invalid`,
        "not-a-login-hash",
        nivel,
      ],
    );
    users.push({ id: row.insertId, nivel });
  }
  const [admin, one, two] = users.map((u) => issueToken(u).token);
  const cats = await call("/categorias");
  assert.equal(cats.length, 10);
  const body = {
    nome: marker,
    principio_ativo: "Marcador técnico",
    categorias: [cats[0].id, cats[1].id],
    classificacao_evidencia:
      "Associação técnica de teste. Não representa classificação clínica.",
  };
  await call("/medicamentos", "POST", body, null, 401);
  await call("/medicamentos", "POST", body, one, 403);
  let medicine = await call("/medicamentos", "POST", body, admin, 201);
  medicines.push(medicine.id);
  assert.deepEqual(medicine.categorias.sort(), body.categorias.sort());
  for (const query of [
    `busca=${encodeURIComponent(marker)}`,
    `busca=Marcador%20técnico&categorias=${cats[0].id},${cats[1].id}`,
    `busca=${encodeURIComponent(marker)}&categorias=${cats[0].id}`,
  ]) {
    const rows = await call("/medicamentos?" + query);
    assert.equal(rows.filter((r) => r.id === medicine.id).length, 1);
  }
  assert.equal(
    (
      await call(
        `/medicamentos?busca=${encodeURIComponent(marker)}&categorias=${cats[9].id}`,
      )
    ).length,
    0,
  );
  await call("/medicamentos?categorias=1)OR1=1", "GET", null, null, 400);
  await call(
    "/medicamentos/" + medicine.id,
    "PUT",
    { ...body, categorias: [cats[1].id] },
    admin,
  );
  for (const path of ["/meus-medicamentos", "/lembretes"])
    await call(path, "GET", null, null, 401);
  const personal = await call(
    "/meus-medicamentos",
    "POST",
    {
      medicamento_id: medicine.id,
      usuario_id: users[2].id,
      observacoes: "Teste privado",
    },
    one,
    201,
  );
  assert.equal(personal.usuario_id, users[1].id);
  await call(
    "/meus-medicamentos",
    "POST",
    { medicamento_id: medicine.id },
    one,
    409,
  );
  assert.equal((await call("/meus-medicamentos", "GET", null, two)).length, 0);
  for (const method of ["GET", "PUT", "DELETE"])
    await call(
      "/meus-medicamentos/" + personal.id,
      method,
      method === "PUT" ? { observacoes: "Outro" } : null,
      two,
      404,
    );
  const edited = await call(
    "/meus-medicamentos/" + personal.id,
    "PUT",
    {
      observacoes: "Atualizado",
      data_inicio: "2026-11-01",
      data_fim: "2026-12-01",
      ativo: true,
    },
    one,
  );
  assert.equal(edited.observacoes, "Atualizado");
  const reminderBody = {
    usuario_medicamento_id: personal.id,
    horario: "08:00",
    dias_semana: [0, 1, 2, 3, 4, 5, 6],
    data_inicio: "2026-11-01",
    data_fim: "2026-12-01",
    ativo: true,
  };
  await call("/lembretes", "POST", reminderBody, two, 404);
  const reminder = await call("/lembretes", "POST", reminderBody, one, 201);
  await call("/lembretes", "POST", reminderBody, one, 409);
  for (const invalid of [
    { horario: "24:00" },
    { dias_semana: [] },
    { data_inicio: "2026-02-30" },
    { data_fim: "2025-01-01" },
    { ativo: "true" },
  ])
    await call("/lembretes", "POST", { ...reminderBody, ...invalid }, one, 400);
  assert.equal((await call("/lembretes", "GET", null, two)).length, 0);
  await call("/lembretes/" + reminder.id, "PUT", reminderBody, two, 404);
  await call("/lembretes/" + reminder.id, "DELETE", null, two, 404);
  await call(
    "/lembretes/" + reminder.id,
    "PUT",
    { ...reminderBody, horario: "20:00", ativo: false },
    one,
  );
  let alarms = await call("/lembretes", "GET", null, one);
  assert.equal(alarms[0].ativo, 0);
  assert.equal(alarms[0].horario, "20:00");
  assert.equal(alarms[0].data_inicio, "2026-11-01");
  await call("/medicamentos/" + medicine.id, "DELETE", null, null, 401);
  await call("/medicamentos/" + medicine.id, "DELETE", null, one, 403);
  const removed = await call(
    "/medicamentos/" + medicine.id,
    "DELETE",
    null,
    admin,
  );
  assert.equal(removed.action, "arquivado");
  await call("/medicamentos/" + medicine.id, "GET", null, null, 404);
  assert.equal(
    (await call("/medicamentos?busca=" + encodeURIComponent(marker))).length,
    0,
  );
  const preserved = await call(
    "/meus-medicamentos/" + personal.id,
    "GET",
    null,
    one,
  );
  assert.equal(preserved.medicamento.arquivado, 1);
  assert.equal(preserved.observacoes, "Atualizado");
  await call(
    "/meus-medicamentos",
    "POST",
    { medicamento_id: medicine.id },
    two,
    404,
  );
  await call("/lembretes/" + reminder.id, "DELETE", null, one);
  assert.equal((await call("/lembretes", "GET", null, one)).length, 0);
  await call("/lembretes", "POST", reminderBody, one, 201);
  await call("/meus-medicamentos/" + personal.id, "DELETE", null, one);
  assert.equal((await call("/lembretes", "GET", null, one)).length, 0);
  const [catalog] = await pool.execute(
    "SELECT id FROM medicamentos WHERE id = ?",
    [medicine.id],
  );
  assert.equal(catalog.length, 1);
  medicine = await call(
    "/medicamentos",
    "POST",
    { nome: marker + " físico" },
    admin,
    201,
  );
  medicines.push(medicine.id);
  assert.equal(
    (await call("/medicamentos/" + medicine.id, "DELETE", null, admin)).action,
    "excluido",
  );
  await call("/medicamentos/" + medicine.id, "GET", null, null, 404);
  console.log(
    `${checks} verificações HTTP aprovadas com MySQL real: filtros, categorias, exclusão, arquivamento, isolamento, biblioteca, lembretes e validação.`,
  );
} finally {
  for (const medicine of medicines) {
    await pool.execute(
      "DELETE l FROM lembretes l JOIN usuario_medicamentos um ON um.id=l.usuario_medicamento_id WHERE um.medicamento_id = ?",
      [medicine],
    );
    await pool.execute(
      "DELETE FROM usuario_medicamentos WHERE medicamento_id = ?",
      [medicine],
    );
    await pool.execute(
      "DELETE FROM medicamento_categorias WHERE medicamento_id = ?",
      [medicine],
    );
    await pool.execute("DELETE FROM medicamentos WHERE id = ?", [medicine]);
  }
  for (const user of users)
    await pool.execute("DELETE FROM usuarios WHERE id = ?", [user.id]);
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
}
