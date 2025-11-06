import { AppError } from "@/domain/errors/app.error";

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message);
  }
}
