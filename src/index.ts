import "reflect-metadata";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { SYMBOLS } from "./application/di/inversify.symbols";
import type { AppBootstrap } from "./infrastructure/bootstrap";
import { container } from "./infrastructure/di/inversify.container";

extendZodWithOpenApi(z);

const bootstrap = container.get<AppBootstrap>(SYMBOLS.AppBootstrap);
bootstrap.start();
