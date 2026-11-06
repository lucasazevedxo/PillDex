import { createApp } from "./app.js";
import { pool } from "./config/db.js";
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 3000);
const server = createApp().listen(port, host, () =>
  console.log("PillDex API: http://" + host + ":" + port),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    server.close(async () => {
      await pool.end();
      process.exit(0);
    }),
  );

server.on("error", async (error) => {
  console.error(
    error.code === "EADDRINUSE"
      ? "A porta " +
          port +
          " já está em uso. Verifique a instância da API antes de iniciar outra."
      : "Não foi possível iniciar a API: " + error.code,
  );
  await pool.end();
  process.exit(1);
});
