import { z } from 'zod';

export const userRegistrationSchema = z.object({
  name: z
    .string({ message: 'Name is required' })
    .trim()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(50, { message: 'Name must be at most 50 characters long' }),

  email: z
    .string({ message: 'Email is required' })
    .trim()
    .toLowerCase()
    .email({ message: 'Invalid email address' }),

  password: z
    .string({ message: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters long' }),
});

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
