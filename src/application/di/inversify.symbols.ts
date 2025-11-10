export const SYMBOLS = {
  // Database connection
  DatabaseClient: Symbol.for("DatabaseClient"),
  // Inversify Container
  Container: Symbol.for("Container"),
  // Repositories
  IReadPatientRepository: Symbol.for("IReadPatientRepository"),
  IWritePatientRepository: Symbol.for("IWritePatientRepository"),
  IReadUserRepository: Symbol.for("IReadUserRepository"),
  IWriteUserRepository: Symbol.for("IWriteUserRepository"),
  // Unit of Work
  IUnitOfWork: Symbol.for("IUnitOfWork"),
  // Use Cases
  SignupUseCase: Symbol.for("SignupUseCase"),
  LoginUseCase: Symbol.for("LoginUseCase"),
  RegisterPatientUseCase: Symbol.for("RegisterPatientUseCase"),
  // Controller
  AuthController: Symbol.for("AuthController"),
  // Services
  IAuthTokenGenerator: Symbol.for("IAuthTokenGenerator"),
};
