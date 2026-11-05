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
