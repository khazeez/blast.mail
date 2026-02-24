import { z } from "zod";

export const CustomerProfileSchema = z.object({
  id: z.string().min(1),
  email: z.string().email("Invalid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  segment: z.string().optional(),
  consent: z.boolean().default(false),
  unsubscribed: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  customFields: z.record(z.any()).optional(),
});

export const CreateCustomerProfileSchema = CustomerProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateCustomerProfileSchema = CustomerProfileSchema.partial().omit({
  id: true,
  createdAt: true,
});

export type CustomerProfileInput = z.infer<typeof CustomerProfileSchema>;
export type CreateCustomerProfileInput = z.infer<typeof CreateCustomerProfileSchema>;
export type UpdateCustomerProfileInput = z.infer<typeof UpdateCustomerProfileSchema>;
