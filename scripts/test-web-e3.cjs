const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const { randomBytes } = require("node:crypto");
const fs = require("node:fs");
(async () => {
  process.env.JWT_SECRET = randomBytes(48).toString("hex");
  process.env.JWT_TTL_SECONDS = "60";
  const { createApp } = await import("../backend/src/app.js");
  const { pool } = await import("../backend/src/config/db.js");
  const { createUserModel } = await import("../backend/src/models/usuarios.js");
  const { hashPassword } = await import("../backend/src/auth.js");
  const marker = "TESTE WEB E3 " + randomBytes(6).toString("hex");
  const email = marker.replaceAll(" ", "").toLowerCase() + "@example.invalid";
  const adminEmail = "admin" + email;
  const senha = randomBytes(16).toString("hex");
  let server, browser, admin;
  try {
    admin = await createUserModel(pool).create(
      {
        nome: marker,
        email: adminEmail,
        senha_hash: await hashPassword(senha),
      },
      "admin",
    );
    server = createApp().listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    const port = server.address().port;
    browser = await chromium.launch({ channel: "msedge", headless: true });
    const page = await browser.newPage({
      viewport: { width: 1366, height: 900 },
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    // Redireciona a URL da API para um servidor real isolado, com MySQL real.
    await page.route("**/api/**", (route) => {
      const url = new URL(route.request().url());
      return route.continue({
        url: "http://127.0.0.1:" + port + url.pathname + url.search,
      });
    });
    const button = (name) => page.getByRole("button", { name, exact: true });
    const field = (name) =>
      page
        .getByLabel(name, { exact: true })
        .and(page.locator(":visible"))
        .last();
    await page.goto("http://localhost:8081");
    await button("Entrar").waitFor();
    assert.equal(await button("Gerenciar catálogo").count(), 0);
    await button("Pesquisar um medicamento").click();
    await field("Nome ou princípio ativo").fill(
      "zz-inexistente-e3-" + Date.now(),
    );
    await button("Pesquisar").click();
    await page
      .getByText("Nenhum medicamento encontrado", { exact: true })
      .waitFor();
    await button("Nova pesquisa").click();
    await field("Nome ou princípio ativo").fill("Paracetamol");
    await button("Pesquisar").click();
    await button("Consultar informações →").first().click();
    await page.getByText("Bula oficial completa", { exact: true }).waitFor();
    await page.goto("http://localhost:8081");
    await button("Criar conta").click();
    await field("Nome").fill(marker);
    await field("Email").fill(email);
    await field("Senha").fill(senha);
    await field("Confirmar senha").fill("outra");
    await button("Cadastrar").click();
    await page
      .getByText("As senhas devem ser iguais.", { exact: true })
      .waitFor();
    await field("Confirmar senha").fill(senha);
    await button("Cadastrar").click();
    await button("Meu perfil").waitFor();
    await button("Meu perfil").click();
    await page.getByText("Nível: usuario", { exact: true }).waitFor();
    assert.equal(await button("Gerenciar catálogo").count(), 0);
    await button("Sair").click();
    await button("Entrar").click();
    await field("Email").fill(adminEmail);
    await field("Senha").fill("Errada123!");
    await button("Entrar").click();
    await page
      .getByText("Email ou senha inválidos.", { exact: true })
      .waitFor();
    await field("Senha").fill(senha);
    await button("Entrar").click();
    await button("Gerenciar catálogo").click();
    await button("Cadastrar medicamento").click();
    await button("Cadastrar medicamento").click();
    await page
      .getByText("Informe o nome do medicamento.", { exact: true })
      .waitFor();
    await field("Nome *").fill(marker);
    await button("Cadastrar medicamento").click();
    await page
      .getByText("Medicamento cadastrado com sucesso no banco de dados.", {
        exact: true,
      })
      .waitFor();
    await button("Voltar ao painel").click();
    await button("Editar " + marker).click();
    await field("Nome *").waitFor();
    assert.equal(await field("Nome *").inputValue(), marker);
    await field("Nome *").fill(marker + " EDITADO");
    await button("Salvar alterações").click();
    await page
      .getByText("Medicamento atualizado com sucesso no banco de dados.", {
        exact: true,
      })
      .waitFor();
    await button("Voltar ao painel").click();
    await button("Excluir " + marker + " EDITADO").click();
    await button("Cancelar").click();
    await button("Excluir " + marker + " EDITADO").click();
    await button("Confirmar exclusão").click();
    await page
      .getByText("Medicamento excluído com sucesso.", { exact: true })
      .waitFor();
    assert.equal(await button("Editar " + marker + " EDITADO").count(), 0);
    // Web não restaura token após recarga.
    await page.reload();
    await button("Entrar").waitFor();
    assert.equal(
      await page.evaluate(() =>
        Object.keys(localStorage).some((k) => /token|session|pilldex/i.test(k)),
      ),
      false,
    );
    await page.setViewportSize({ width: 390, height: 844 });
    fs.mkdirSync("artifacts", { recursive: true });
    await page.screenshot({
      path: "artifacts/entrega-3-mobile.png",
      fullPage: true,
    });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.route("**/api/medicamentos*", (route) => route.abort());
    await page.reload();
    await button("Tentar novamente").waitFor();
    await page.unroute("**/api/medicamentos*");
    await button("Tentar novamente").click();
    await page.getByText("Paracetamol", { exact: true }).waitFor();
    await page.clock.install();
    await button("Entrar").click();
    await field("Email").fill(email);
    await field("Senha").fill(senha);
    await button("Entrar").click();
    await button("Meu perfil").waitFor();
    await page.clock.fastForward(61000);
    await button("Entrar").waitFor();
    assert.deepEqual(errors, []);
    console.log(
      "PASS Web real: pesquisa, detalhes, cadastro, confirmação, login incorreto/correto, logout, perfil, admin, criação, edição preenchida, cancelamento/exclusão, atualização, recarga sem token, erro/retry, expiração e viewport 390px.",
    );
  } finally {
    if (browser) await browser.close();
    await pool.execute("DELETE FROM medicamentos WHERE nome IN (?,?)", [
      marker,
      marker + " EDITADO",
    ]);
    await pool.execute("DELETE FROM usuarios WHERE email IN (?,?)", [
      email,
      adminEmail,
    ]);
    if (server) await new Promise((resolve) => server.close(resolve));
    await pool.end();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
