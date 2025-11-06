import { AppError } from "@/domain/errors/app.error";

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message);
  }
}
