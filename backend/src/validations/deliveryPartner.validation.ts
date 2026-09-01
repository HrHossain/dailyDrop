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

// Param schema to validate route ID
export const deliveryPartnerIdParamSchema = z.object({
  id: z.string().uuid('Invalid delivery partner ID format'),
});

// Update body schema (all fields optional)
export const updateDeliveryPartnerSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address format').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  phone: z.string().min(10, 'Valid phone number is required').optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional().or(z.literal('')).optional(),
  vehicleType: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateDeliveryPartnerInput = z.infer<typeof updateDeliveryPartnerSchema>;
// Infer TypeScript type
export type CreateDeliveryPartnerInput = z.infer<typeof createDeliveryPartnerSchema>;
export type DeliveryPartnerIdDTO = z.infer<typeof deliveryPartnerIdParamSchema>;