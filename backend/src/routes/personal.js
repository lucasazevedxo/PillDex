import { Router } from "express";
import { HttpError } from "../middlewares/errors.js";
import { parseId } from "../middlewares/validation.js";
import { transaction } from "../models/transaction.js";

export function date(value, required = false) {
  if ((value === null || value === undefined || value === "") && !required)
    return null;
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    Number.isNaN(Date.parse(value)) ||
    new Date(value).toISOString().slice(0, 10) !== value ||
    value < "2000-01-01" ||
    value > "2100-12-31"
  )
    throw new HttpError(
      400,
      "Data inválida. Use AAAA-MM-DD entre 2000 e 2100.",
    );
  return value;
}
export function validatePersonal(body, reminder = false) {
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new HttpError(400, "Envie um objeto JSON.");
  if (body.ativo !== undefined && typeof body.ativo !== "boolean")
    throw new HttpError(400, "Ativo deve ser booleano.");
  const data = {
    ativo: body.ativo ?? true,
    data_inicio: date(body.data_inicio, reminder),
    data_fim: date(body.data_fim),
  };
  if (data.data_inicio && data.data_fim && data.data_fim < data.data_inicio)
    throw new HttpError(400, "A data final deve ser posterior à inicial.");
  if (reminder) {
    if (
      typeof body.horario !== "string" ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.horario)
    )
      throw new HttpError(400, "Horário inválido. Use HH:MM.");
    if (
      !Array.isArray(body.dias_semana) ||
      !body.dias_semana.length ||
      body.dias_semana.length > 7 ||
      body.dias_semana.some((n) => !Number.isInteger(n) || n < 0 || n > 6)
    )
      throw new HttpError(
        400,
        "Selecione os dias da semana (0 = domingo até 6 = sábado).",
      );
    data.horario = body.horario;
    data.dias_semana = [...new Set(body.dias_semana)].sort();
    data.usuario_medicamento_id = parseId(String(body.usuario_medicamento_id));
  } else {
    if (
      body.observacoes != null &&
      (typeof body.observacoes !== "string" || body.observacoes.length > 5000)
    )
      throw new HttpError(400, "Observações: até 5000 caracteres.");
    data.observacoes = body.observacoes?.trim() || null;
  }
  return data;
}

export function personalRoutes(db, authenticate) {
  const router = Router();
  router.use(["/meus-medicamentos", "/lembretes"], authenticate);
  const librarySelect =
    "SELECT um.*, m.nome, m.principio_ativo, m.arquivado FROM usuario_medicamentos um JOIN medicamentos m ON m.id = um.medicamento_id WHERE um.usuario_id = ?";
  const reminderSelect =
    "SELECT l.*, m.nome, um.ativo AS medicamento_ativo, um.data_inicio AS medicamento_inicio, um.data_fim AS medicamento_fim FROM lembretes l JOIN usuario_medicamentos um ON um.id = l.usuario_medicamento_id JOIN medicamentos m ON m.id = um.medicamento_id WHERE um.usuario_id = ?";
  const send = (res, data, status = 200) =>
    res.status(status).json({ success: true, data });
  async function owned(connection, user, id) {
    const [rows] = await connection.execute(
      "SELECT id FROM usuario_medicamentos WHERE usuario_id = ? AND id = ? FOR UPDATE",
      [user, id],
    );
    if (!rows.length)
      throw new HttpError(404, "Registro pessoal não encontrado.");
  }
  router.get("/meus-medicamentos", async (req, res) => {
    const [rows] = await db.execute(librarySelect + " ORDER BY m.nome, um.id", [
      req.user.id,
    ]);
    send(res, rows);
  });
  router.post("/meus-medicamentos", async (req, res) => {
    const data = validatePersonal(req.body);
    const medicine = parseId(String(req.body.medicamento_id));
    const id = await transaction(db, async (connection) => {
      const [rows] = await connection.execute(
        "SELECT id FROM medicamentos WHERE id = ? AND arquivado = 0 FOR UPDATE",
        [medicine],
      );
      if (!rows.length)
        throw new HttpError(404, "Medicamento não disponível no catálogo.");
      try {
        const [result] = await connection.execute(
          "INSERT INTO usuario_medicamentos(usuario_id,medicamento_id,observacoes,data_inicio,data_fim,ativo) VALUES (?,?,?,?,?,?)",
          [
            req.user.id,
            medicine,
            data.observacoes,
            data.data_inicio,
            data.data_fim,
            data.ativo,
          ],
        );
        return result.insertId;
      } catch (error) {
        if (error.code === "ER_DUP_ENTRY")
          throw new HttpError(
            409,
            "Este medicamento já está na sua biblioteca.",
          );
        throw error;
      }
    });
    const [rows] = await db.execute(librarySelect + " AND um.id = ?", [
      req.user.id,
      id,
    ]);
    send(res, rows[0], 201);
  });
  router.get("/meus-medicamentos/:id", async (req, res) => {
    const id = parseId(req.params.id);
    const [rows] = await db.execute(librarySelect + " AND um.id = ?", [
      req.user.id,
      id,
    ]);
    if (!rows.length)
      throw new HttpError(404, "Registro pessoal não encontrado.");
    const [details] = await db.execute(
      "SELECT * FROM medicamentos WHERE id = ?",
      [rows[0].medicamento_id],
    );
    send(res, { ...rows[0], medicamento: details[0] });
  });
  router.put("/meus-medicamentos/:id", async (req, res) => {
    const id = parseId(req.params.id),
      data = validatePersonal(req.body);
    await transaction(db, async (connection) => {
      await owned(connection, req.user.id, id);
      await connection.execute(
        "UPDATE usuario_medicamentos SET observacoes = ?, data_inicio = ?, data_fim = ?, ativo = ? WHERE id = ? AND usuario_id = ?",
        [
          data.observacoes,
          data.data_inicio,
          data.data_fim,
          data.ativo,
          id,
          req.user.id,
        ],
      );
    });
    const [rows] = await db.execute(librarySelect + " AND um.id = ?", [
      req.user.id,
      id,
    ]);
    send(res, rows[0]);
  });
  router.delete("/meus-medicamentos/:id", async (req, res) => {
    const id = parseId(req.params.id);
    await transaction(db, async (connection) => {
      await owned(connection, req.user.id, id);
      await connection.execute(
        "DELETE FROM lembretes WHERE usuario_medicamento_id = ?",
        [id],
      );
      await connection.execute(
        "DELETE FROM usuario_medicamentos WHERE id = ? AND usuario_id = ?",
        [id, req.user.id],
      );
    });
    send(res, { message: "Removido da sua biblioteca. Catálogo preservado." });
  });
  router.get("/lembretes", async (req, res) => {
    const [rows] = await db.execute(
      reminderSelect + " ORDER BY l.horario, l.id",
      [req.user.id],
    );
    send(
      res,
      rows.map((row) => ({
        ...row,
        dias_semana:
          typeof row.dias_semana === "string"
            ? JSON.parse(row.dias_semana)
            : row.dias_semana,
      })),
    );
  });
  for (const method of ["post", "put"])
    router[method](
      "/lembretes" + (method === "put" ? "/:id" : ""),
      async (req, res) => {
        const data = validatePersonal(req.body, true);
        const id = method === "put" ? parseId(req.params.id) : null;
        const saved = await transaction(db, async (connection) => {
          await owned(connection, req.user.id, data.usuario_medicamento_id);
          const values = [
            data.usuario_medicamento_id,
            data.horario,
            JSON.stringify(data.dias_semana),
            data.data_inicio,
            data.data_fim,
            data.ativo,
          ];
          if (id) {
            const [existing] = await connection.execute(
              reminderSelect + " AND l.id = ? FOR UPDATE",
              [req.user.id, id],
            );
            if (!existing.length)
              throw new HttpError(404, "Lembrete não encontrado.");
          }
          const [duplicates] = await connection.execute(
            "SELECT id FROM lembretes WHERE usuario_medicamento_id = ? AND horario = ? AND dias_semana = CAST(? AS JSON) AND data_inicio = ? AND (data_fim <=> ?) AND id <> ?",
            [...values.slice(0, 5), id || 0],
          );
          if (duplicates.length)
            throw new HttpError(
              409,
              "Este lembrete já existe. Edite o registro existente.",
            );
          if (id) {
            await connection.execute(
              "UPDATE lembretes SET usuario_medicamento_id = ?, horario = ?, dias_semana = ?, data_inicio = ?, data_fim = ?, ativo = ? WHERE id = ?",
              [...values, id],
            );
            return id;
          }
          const [result] = await connection.execute(
            "INSERT INTO lembretes(usuario_medicamento_id,horario,dias_semana,data_inicio,data_fim,ativo) VALUES (?,?,?,?,?,?)",
            values,
          );
          return result.insertId;
        });
        send(res, { id: saved, ...data }, id ? 200 : 201);
      },
    );
  router.delete("/lembretes/:id", async (req, res) => {
    const [result] = await db.execute(
      "DELETE l FROM lembretes l JOIN usuario_medicamentos um ON um.id = l.usuario_medicamento_id WHERE l.id = ? AND um.usuario_id = ?",
      [parseId(req.params.id), req.user.id],
    );
    if (!result.affectedRows)
      throw new HttpError(404, "Lembrete não encontrado.");
    send(res, { message: "Lembrete excluído." });
  });
  return router;
}
