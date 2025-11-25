import {
  loginRequestSchema,
  loginResponseSchema,
  signupRequestSchema,
  signupResponseSchema,
} from "../schemas/auth.schema";
import { errorResponseSchema, errorResponseWithIssuesSchema } from "../schemas/errors.schema";
import { registry } from "./open-api-registry";

const AUTH_TAG = "Auth";

registry.registerPath({
  method: "post",
  path: "/auth/signup",
  tags: [AUTH_TAG],
  summary: "Register a new patient user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: signupRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User created successfully",
      content: {
        "application/json": {
          schema: signupResponseSchema,
        },
      },
    },
    400: {
      description: "Bad Request - Invalid input data",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    409: {
      description: "Conflict - Email or CPF already in use",
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

registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: [AUTH_TAG],
  summary: "Authenticate user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Login successful",
      content: {
        "application/json": {
          schema: loginResponseSchema,
        },
      },
    },
    401: {
      description: "Invalid credentials",
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
