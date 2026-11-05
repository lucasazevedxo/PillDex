export class HttpError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}
export function errorHandler(err, req, res, next) {
  const unavailable = [
    "ECONNREFUSED",
    "ETIMEDOUT",
    "ER_ACCESS_DENIED_ERROR",
    "ER_BAD_DB_ERROR",
    "ER_NO_SUCH_TABLE",
  ].includes(err.code);
  if (err.type === "entity.parse.failed") err.message = "JSON inválido.";
  const status = err.status || (unavailable ? 503 : 500);
  if (status >= 500) console.error("Falha na API:", err.code || err.name);
  res.status(status).json({
    success: false,
    error: {
      message:
        status >= 500
          ? unavailable
            ? "Banco de dados indisponível. Verifique a configuração do servidor."
            : "Não foi possível concluir a operação."
          : err.message,
      ...(err.fields ? { fields: err.fields } : {}),
    },
  });
}
