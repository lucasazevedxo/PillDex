import { HttpError } from "./errors.js";
export const fields = [
  "nome",
  "principio_ativo",
  "descricao",
  "indicacoes",
  "efeitos_colaterais",
  "contraindicacoes",
  "precaucoes",
  "fonte",
  "url_bula",
];
export function validateMedicine(body) {
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new HttpError(400, "Envie um objeto JSON.");
  const data = {};
  const errors = {};
  for (const key of fields) {
    const value = body[key];
    if (value != null && typeof value !== "string") {
      errors[key] = "Informe um texto.";
      continue;
    }
    data[key] = value?.trim() || null;
    const max = ["nome", "principio_ativo"].includes(key)
      ? 150
      : key === "fonte"
        ? 255
        : 10000;
    if (data[key]?.length > max)
      errors[key] = "Máximo de " + max + " caracteres.";
  }
  if (!data.nome) errors.nome = "O nome é obrigatório.";
  if (fields.slice(2, 8).some((k) => data[k]) && !data.fonte)
    errors.fonte = "Identifique a fonte das informações.";
  if (data.url_bula) {
    try {
      const url = new URL(data.url_bula);
      if (
        !["http:", "https:"].includes(url.protocol) ||
        url.username ||
        url.password
      )
        throw Error();
    } catch {
      errors.url_bula = "Informe uma URL HTTP ou HTTPS válida.";
    }
  }
  if (Object.keys(errors).length)
    throw new HttpError(400, "Revise os campos informados.", errors);
  if (body.categorias !== undefined) {
    if (
      !Array.isArray(body.categorias) ||
      body.categorias.length > 30 ||
      body.categorias.some((id) => !Number.isSafeInteger(id) || id < 1)
    )
      throw new HttpError(400, "Categorias inválidas.");
    data.categorias = [...new Set(body.categorias)];
    if (
      data.categorias.length &&
      (typeof body.classificacao_evidencia !== "string" ||
        !body.classificacao_evidencia.trim() ||
        body.classificacao_evidencia.length > 2000)
    )
      throw new HttpError(
        400,
        "Informe a evidência verificada para as categorias (até 2000 caracteres).",
      );
    data.classificacao_evidencia = data.categorias.length
      ? body.classificacao_evidencia.trim()
      : null;
  }
  return data;
}
export function parseId(value) {
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value)))
    throw new HttpError(400, "Identificador inválido.");
  return Number(value);
}
