import {
  getAvailableSlotsRequestSchema,
  getAvailableSlotsResponseSchema,
  registerAvailabilityRequestSchema,
  registerAvailabilityResponseSchema,
} from "../schemas/availability.schema";
import { errorResponseSchema, errorResponseWithIssuesSchema } from "../schemas/errors.schema";
import { registry } from "./open-api-registry";

const AVAILABILITY_TAG = "Availability";

registry.registerPath({
  method: "post",
  path: "/availabilities",
  tags: [AVAILABILITY_TAG],
  summary: "Register new availability slots (Doctor only)",
  description:
    "Allows a doctor to define their availability. The system automatically splits the duration into 30-minute slots.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerAvailabilityRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Availability created successfully",
      content: {
        "application/json": {
          schema: registerAvailabilityResponseSchema,
        },
      },
    },
    400: {
      description: "Bad Request - Invalid date range or duration",
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
      description: "Forbidden - Only doctors can access this resource",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    409: {
      description: "Conflict - The new availability overlaps with existing ones",
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
  path: "/availabilities",
  tags: [AVAILABILITY_TAG],
  summary: "List available slots for a specific doctor",
  description: "Returns a list of future slots with status AVAILABLE for the given doctor ID.",
  security: [{ bearerAuth: [] }],
  request: {
    query: getAvailableSlotsRequestSchema,
  },
  responses: {
    200: {
      description: "List of available slots",
      content: {
        "application/json": {
          schema: getAvailableSlotsResponseSchema,
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
    422: {
      description: "Validation Error - Invalid doctorId format",
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
