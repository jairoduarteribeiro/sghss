import {
  cancelAppointmentRequestSchema,
  getDoctorAppointmentsResponseSchema,
  getPatientAppointmentsResponseSchema,
  registerAppointmentRequestSchema,
  registerAppointmentResponseSchema,
} from "../schemas/appointment.schema";
import { errorResponseSchema, errorResponseWithIssuesSchema } from "../schemas/errors.schema";
import { registry } from "./open-api-registry";

const APPOINTMENT_TAG = "Appointment";

registry.registerPath({
  method: "post",
  path: "/appointments",
  tags: [APPOINTMENT_TAG],
  summary: "Register a new appointment",
  description: "Allows a patient to book an appointment for a specific slot.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerAppointmentRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Appointment created successfully",
      content: {
        "application/json": {
          schema: registerAppointmentResponseSchema,
        },
      },
    },
    400: {
      description: "Bad Request - Invalid business logic",
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
      description: "Forbidden - Only patients can book appointments for themselves",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    409: {
      description: "Conflict - Slot already booked or unavailable",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    404: {
      description: "Not Found - Slot or Patient profile not found",
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
  path: "/appointments/my-appointments",
  tags: [APPOINTMENT_TAG],
  summary: "List patient's appointments",
  description: "Returns a list of appointments for the currently logged-in patient.",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of appointments retrieved successfully",
      content: {
        "application/json": {
          schema: getPatientAppointmentsResponseSchema,
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
      description: "Forbidden - Only patients can access this resource",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    404: {
      description: "Not Found - Patient profile not found for this user",
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

registry.registerPath({
  method: "get",
  path: "/appointments/doctor-appointments",
  tags: [APPOINTMENT_TAG],
  summary: "List doctor's agenda",
  description: "Returns a list of appointments scheduled for the currently logged-in doctor.",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of appointments retrieved successfully",
      content: {
        "application/json": {
          schema: getDoctorAppointmentsResponseSchema,
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
    404: {
      description: "Not Found - Doctor profile not found for this user",
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

registry.registerPath({
  method: "patch",
  path: "/appointments/{appointmentId}/cancel",
  tags: [APPOINTMENT_TAG],
  summary: "Cancel an appointment",
  description:
    "Cancels an existing appointment and releases the corresponding slot. Only the owner (patient) or an admin can perform this action.",
  security: [{ bearerAuth: [] }],
  request: {
    params: cancelAppointmentRequestSchema,
  },
  responses: {
    204: {
      description: "Appointment cancelled successfully",
    },
    400: {
      description: "Bad Request - Cannot cancel completed appointments or invalid ID",
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
      description: "Forbidden - User is not the owner of the appointment",
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
      description: "Validation Error - Invalid UUID format",
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
