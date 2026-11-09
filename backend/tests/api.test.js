import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";
import { pool } from "../src/config/db.js";
import { randomBytes } from "node:crypto";
import { issueToken } from "../src/auth.js";
process.env.JWT_SECRET = randomBytes(48).toString("hex");
const adminToken = issueToken({ id: 7, nivel: "admin" }).token;
const fake = {
  query: async () => [[]],
  execute: async (sql, args) => {
    if (sql.includes("FROM usuarios"))
      return [[{ id: 7, nome: "Admin teste", nivel: "admin" }]];
    if (sql.startsWith("INSERT")) return [{ insertId: 7 }];
    if (sql.includes("WHERE id"))
      return [args[0] === 7 ? [{ id: 7, nome: "Teste" }] : []];
    return [[{ id: 7, nome: "Teste" }]];
  },
};
const app = createApp(fake);
test("health separa servidor e banco", async () => {
  const r = await request(app).get("/api/health");
  assert.equal(r.status, 200);
  assert.equal(r.body.data.database, "online");
});
test("health retorna 503 com banco offline", async () => {
  const r = await request(
    createApp({
      query: async () => {
        throw Error();
      },
    }),
  ).get("/api/health");
  assert.equal(r.status, 503);
  assert.equal(r.body.data.server, "online");
  assert.equal(r.body.data.database, "offline");
});
test("listagem e busca parametrizada", async () => {
  let params;
  const db = {
    ...fake,
    execute: async (sql, args) => {
      params = args;
      return [[]];
    },
  };
  const r = await request(createApp(db))
    .get("/api/medicamentos")
    .query({ busca: "x' OR 1=1 --%_" });
  assert.equal(r.status, 200);
  assert.deepEqual(params, ["%x' OR 1=1 --!%!_%", "%x' OR 1=1 --!%!_%"]);
});
test("GET por ID e registro ausente", async () => {
  assert.equal((await request(app).get("/api/medicamentos/7")).status, 200);
  assert.equal((await request(app).get("/api/medicamentos/8")).status, 404);
  assert.equal((await request(app).get("/api/medicamentos/abc")).status, 400);
});
test("POST valida nome, tipos, fonte e URL", async () => {
  for (const body of [
    {},
    { nome: 9 },
    { nome: "A", indicacoes: "Texto sem fonte" },
    { nome: "A", url_bula: "javascript:alert(1)" },
    { nome: "A", fonte: "x".repeat(256) },
  ]) {
    assert.equal(
      (
        await request(app)
          .post("/api/medicamentos")
          .set("Authorization", "Bearer " + adminToken)
          .send(body)
      ).status,
      400,
    );
  }
});
test("POST responde 201 e Location", async () => {
  const r = await request(app)
    .post("/api/medicamentos")
    .set("Authorization", "Bearer " + adminToken)
    .send({ nome: "Teste" });
  assert.equal(r.status, 201);
  assert.equal(r.body.data.id, 7);
  assert.equal(r.headers.location, "/api/medicamentos/7");
});
test("JSON malformado não expõe detalhes internos", async () => {
  const r = await request(app)
    .post("/api/medicamentos")
    .set("Content-Type", "application/json")
    .send("{");
  assert.equal(r.status, 400);
  assert.equal(r.body.success, false);
  assert.ok(!r.body.error.stack);
});
test("CORS restringe origens de navegador", async () => {
  assert.equal(
    (
      await request(app)
        .get("/api/medicamentos")
        .set("Origin", "https://example.org")
    ).status,
    403,
  );
  assert.equal(
    (
      await request(app)
        .get("/api/medicamentos")
        .set("Origin", "http://localhost:8081")
    ).headers["access-control-allow-origin"],
    "http://localhost:8081",
  );
});
test("erro de banco não vaza credenciais", async () => {
  const db = {
    ...fake,
    execute: async () => {
      throw Object.assign(Error("senha secreta"), {
        code: "ER_ACCESS_DENIED_ERROR",
      });
    },
  };
  const r = await request(createApp(db)).get("/api/medicamentos");
  assert.equal(r.status, 503);
  assert.ok(!JSON.stringify(r.body).includes("secreta"));
});
test.after(() => pool.end());

test("CORS permite GET e preflight de GET/POST nas duas portas Expo", async () => {
  for (const origin of [
    "http://localhost:8081",
    "http://localhost:8082",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:8082",
  ]) {
    const result = await request(app)
      .get("/api/medicamentos?busca=Teste")
      .set("Origin", origin);
    assert.equal(result.status, 200);
    assert.equal(result.headers["access-control-allow-origin"], origin);
    for (const method of ["GET", "POST", "PUT", "DELETE"]) {
      const preflight = await request(app)
        .options("/api/medicamentos?busca=")
        .set("Origin", origin)
        .set("Access-Control-Request-Method", method)
        .set("Access-Control-Request-Headers", "content-type,authorization");
      assert.equal(preflight.status, 204);
      assert.equal(preflight.headers["access-control-allow-origin"], origin);
      assert.ok(
        preflight.headers["access-control-allow-methods"]
          .split(",")
          .includes(method),
      );
      assert.match(
        preflight.headers["access-control-allow-headers"],
        /content-type/i,
      );
      assert.match(
        preflight.headers["access-control-allow-headers"],
        /authorization/i,
      );
    }
  }
});
test("preflight não acessa banco e rejeita origem não autorizada", async () => {
  const appOffline = createApp({
    execute: async () => {
      throw Error("Não acessar banco no preflight");
    },
  });
  const result = await request(appOffline)
    .options("/api/medicamentos")
    .set("Origin", "http://localhost:8082")
    .set("Access-Control-Request-Method", "POST")
    .set("Access-Control-Request-Headers", "content-type");
  assert.equal(result.status, 204);
  const denied = await request(app)
    .options("/api/medicamentos")
    .set("Origin", "https://example.org")
    .set("Access-Control-Request-Method", "GET");
  assert.equal(denied.status, 403);
  assert.equal(denied.headers["access-control-allow-origin"], undefined);
});
