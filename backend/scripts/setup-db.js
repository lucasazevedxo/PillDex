import fs from "node:fs/promises";
import mysql from "mysql2/promise";
import { dbOptions, pool } from "../src/config/db.js";
const connection = await mysql.createConnection({
  ...dbOptions,
  database: undefined,
  multipleStatements: true,
});
try {
  for (const name of ["schema.sql", "seed.sql"]) {
    await connection.query(
      await fs.readFile(
        new URL("../../database/" + name, import.meta.url),
        "utf8",
      ),
    );
    console.log(name + " executado.");
  }
  await import("./migrate.js");
} finally {
  await connection.end();
  await pool.end();
}
