import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createApp } from "../src/app.js";
import { pool } from "../src/config/db.js";
// Servidor isolado e segredo efêmero de teste, sem alterar .env.
process.env.JWT_SECRET = randomBytes(48).toString("hex");
const server = createApp().listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const base = "http://127.0.0.1:" + server.address().port + "/api";
const marker = "TESTE E3 " + randomBytes(8).toString("hex");
const email = marker.replaceAll(" ", "").toLowerCase() + "@example.invalid";
const senha = randomBytes(20).toString("hex");
let userId, medicineId;
async function call(path, method = "GET", body, token, status = 200) {
  const response = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();
  assert.equal(response.status, status, JSON.stringify(result));
  return result.data;
}
try {
  assert.equal((await call("/health")).database, "online");
  const credentials = { nome: marker, email, senha, nivel: "admin" };
  const registered = await call(
    "/auth/cadastro",
    "POST",
    credentials,
    null,
    201,
  );
  userId = registered.usuario.id;
  assert.equal(registered.usuario.nivel, "usuario");
  assert.ok(!JSON.stringify(registered.usuario).includes("senha"));
  await call("/auth/cadastro", "POST", credentials, null, 409);
  for (const invalid of [
    {},
    { nome: 7, email: "a", senha: 1 },
    { nome: "Teste", email: "x@example.invalid", senha: "á".repeat(40) },
  ])
    await call("/auth/cadastro", "POST", invalid, null, 400);
  const [rows] = await pool.execute(
    "SELECT senha_hash FROM usuarios WHERE id = ?",
    [userId],
  );
  assert.ok(await bcrypt.compare(senha, rows[0].senha_hash));
  assert.notEqual(rows[0].senha_hash, senha);
  const { token } = await call("/auth/login", "POST", { email, senha });
  assert.equal(
    jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] }).sub,
    String(userId),
  );
  await call("/auth/login", "POST", { email, senha: "Errada123!" }, null, 401);
  await call(
    "/auth/login",
    "POST",
    { email: "ausente@example.invalid", senha: "Errada123!" },
    null,
    401,
  );
  await call("/auth/me", "GET", null, token);
  await call("/auth/me", "GET", null, "invalido", 401);
  const expired = jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, {
    expiresIn: -1,
    issuer: "pilldex",
    audience: "pilldex-app",
  });
  await call("/auth/me", "GET", null, expired, 401);
  const wrongAlgorithm = jwt.sign(
    { sub: String(userId) },
    process.env.JWT_SECRET,
    { algorithm: "HS384", issuer: "pilldex", audience: "pilldex-app" },
  );
  await call("/auth/me", "GET", null, wrongAlgorithm, 401);
  await call("/medicamentos");
  for (const method of ["POST", "PUT", "DELETE"]) {
    const path = "/medicamentos" + (method === "POST" ? "" : "/2147483647");
    await call(path, method, { nome: marker }, null, 401);
    await call(path, method, { nome: marker }, token, 403);
  }
  // Somente a conta técnica criada nesta execução é elevada.
  await pool.execute(
    "UPDATE usuarios SET nivel = 'admin' WHERE id = ? AND email = ?",
    [userId, email],
  );
  const created = await call(
    "/medicamentos",
    "POST",
    { nome: marker, principio_ativo: marker },
    token,
    201,
  );
  medicineId = created.id;
  assert.equal((await call("/medicamentos/" + medicineId)).nome, marker);
  assert.ok(
    (await call("/medicamentos?busca=" + encodeURIComponent(marker))).some(
      (x) => x.id === medicineId,
    ),
  );
  await call(
    "/medicamentos/" + medicineId,
    "PUT",
    { nome: marker + " EDITADO", principio_ativo: marker },
    token,
  );
  const [edited] = await pool.execute(
    "SELECT nome FROM medicamentos WHERE id = ?",
    [medicineId],
  );
  assert.equal(edited[0].nome, marker + " EDITADO");
  await call("/medicamentos/" + medicineId, "DELETE", null, token);
  await call("/medicamentos/" + medicineId, "GET", null, null, 404);
  const [deleted] = await pool.execute(
    "SELECT id FROM medicamentos WHERE id = ?",
    [medicineId],
  );
  assert.equal(deleted.length, 0);
  await pool.execute(
    "UPDATE usuarios SET nivel = 'usuario' WHERE id = ? AND email = ?",
    [userId, email],
  );
  await call("/medicamentos", "POST", { nome: marker }, token, 403);
  console.log(
    "PASS MySQL real: cadastro, duplicidade, validação, bcrypt, login, JWT inválido/expirado/algoritmo, me, 401/403, elevação pública bloqueada, CRUD, busca e persistência.",
  );
} finally {
  if (medicineId)
    await pool.execute(
      "DELETE FROM medicamentos WHERE id = ? AND principio_ativo = ?",
      [medicineId, marker],
    );
  if (userId)
    await pool.execute("DELETE FROM usuarios WHERE id = ? AND email = ?", [
      userId,
      email,
    ]);
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
}
