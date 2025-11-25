import { errorResponseSchema, errorResponseWithIssuesSchema } from "../schemas/errors.schema";
import { registerPatientRequestSchema, registerPatientResponseSchema } from "../schemas/patient.schema";
import { registry } from "./open-api-registry";

const PATIENT_TAG = "Patient";

registry.registerPath({
  method: "post",
  path: "/patients",
  tags: [PATIENT_TAG],
  summary: "Register a new patient (Admin only)",
  description: "Allows an admin user to register a new patient in the system.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerPatientRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Patient created successfully",
      content: {
        "application/json": {
          schema: registerPatientResponseSchema,
        },
      },
    },
    400: {
      description: "Bad Request - Invalid domain rules (e.g., invalid CPF format)",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized - Missing or invalid authentication token",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    403: {
      description: "Forbidden - Insufficient permissions",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    409: {
      description: "Conflict - CPF or Email already in use",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    422: {
      description: "Validation Error - Invalid input data",
      content: {
        "application/json": {
          schema: errorResponseWithIssuesSchema,
        },
      },
    },
    500: {
      description: "Internal Server Error",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
  },
});
