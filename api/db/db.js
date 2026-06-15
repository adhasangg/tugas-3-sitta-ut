import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import * as schema from "./schema.js";

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
export const db = drizzle(connection, { mode: 'default', schema });
