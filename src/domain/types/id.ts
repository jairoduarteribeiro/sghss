export type UUID = string & { readonly brand: unique symbol };
export type PatientID = UUID;

export function createPatientID(): PatientID {
  return Bun.randomUUIDv7() as PatientID;
}

export function hydratePatientID(id: string): PatientID {
  return id as PatientID;
}
