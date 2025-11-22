import "reflect-metadata";
import { SYMBOLS } from "./application/di/inversify.symbols";
import type { AppBootstrap } from "./infrastructure/bootstrap";
import { container } from "./infrastructure/di/inversify.container";

const bootstrap = container.get<AppBootstrap>(SYMBOLS.AppBootstrap);
bootstrap.start();
