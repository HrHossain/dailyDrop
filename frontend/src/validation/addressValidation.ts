import { z } from 'zod';

export const addressSchema = z.object({
  label: z.string().min(1, "Label is required (e.g., Home, Office)"),
  address: z.string().min(3, "Street address must be at least 3 characters"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(3, "Valid ZIP code is required"),
  isDefault: z.boolean(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
});

// টাইপ ইনফারেেন্স (TypeScript টাইপ অটো জেনারেট করার জন্য)
export type AddressFormData = z.infer<typeof addressSchema>;