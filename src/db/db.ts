import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import * as schema from "./schema";
import Database from "better-sqlite3";
const sqlite = new Database("./src/db/sqlite.db");
const db = drizzle(sqlite, { schema });
export default db;
