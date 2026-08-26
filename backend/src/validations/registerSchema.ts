import {z} from 'zod';

const userRegistrationSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters long"  }).trim().max(20, { message: "Name must be at most 20 characters long" }),
    email: z.string().email({ message: "Invalid email address" }).trim().toLowerCase(),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
    role: z.enum(['user', 'admin','moderator'], { message: "Role must be either 'user' , 'admin' or 'moderator' " }).default('user'),
    isEmailVerified: z.boolean().default(false).optional(),
    twoFactorEnabled: z.boolean().default(false).optional(),
    avatar: z.string().url({ message: "Avatar must be a valid URL" }).optional().nullable(),
    twoFactorSecret: z.string().optional(),
    token: z.string().optional(),
    resetPasswordToken: z.string().optional(),
    resetPasswordTokenExpiry: z.date().optional(),
    timestamps: z.string().default(new Date().toISOString()),

});

export default  userRegistrationSchema;