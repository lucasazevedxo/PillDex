const assert = require("node:assert/strict");
const { chromium } = require("playwright");
(async () => {
  const base = "http://localhost:3000/api";
  const health = await (await fetch(base + "/health")).json();
  assert.equal(health.data.database, "online");
  for (const origin of ["http://localhost:8081", "http://localhost:8082"]) {
    for (const method of ["GET", "POST"]) {
      const preflight = await fetch(base + "/medicamentos?busca=", {
        method: "OPTIONS",
        headers: {
          Origin: origin,
          "Access-Control-Request-Method": method,
          "Access-Control-Request-Headers": "content-type",
        },
      });
      assert.equal(preflight.status, 204);
      assert.equal(
        preflight.headers.get("access-control-allow-origin"),
        origin,
      );
    }
    for (const query of ["", "Paracetamol"]) {
      const r = await fetch(base + "/medicamentos?busca=" + query, {
        headers: { Origin: origin },
      });
      assert.equal(r.status, 200);
      assert.equal(r.headers.get("access-control-allow-origin"), origin);
      const body = await r.json();
      assert.ok(Array.isArray(body.data));
      if (query)
        assert.ok(body.data.some((item) => item.nome === "Paracetamol"));
    }
  }
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    for (const port of [8081, 8082]) {
      const page = await browser.newPage();
      page.setDefaultTimeout(60000);
      const apiResponses = [];
      page.on("response", (response) => {
        if (response.url().includes(":3000/api/medicamentos"))
          apiResponses.push({ url: response.url(), status: response.status() });
      });
      const cdp = await page.context().newCDPSession(page);
      await cdp.send("Network.enable");
      const sockets = new Map(),
        handshakes = [],
        closed = new Set(),
        errors = [];
      cdp.on("Network.webSocketCreated", (event) =>
        sockets.set(event.requestId, event.url),
      );
      cdp.on("Network.webSocketHandshakeResponseReceived", (event) =>
        handshakes.push({ id: event.requestId, status: event.response.status }),
      );
      cdp.on("Network.webSocketClosed", (event) => closed.add(event.requestId));
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (msg) => {
        if (/Disconnected from Metro|CORS policy/.test(msg.text()))
          errors.push(msg.text());
      });
      console.log("Verificando navegador/Metro em " + port);
      await page.goto("http://localhost:" + port, {
        waitUntil: "domcontentloaded",
        timeout: 120000,
      });
      await page.getByText("Paracetamol", { exact: true }).waitFor();
      await page
        .getByRole("button", { name: "Pesquisar um medicamento", exact: true })
        .click();
      await page
        .getByRole("textbox", { name: "Nome ou princípio ativo" })
        .fill("Paracetamol");
      await page
        .getByRole("button", { name: "Pesquisar", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Consultar informações →", exact: true })
        .waitFor();
      await page.evaluate(
        () => new Promise((resolve) => setTimeout(resolve, 3000)),
      );
      const metro = handshakes.filter(
        (h) =>
          h.status === 101 &&
          sockets.get(h.id)?.includes(":" + port + "/") &&
          !closed.has(h.id),
      );
      assert.ok(metro.length > 0, "WebSocket Metro aberto em " + port);
      assert.deepEqual(errors, []);
      console.log(
        JSON.stringify({
          port,
          search: "PASS MySQL real",
          apiResponses,
          metro: metro.map((h) => ({
            url: sockets.get(h.id),
            status: h.status,
            connected: true,
          })),
          errors,
        }),
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
  console.log(
    "PASS: MySQL, GET/listagem/pesquisa, OPTIONS GET/POST e navegador com Metro WebSocket ativo nas portas 8081 e 8082. Nenhum registro criado.",
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
