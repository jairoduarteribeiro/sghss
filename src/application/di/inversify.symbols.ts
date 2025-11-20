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
  IReadAvailabilityRepository: Symbol.for("IReadAvailabilityRepository"),
  IWriteAvailabilityRepository: Symbol.for("IWriteAvailabilityRepository"),
  IReadAppointmentRepository: Symbol.for("IReadAppointmentRepository"),
  IWriteAppointmentRepository: Symbol.for("IWriteAppointmentRepository"),
  IReadConsultationRepository: Symbol.for("IReadConsultationRepository"),
  IWriteConsultationRepository: Symbol.for("IWriteConsultationRepository"),
  // Unit of Work
  IUnitOfWork: Symbol.for("IUnitOfWork"),
  // Use Cases
  RegisterUserUseCase: Symbol.for("RegisterUserUseCase"),
  LoginUseCase: Symbol.for("LoginUseCase"),
  RegisterPatientUseCase: Symbol.for("RegisterPatientUseCase"),
  RegisterDoctorUseCase: Symbol.for("RegisterDoctorUseCase"),
  RegisterAvailabilityUseCase: Symbol.for("RegisterAvailabilityUseCase"),
  RegisterAppointmentUseCase: Symbol.for("RegisterAppointmentUseCase"),
  RegisterConsultationUseCase: Symbol.for("RegisterConsultationUseCase"),
  ListDoctorAppointmentsUseCase: Symbol.for("ListDoctorAppointmentsUseCase"),
  CancelAppointmentUseCase: Symbol.for("CancelAppointmentUseCase"),
  ListAvailableSlotsUseCase: Symbol.for("ListAvailableSlotsUseCase"),
  GetPatientHistoryUseCase: Symbol.for("GetPatientHistoryUseCase"),
  // Controller
  AuthController: Symbol.for("AuthController"),
  DoctorController: Symbol.for("DoctorController"),
  AvailabilityController: Symbol.for("AvailabilityController"),
  AppointmentController: Symbol.for("AppointmentController"),
  ConsultationController: Symbol.for("ConsultationController"),
  PatientController: Symbol.for("PatientController"),
  // Services
  IAuthTokenService: Symbol.for("IAuthTokenService"),
  IConferenceLinkGenerator: Symbol.for("IConferenceLinkGenerator"),
  // Middlewares
  RequestLogger: Symbol.for("RequestLogger"),
  RequireAuth: Symbol.for("RequireAuth"),
  RequireRole: Symbol.for("RequireRole"),
  RequireOwner: Symbol.for("RequireOwner"),
  AttachDoctorUserId: Symbol.for("AttachDoctorUserId"),
  AttachPatientUserId: Symbol.for("AttachPatientUserId"),
  // Logger
  Logger: Symbol.for("Logger"),
};
