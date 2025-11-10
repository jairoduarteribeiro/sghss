export const SYMBOLS = {
  // Database connection
  DatabaseClient: Symbol.for("DatabaseClient"),
  // Inversify Container
  Container: Symbol.for("Container"),
  // Repositories
  IReadDoctorRepository: Symbol.for("IReadDoctorRepository"),
  IWriteDoctorRepository: Symbol.for("IWriteDoctorRepository"),
  IReadPatientRepository: Symbol.for("IReadPatientRepository"),
  IWritePatientRepository: Symbol.for("IWritePatientRepository"),
  IReadUserRepository: Symbol.for("IReadUserRepository"),
  IWriteUserRepository: Symbol.for("IWriteUserRepository"),
  // Unit of Work
  IUnitOfWork: Symbol.for("IUnitOfWork"),
  // Use Cases
  RegisterUserUseCase: Symbol.for("RegisterUserUseCase"),
  LoginUseCase: Symbol.for("LoginUseCase"),
  RegisterPatientUseCase: Symbol.for("RegisterPatientUseCase"),
  RegisterDoctorUseCase: Symbol.for("RegisterDoctorUseCase"),
  // Controller
  AuthController: Symbol.for("AuthController"),
  DoctorController: Symbol.for("DoctorController"),
  // Services
  IAuthTokenService: Symbol.for("IAuthTokenService"),
  // Middlewares
  RequireAuth: Symbol.for("RequireAuth"),
  RequireAdmin: Symbol.for("RequireAdmin"),
};
