import { z } from 'zod';

// Zod schema matching the DeliveryPartner Prisma model
export const createDeliveryPartnerSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  phone: z.string().min(10, 'Valid phone number is required'),
  avatar: z.string().url('Avatar must be a valid URL').optional().or(z.literal('')),
  vehicleType: z.string().optional().default('bike'),
  isActive: z.boolean().optional().default(true),
});

// Infer TypeScript type
export type CreateDeliveryPartnerInput = z.infer<typeof createDeliveryPartnerSchema>;