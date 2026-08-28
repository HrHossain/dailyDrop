import { z } from 'zod';

export const userLoginSchema = z.object({
  email: z
    .string()
    .email({ message: 'Invalid email address' })
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' }),
});

export type UserLoginInput = z.infer<typeof userLoginSchema>;
