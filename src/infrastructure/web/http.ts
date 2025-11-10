import express, { type Express } from "express";
import type { Container } from "inversify";
import { SYMBOLS } from "../../inversify.symbols";
import type { AuthController } from "../controllers/auth.controller";
import { errorHandler } from "./middlewares/error-handler";

export const createApp = (container: Container): Express => {
  const app = express();
  app.use(express.json());

  const authController = container.get<AuthController>(SYMBOLS.AuthController);
  app.use("/auth", authController.router());
  app.use(errorHandler);

  return app;
};
