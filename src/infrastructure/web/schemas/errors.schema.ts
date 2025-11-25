import z from "zod";

const zodIssueSchema = z.object({
  code: z.string(),
  message: z.string(),
  path: z.array(z.union([z.string(), z.number()])),
});

export const errorResponseSchema = z.object({
  message: z.string(),
});

export const errorResponseWithIssuesSchema = errorResponseSchema.extend({
  issues: z.array(zodIssueSchema),
});
