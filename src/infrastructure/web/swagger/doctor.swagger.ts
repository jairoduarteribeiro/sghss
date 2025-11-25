import {
  listDoctorsRequestSchema,
  listDoctorsResponseSchema,
  registerDoctorRequestSchema,
  registerDoctorResponseSchema,
} from "../schemas/doctor.schema";
import { errorResponseSchema, errorResponseWithIssuesSchema } from "../schemas/errors.schema";
import { registry } from "./open-api-registry";

const DOCTOR_TAG = "Doctor";

registry.registerPath({
  method: "post",
  path: "/doctors",
  tags: [DOCTOR_TAG],
  summary: "Register a new doctor (Admin only)",
  description: "Allows an admin user to register a new doctor in the system.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerDoctorRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Doctor created successfully",
      content: {
        "application/json": {
          schema: registerDoctorResponseSchema,
        },
      },
    },
    400: {
      description: "Bad Request - Invalid domain rules (e.g., invalid CRM format)",
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
      description: "Conflict - CRM or Email already in use",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    422: {
      description: "Unprocessable Entity - Validation errors",
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

registry.registerPath({
  method: "get",
  path: "/doctors",
  tags: [DOCTOR_TAG],
  summary: "List doctors with optional filters",
  description: "Retrieves a list of doctors, optionally filtered by specialty or name.",
  request: {
    query: listDoctorsRequestSchema,
  },
  responses: {
    200: {
      description: "List of doctors retrieved successfully",
      content: {
        "application/json": {
          schema: listDoctorsResponseSchema,
        },
      },
    },
    422: {
      description: "Unprocessable Entity - Validation errors",
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
