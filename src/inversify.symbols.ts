export const SYMBOLS = {
  // Repositories
  IReadPatientRepository: Symbol.for("IReadPatientRepository"),
  IWritePatientRepository: Symbol.for("IWritePatientRepository"),
  IReadUserRepository: Symbol.for("IReadUserRepository"),
  IWriteUserRepository: Symbol.for("IWriteUserRepository"),
  // Use Cases
  SignupUseCase: Symbol.for("SignupUseCase"),
  LoginUseCase: Symbol.for("LoginUseCase"),
  // Controller
  AuthController: Symbol.for("AuthController"),
  // Services
  IAuthTokenGenerator: Symbol.for("IAuthTokenGenerator"),
};
