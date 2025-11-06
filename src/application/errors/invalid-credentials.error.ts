import { AppError } from "@/domain/errors/app.error";

export class InvalidCredentialsError extends AppError {
  constructor(message: string) {
    super(message);
  }
}
