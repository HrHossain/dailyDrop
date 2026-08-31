import {z} from 'zod'
export const addressSchema = z.object({
  label: z.string()
    .min(2, 'Label must be at least 2 characters')
    .max(50, 'Label must not exceed 50 characters'),
  
  address: z.string()
    .min(3, 'Address must be at least 3 characters'),
  
  city: z.string()
    .min(2, 'City must be at least 2 characters'),
  
  state: z.string()
    .min(2, 'State must be at least 2 characters'),
  
  zip: z.string()
    .regex(/^[0-9]{3,10}$/, 'Zip must be 5-10 digits'),
  
  isDefault: z.boolean().default(false).optional(),
  
  lat: z.number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  
  lng: z.number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
   
});

// Update Address Schema (all fields optional)
export const updateAddressSchema = z.object({
  label: z.string()
    .min(2, 'Label must be at least 2 characters')
    .max(50, 'Label must not exceed 50 characters')
    .optional(),
  
  address: z.string()
    .min(3, 'Address must be at least 3 characters')
    .optional(),
  
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .optional(),
  
  state: z.string()
    .min(2, 'State must be at least 2 characters')
    .optional(),
  
  zip: z.string()
    .regex(/^[0-9]{5,10}$/, 'Zip must be 5-10 digits')
    .optional(),
  
  isDefault: z.boolean().optional(),
  
  lat: z.number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .optional()
    .nullable(),
  
  lng: z.number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .optional()
    .nullable()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

// Address ID Param Schema
export const addressIdSchema = z.object({
  id: z.string().uuid('Invalid address ID format')
});

export type CreateAddressDTO = z.infer<typeof addressSchema>;
export type UpdateAddressDTO = z.infer<typeof updateAddressSchema>;
export type AddressIdDTO = z.infer<typeof addressIdSchema>;