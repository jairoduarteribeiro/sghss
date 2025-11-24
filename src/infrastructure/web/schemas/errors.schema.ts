import { z } from "zod";

export const errorResponseSchema = z.object({
  message: z.string(),
  issues: z.array(z.any()).optional(),
});
