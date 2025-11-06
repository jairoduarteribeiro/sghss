import express, { type Express } from "express";
import type { Container } from "inversify";
import type { AuthController } from "@/infrastructure/controllers/auth.controller";
import { SYMBOLS } from "@/inversify.symbols";

export const createApp = (container: Container): Express => {
  const app = express();
  app.use(express.json());

  const authController = container.get<AuthController>(SYMBOLS.AuthController);
  app.use("/auth", authController.router());

  return app;
};
