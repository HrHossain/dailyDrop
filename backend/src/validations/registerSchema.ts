import { z } from 'zod';

export const userRegistrationSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(50, { message: 'Name must be at most 50 characters long' }),

  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email({ message: 'Invalid email address' }),

  password: z
    .string({ required_error: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters long' }),

  phone: z.string().optional().default(''),

  avatar: z
    .string()
    .url({ message: 'Avatar must be a valid URL' })
    .optional()
    .nullable(),
});

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
