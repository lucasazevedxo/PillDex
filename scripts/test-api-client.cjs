const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const originalFetch = global.fetch;
const originalBase = process.env.EXPO_PUBLIC_API_URL;
process.env.EXPO_PUBLIC_API_URL = "http://127.0.0.1:3000/api/";
const source = fs.readFileSync(
  require("node:path").join(__dirname, "../frontend/src/services/api.js"),
  "utf8",
);
const client = import(
  "data:text/javascript;base64," + Buffer.from(source).toString("base64")
);
after(() => {
  global.fetch = originalFetch;
  if (originalBase === undefined) delete process.env.EXPO_PUBLIC_API_URL;
  else process.env.EXPO_PUBLIC_API_URL = originalBase;
});
test("GET normaliza URL, codifica busca e não envia Content-Type", async () => {
  const { api } = await client;
  global.fetch = async (url, options) => {
    assert.equal(
      url,
      "http://127.0.0.1:3000/api/medicamentos?busca=" +
        encodeURIComponent("Ácido"),
    );
    assert.equal(options.headers["Content-Type"], undefined);
    return Response.json({ success: true, data: [{ id: 1 }] });
  };
  assert.deepEqual(await api.list("Ácido"), [{ id: 1 }]);
});
test("POST mantém JSON e resultado", async () => {
  const { api } = await client;
  global.fetch = async (url, options) => {
    assert.equal(options.method, "POST");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.equal(JSON.parse(options.body).nome, "Teste");
    return Response.json({ success: true, data: { id: 9 } }, { status: 201 });
  };
  assert.deepEqual(await api.create({ nome: "Teste" }), { id: 9 });
});
test("erro HTTP preserva mensagem, status e campos", async () => {
  const { api } = await client;
  global.fetch = async () =>
    Response.json(
      {
        success: false,
        error: {
          message: "Revise os campos.",
          fields: { nome: "Obrigatório" },
        },
      },
      { status: 400 },
    );
  await assert.rejects(
    api.create({}),
    (error) =>
      error.status === 400 &&
      error.fields.nome === "Obrigatório" &&
      error.message === "Revise os campos.",
  );
});
test("banco indisponível é erro HTTP, não falha de rede", async () => {
  const { api } = await client;
  global.fetch = async () =>
    Response.json(
      { success: false, error: { message: "Banco indisponível." } },
      { status: 503 },
    );
  await assert.rejects(
    api.list(),
    (error) => error.status === 503 && error.message === "Banco indisponível.",
  );
});
test("HTML e JSON nulo não são confundidos com falha de conexão", async () => {
  const { api } = await client;
  global.fetch = async () => new Response("<html>Servidor errado</html>");
  await assert.rejects(api.list(), /resposta inválida/);
  global.fetch = async () => Response.json(null);
  await assert.rejects(api.list(), /não concluiu/);
});
test("falha de rede identifica o endereço e timeout é distinto", async () => {
  const { api } = await client;
  global.fetch = async () => {
    throw TypeError("Failed to fetch");
  };
  await assert.rejects(api.list(), /127\.0\.0\.1:3000/);
  global.fetch = async () => {
    throw Object.assign(Error(), { name: "AbortError" });
  };
  await assert.rejects(api.list(), /demorou demais/);
});
