import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getDatabaseUrl } from "../config";
import * as schema from "./schema";

const pool = new Pool({ connectionString: getDatabaseUrl() });

export const db = drizzle(pool, { schema });
export type DbClient = NodePgDatabase<typeof schema>;
