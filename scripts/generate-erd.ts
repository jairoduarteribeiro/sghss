import { pgGenerate } from "drizzle-dbml-generator";
import * as schema from "../src/infrastructure/persistence/drizzle/schema";

const out = "./diagram.dbml";
const relational = true;

pgGenerate({ schema, out, relational });
