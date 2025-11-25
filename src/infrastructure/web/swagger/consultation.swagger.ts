import {
  getPatientHistoryRequestSchema,
  getPatientHistoryResponseSchema,
  registerConsultationRequestSchema,
  registerConsultationResponseSchema,
} from "../schemas/consultation.schema";
import { errorResponseSchema, errorResponseWithIssuesSchema } from "../schemas/errors.schema";
import { registry } from "./open-api-registry";

const CONSULTATION_TAG = "Consultation";

registry.registerPath({
  method: "post",
  path: "/consultations",
  tags: [CONSULTATION_TAG],
  summary: "Register a new consultation",
  description: "Allows a doctor to register the details of a completed appointment (diagnosis, prescription, etc).",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerConsultationRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Consultation registered successfully",
      content: {
        "application/json": {
          schema: registerConsultationResponseSchema,
        },
      },
    },
    400: {
      description: "Bad Request",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    404: {
      description: "Not Found - Appointment not found",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    422: {
      description: "Validation Error",
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
  path: "/patients/{patientId}/history",
  tags: [CONSULTATION_TAG],
  summary: "Get patient consultation history",
  description:
    "Returns the full medical history for a specific patient. Access restricted to the patient themselves or medical staff.",
  security: [{ bearerAuth: [] }],
  request: {
    params: getPatientHistoryRequestSchema,
  },
  responses: {
    200: {
      description: "Patient history retrieved successfully",
      content: {
        "application/json": {
          schema: getPatientHistoryResponseSchema,
        },
      },
    },
    400: {
      description: "Bad Request - Invalid Patient ID",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    403: {
      description: "Forbidden - You are not authorized to view this history",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    404: {
      description: "Not Found - Patient not found",
      content: {
        "application/json": {
          schema: errorResponseSchema,
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
