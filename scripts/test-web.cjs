const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1366, height: 900 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const requests = [];
  page.on("response", (r) => {
    if (r.url().includes(":3000/api/"))
      requests.push({ url: r.url(), status: r.status() });
  });
  fs.mkdirSync("artifacts", { recursive: true });
  try {
    await page.goto("http://localhost:8081");
    await page.getByText("Paracetamol", { exact: true }).waitFor();
    await page.screenshot({
      path: "artifacts/inicio-desktop.png",
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Pesquisar um medicamento", exact: true })
      .click();
    await page
      .getByRole("textbox", { name: "Nome ou princípio ativo" })
      .fill("zzzz-inexistente-98342");
    await page.getByRole("button", { name: "Pesquisar", exact: true }).click();
    await page
      .getByText("Nenhum medicamento encontrado", { exact: true })
      .waitFor();
    await page
      .getByRole("button", { name: "Nova pesquisa", exact: true })
      .click();
    await page
      .getByRole("textbox", { name: "Nome ou princípio ativo" })
      .fill("Paracetamol");
    await page.getByRole("button", { name: "Pesquisar", exact: true }).click();
    await page
      .getByRole("button", { name: "Consultar informações →", exact: true })
      .click();
    await page.getByText("Bula oficial completa", { exact: true }).waitFor();
    await page.screenshot({
      path: "artifacts/detalhes-desktop.png",
      fullPage: true,
    });
    // Reabrir Início sem depender do texto localizado do botão de voltar.
    await page.goto("http://localhost:8081");
    await page
      .getByRole("button", { name: "Gerenciar catálogo", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Cadastrar medicamento", exact: true })
      .click();
    await page
      .getByText("Informe o nome do medicamento.", { exact: true })
      .waitFor();
    const name = "Teste Web PillDex " + Date.now();
    await page.getByRole("textbox", { name: "Nome *", exact: true }).fill(name);
    await page
      .getByRole("textbox", { name: "Descrição", exact: true })
      .fill("Registro técnico de teste Web, sem informações clínicas.");
    await page
      .getByRole("textbox", { name: "Fonte das informações", exact: true })
      .fill("Teste automatizado local");
    await page
      .getByRole("button", { name: "Cadastrar medicamento", exact: true })
      .click();
    await page
      .getByText("Medicamento cadastrado com sucesso no banco de dados.", {
        exact: true,
      })
      .waitFor();
    await page
      .getByRole("button", { name: "Ver catálogo atualizado", exact: true })
      .click();
    await page.getByText(name, { exact: true }).waitFor();
    // Resposta indisponível simulada na borda de rede; não fornece catálogo falso.
    await page.route("**/api/medicamentos*", (route) => route.abort());
    await page.goto("http://localhost:8081");
    await page
      .getByRole("button", { name: "Tentar novamente", exact: true })
      .waitFor();
    await page.unroute("**/api/medicamentos*");
    await page
      .getByRole("button", { name: "Tentar novamente", exact: true })
      .click();
    await page.getByText("Paracetamol", { exact: true }).waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: "artifacts/inicio-mobile.png",
      fullPage: true,
    });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      "Sem overflow horizontal em 390px",
    );
    assert.deepEqual(errors, []);
    assert.ok(requests.some((r) => r.status === 201));
    assert.ok(requests.some((r) => r.url.includes("/medicamentos/")));
    console.log(
      "PASS: cinco telas, busca real/vazia, detalhes, validação, POST, catálogo atualizado, falha de rede/retry e viewport 390px.",
    );
    fs.writeFileSync(
      "artifacts/web-test.json",
      JSON.stringify({ errors, requests }, null, 2),
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
