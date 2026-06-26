import { z } from 'zod';

export const deliveryAddressSchema = z.object({
  line1: z.string().trim().min(1),
  line2: z.string().trim().nullable().optional(),
  city: z.string().trim().min(1),
  postcode: z.string().trim().min(1),
  country: z.string().trim().min(1),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  instructions: z.string().trim().nullable().optional(),
  label: z.string().trim().nullable().optional(),
});

export const orderItemModifierSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  option: z.string().trim().min(1),
  extraPrice: z.number(),
});

export const orderItemSchema = z.object({
  id: z.string().trim().min(1),
  dishId: z.string().trim().min(1),
  dishName: z.string().trim().min(1),
  dishImageUrl: z.string().trim().nullable().optional(),
  dishCategory: z.string().trim().nullable().optional(),
  unitPrice: z.number(),
  quantity: z.number().int().positive(),
  lineTotal: z.number(),
  modifiers: z.array(orderItemModifierSchema),
});

export const orderDetailsSchema = z.object({
  id: z.string().trim().min(1),
  orderNumber: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  restaurantId: z.string().trim().min(1),
  status: z.string().trim().min(1),
  paymentStatus: z.string().trim().min(1),
  paymentId: z.string().trim().nullable().optional(),
  paymentMethod: z.string().trim().nullable(),
  paymentExpiresAt: z.string().trim().nullable().optional(),
  subtotal: z.number(),
  deliveryFee: z.number(),
  serviceFee: z.number(),
  discountAmount: z.number(),
  totalAmount: z.number(),
  deliveryAddress: deliveryAddressSchema,
  restaurantName: z.string().trim().min(1),
  restaurantAddress: z.string().trim(),
  estimatedDeliveryAt: z.string().trim().nullable(),
  actualDeliveryAt: z.string().trim().nullable().optional(),
  promoCode: z.string().trim().nullable().optional(),
  cancelledAt: z.string().trim().nullable().optional(),
  cancellationActor: z.string().trim().nullable().optional(),
  cancellationReason: z.string().trim().nullable().optional(),
  items: z.array(orderItemSchema),
  createdAt: z.string().trim().min(1),
  updatedAt: z.string().trim().min(1),
});

export type DeliveryAddress = z.infer<typeof deliveryAddressSchema>;
export type OrderDetails = z.infer<typeof orderDetailsSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
