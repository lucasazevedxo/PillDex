import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { HttpError } from "./middlewares/errors.js";

export function authConfig() {
  const secret = process.env.JWT_SECRET;
  const ttl = Number(process.env.JWT_TTL_SECONDS || 3600);
  if (!secret || Buffer.byteLength(secret) < 32 || secret.includes("SUBSTITUA"))
    throw Error("Configure JWT_SECRET com pelo menos 32 bytes aleatórios.");
  if (!Number.isInteger(ttl) || ttl < 60 || ttl > 86400)
    throw Error("JWT_TTL_SECONDS deve estar entre 60 e 86400.");
  return { secret, ttl };
}
export const publicUser = ({
  id,
  nome,
  email,
  nivel,
  criado_em,
  atualizado_em,
}) => ({ id, nome, email, nivel, criado_em, atualizado_em });
export function validateCredentials(body, signup = false) {
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new HttpError(400, "Envie um objeto JSON.");
  const errors = {};
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    errors.email = "Informe um email válido.";
  if (
    typeof body.senha !== "string" ||
    body.senha.length < 8 ||
    Buffer.byteLength(body.senha || "") > 72
  )
    errors.senha =
      "A senha deve ter no mínimo 8 caracteres e no máximo 72 bytes.";
  if (signup && (!nome || nome.length > 150))
    errors.nome = "Informe um nome de até 150 caracteres.";
  if (Object.keys(errors).length)
    throw new HttpError(400, "Revise os campos informados.", errors);
  return { nome, email, senha: body.senha };
}
export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}
export function issueToken(user) {
  const { secret, ttl } = authConfig();
  return {
    token: jwt.sign({ nivel: user.nivel }, secret, {
      subject: String(user.id),
      algorithm: "HS256",
      expiresIn: ttl,
      issuer: "pilldex",
      audience: "pilldex-app",
    }),
    expiresAt: Date.now() + ttl * 1000,
    usuario: publicUser(user),
  };
}
export function authenticate(users) {
  return async (req, res, next) => {
    const match = /^Bearer ([^\s]+)$/i.exec(req.get("Authorization") || "");
    if (!match) throw new HttpError(401, "Autenticação necessária.");
    const { secret } = authConfig();
    let payload;
    try {
      payload = jwt.verify(match[1], secret, {
        algorithms: ["HS256"],
        issuer: "pilldex",
        audience: "pilldex-app",
      });
      if (
        !/^[1-9]\d*$/.test(payload.sub) ||
        !Number.isSafeInteger(Number(payload.sub))
      )
        throw Error();
    } catch {
      throw new HttpError(401, "Sessão inválida ou expirada. Entre novamente.");
    }
    const user = await users.find(Number(payload.sub));
    if (!user)
      throw new HttpError(401, "Sessão inválida ou expirada. Entre novamente.");
    req.user = publicUser(user); // Permissões atuais do banco, inclusive após alteração de nível.
    next();
  };
}
export function autorizarNivel(...levels) {
  return (req, res, next) => {
    if (!req.user) throw new HttpError(401, "Autenticação necessária.");
    if (!levels.includes(req.user.nivel))
      throw new HttpError(403, "Acesso restrito a administradores.");
    next();
  };
}
