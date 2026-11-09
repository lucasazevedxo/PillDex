import { pool } from "../src/config/db.js";
import { createUserModel } from "../src/models/usuarios.js";
import { validateCredentials, hashPassword } from "../src/auth.js";
try {
  const { nome, email, senha } = validateCredentials(
    {
      nome: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      senha: process.env.ADMIN_PASSWORD,
    },
    true,
  );
  const users = createUserModel(pool);
  if (await users.findByEmail(email))
    throw Error("Email já existente. Nenhuma conta foi alterada.");
  await users.create(
    { nome, email, senha_hash: await hashPassword(senha) },
    "admin",
  );
  console.log("Administrador criado.");
} finally {
  await pool.end();
}
