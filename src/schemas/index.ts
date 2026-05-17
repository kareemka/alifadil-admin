import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be positive'),
  discountPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  categoryId: z.string().min(1, 'Category is required'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  glbUrl: z.string().optional(),
  surfaceColorIds: z.array(z.string()).min(1, 'يرجى اختيار لون سطح واحد على الأقل'),
  edgeColorIds: z.array(z.string()).min(1, 'يرجى اختيار لون أطراف واحد على الأقل'),
  accessoryIds: z.array(z.string()).optional(),
  sizes: z.array(z.object({
    name: z.string().min(1, 'Size name is required'),
    price: z.coerce.number().min(0, 'Price must be positive'),
    dimensions: z.string().optional(),
  })).optional(),
  isActive: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof ProductSchema>;

export const CategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
});

export type CategoryInput = z.infer<typeof CategorySchema>;
