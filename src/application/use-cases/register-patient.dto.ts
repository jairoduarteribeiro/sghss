export type RegisterPatientInput = {
  name: string;
  email: string;
  cpf: string;
  password: string;
};

export type RegisterPatientOutput = {
  id: string;
};
