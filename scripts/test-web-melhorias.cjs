const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const { randomBytes } = require("node:crypto");
(async () => {
  process.env.JWT_SECRET = randomBytes(48).toString("hex");
  process.env.JWT_TTL_SECONDS = "3600";
  const { pool } = await import("../backend/src/config/db.js");
  const { createApp } = await import("../backend/src/app.js");
  const { hashPassword } = await import("../backend/src/auth.js");
  const marker = "WEB MELHORIAS " + randomBytes(6).toString("hex");
  const email = marker.replaceAll(" ", "") + "@example.invalid",
    password = randomBytes(16).toString("hex");
  let server, browser, userId, medicineId;
  try {
    const [u] = await pool.execute(
      "INSERT INTO usuarios(nome,email,senha_hash,nivel) VALUES (?,?,?,'admin')",
      [marker, email, await hashPassword(password)],
    );
    userId = u.insertId;
    const [m] = await pool.execute(
      "INSERT INTO medicamentos(nome,principio_ativo) VALUES (?,?)",
      [marker, "Marcador técnico"],
    );
    medicineId = m.insertId;
    server = createApp().listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    browser = await chromium.launch({ channel: "msedge", headless: true });
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route("**/api/**", (route) => {
      const url = new URL(route.request().url());
      return route.continue({
        url: `http://127.0.0.1:${server.address().port}${url.pathname}${url.search}`,
      });
    });
    const button = (name) =>
      page
        .getByRole("button", { name, exact: true })
        .and(page.locator(":visible"))
        .last();
    const field = (name) =>
      page
        .getByLabel(name, { exact: true })
        .and(page.locator(":visible"))
        .last();
    const text = (value) =>
      page
        .getByText(value, { exact: true })
        .and(page.locator(":visible"))
        .last();
    await page.goto("http://localhost:8081");
    await button("Meus Medicamentos").click();
    await button("Entrar").click();
    await field("Email").fill(email);
    await field("Senha").fill(password);
    await button("Entrar").click();
    await page
      .getByRole("link", { name: "Ir para Início", exact: true })
      .and(page.locator(":visible"))
      .last()
      .click();
    await button("Gerenciar catálogo").click();
    await button("Editar " + marker).click();
    await field("Nome *").waitFor();
    await page
      .getByRole("checkbox", { name: "Dor de cabeça", exact: true })
      .click();
    await field("Evidência da classificação").fill(
      "Associação técnica para teste automatizado. Não é classificação clínica.",
    );
    await button("Salvar alterações").click();
    await text(
      "Medicamento atualizado com sucesso no banco de dados.",
    ).waitFor();
    await button("Ver catálogo atualizado").click();
    await button("Nova pesquisa").click();
    await field("Nome ou princípio ativo").fill(marker);
    await button("Filtros · 0 ativos").click();
    await page
      .getByRole("checkbox", { name: "Dor de cabeça", exact: true })
      .click();
    await text("1 medicamento(s) encontrado(s)").waitFor();
    await button("Pesquisar").click();
    await text("1 medicamento(s) encontrado(s)").waitFor();
    // Return to the root through the stack's header back buttons.
    await page.goto("http://localhost:8081");
    await button("Entrar").click();
    await field("Email").fill(email);
    await field("Senha").fill(password);
    await button("Entrar").click();
    await button("Meus Medicamentos").click();
    await button("Adicionar medicamento").click();
    await field("Pesquisar no catálogo").fill(marker);
    await button("Adicionar " + marker).click();
    await text("Biblioteca atualizada.").waitFor();
    await button("Editar observações de " + marker).click();
    await field("Observações pessoais").fill("Observação privada de teste");
    await button("Salvar observações").click();
    await text("Observação privada de teste").waitFor();
    await button("Lembretes").click();
    await button("Criar lembrete").click();
    await button(marker).click();
    await field("Horário (HH:MM)").fill("08:00");
    await button("Salvar lembrete").click();
    await text("Lembretes atualizados.").waitFor();
    await button("Editar lembrete 08:00").click();
    await field("Horário (HH:MM)").fill("20:00");
    await button("Salvar lembrete").click();
    await button("Editar lembrete 20:00").waitFor();
    await button("Desativar lembrete").click();
    await text("Desativado").waitFor();
    await button("Ativar lembrete").click();
    await button("Excluir lembrete 20:00").click();
    await button("Cancelar").click();
    await button("Editar lembrete 20:00").waitFor();
    await button("Excluir lembrete 20:00").click();
    await button("Confirmar remoção").click();
    await text("Nenhum lembrete cadastrado.").waitFor();
    await button("Criar lembrete").click();
    await button(marker).click();
    await field("Horário (HH:MM)").fill("09:00");
    await button("Salvar lembrete").click();
    await text("Lembretes atualizados.").waitFor();
    await page.goto("http://localhost:8081");
    await button("Entrar").click();
    await field("Email").fill(email);
    await field("Senha").fill(password);
    await button("Entrar").click();
    await button("Gerenciar catálogo").click();
    await button("Excluir " + marker).click();
    const box = await button("Confirmar exclusão").boundingBox();
    assert.ok(
      box.y >= 0 && box.y + box.height <= 844,
      "Confirmação deve estar visível mesmo após rolar a lista",
    );
    await button("Cancelar").click();
    const [before] = await pool.execute(
      "SELECT arquivado FROM medicamentos WHERE id = ?",
      [medicineId],
    );
    assert.equal(before[0].arquivado, 0);
    await button("Excluir " + marker).click();
    await button("Confirmar exclusão").click();
    await text(
      "Medicamento arquivado. Bibliotecas pessoais preservadas.",
    ).waitFor();
    assert.equal(await button("Editar " + marker).count(), 0);
    await page.goto("http://localhost:8081");
    await button("Entrar").click();
    await field("Email").fill(email);
    await field("Senha").fill(password);
    await button("Entrar").click();
    await button("Meus Medicamentos").click();
    await text("Observação privada de teste").waitFor();
    await button("Consultar informações").click();
    await text("Bula oficial completa").waitFor();
    await page.goto("http://localhost:8081");
    await button("Entrar").click();
    await field("Email").fill(email);
    await field("Senha").fill(password);
    await button("Entrar").click();
    await button("Meus Medicamentos").click();
    await button("Remover da minha biblioteca: " + marker).click();
    await button("Confirmar remoção").click();
    await text(
      "Sua biblioteca está vazia. Adicione um medicamento do catálogo.",
    ).waitFor();
    const [remaining] = await pool.execute(
      "SELECT id FROM medicamentos WHERE id = ?",
      [medicineId],
    );
    assert.equal(remaining.length, 1);
    const [alarms] = await pool.execute(
      "SELECT l.id FROM lembretes l JOIN usuario_medicamentos um ON um.id=l.usuario_medicamento_id WHERE um.usuario_id = ?",
      [userId],
    );
    assert.equal(alarms.length, 0);
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS Expo Web 390px + MySQL: categorias no Admin, filtros combinados e contagem, biblioteca, observações, CRUD/ativação de lembretes, confirmação visível/cancelamento, arquivamento, detalhes arquivados, remoção pessoal preserva catálogo e remove lembretes, sem erros JS.",
    );
  } finally {
    if (browser) await browser.close();
    if (userId) {
      await pool.execute(
        "DELETE l FROM lembretes l JOIN usuario_medicamentos um ON um.id=l.usuario_medicamento_id WHERE um.usuario_id = ?",
        [userId],
      );
      await pool.execute(
        "DELETE FROM usuario_medicamentos WHERE usuario_id = ?",
        [userId],
      );
    }
    if (medicineId) {
      await pool.execute(
        "DELETE FROM medicamento_categorias WHERE medicamento_id = ?",
        [medicineId],
      );
      await pool.execute("DELETE FROM medicamentos WHERE id = ?", [medicineId]);
    }
    if (userId)
      await pool.execute("DELETE FROM usuarios WHERE id = ?", [userId]);
    if (server) await new Promise((resolve) => server.close(resolve));
    await pool.end();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
