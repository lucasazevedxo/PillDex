import { config } from "dotenv";
config({ path: new URL("../../.env", import.meta.url), quiet: true });
import mysql from "mysql2/promise";
export const dbOptions = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "pilldex_db",
  charset: "utf8mb4",
  dateStrings: ["DATE"],
  connectTimeout: 5000,
};
export const pool = mysql.createPool({
  ...dbOptions,
  waitForConnections: true,
  connectionLimit: 10,
});
