import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z as zodOriginal } from "zod";

extendZodWithOpenApi(zodOriginal);

export const z = zodOriginal;
