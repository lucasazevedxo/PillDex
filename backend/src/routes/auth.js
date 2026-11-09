import { Router } from "express";
import bcrypt from "bcrypt";
import { rateLimit } from "express-rate-limit";
import {
  authConfig,
  authenticate,
  hashPassword,
  issueToken,
  validateCredentials,
} from "../auth.js";
import { HttpError } from "../middlewares/errors.js";
// Hash de comparação para reduzir diferença de tempo entre email ausente e senha errada.
const dummyHash = await bcrypt.hash("comparacao-interna-sem-conta", 12);
export function authRoutes(users) {
  const router = Router();
  router.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 60,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      handler: (req, res) =>
        res
          .status(429)
          .json({
            success: false,
            error: { message: "Muitas tentativas. Aguarde e tente novamente." },
          }),
    }),
  );
  router.post("/cadastro", async (req, res) => {
    authConfig();
    const { nome, email, senha } = validateCredentials(req.body, true);
    const conflict = () =>
      new HttpError(409, "Não foi possível cadastrar com os dados informados.");
    if (await users.findByEmail(email)) throw conflict();
    let user;
    try {
      user = await users.create({
        nome,
        email,
        senha_hash: await hashPassword(senha),
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") throw conflict();
      throw error;
    }
    res.status(201).json({ success: true, data: issueToken(user) });
  });
  router.post("/login", async (req, res) => {
    const { email, senha } = validateCredentials(req.body);
    const user = await users.findByEmail(email);
    const valid = await bcrypt.compare(senha, user?.senha_hash || dummyHash);
    if (!user || !valid) throw new HttpError(401, "Email ou senha inválidos.");
    res.json({ success: true, data: issueToken(user) });
  });
  router.get("/me", authenticate(users), (req, res) =>
    res.json({ success: true, data: req.user }),
  );
  return router;
}
