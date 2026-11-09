export function createUserModel(db) {
  return {
    async findByEmail(email) {
      const [rows] = await db.execute(
        "SELECT * FROM usuarios WHERE email = ?",
        [email],
      );
      return rows[0];
    },
    async find(id) {
      const [rows] = await db.execute(
        "SELECT id, nome, email, nivel, criado_em, atualizado_em FROM usuarios WHERE id = ?",
        [id],
      );
      return rows[0];
    },
    async create({ nome, email, senha_hash }, nivel = "usuario") {
      const [result] = await db.execute(
        "INSERT INTO usuarios (nome,email,senha_hash,nivel) VALUES (?,?,?,?)",
        [nome, email, senha_hash, nivel],
      );
      return this.find(result.insertId);
    },
  };
}
