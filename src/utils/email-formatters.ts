import { type DeliveryAddress, type OrderItem } from '../types/order-details';
import { type EmailOrderItem } from '../types/email';

export const formatMajorAmount = (amount: number): string =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);

export const formatMinorAmount = (amount: number): string => formatMajorAmount(amount / 100);

export const getCustomerName = (firstName?: string, lastName?: string): string => {
  const name = [firstName, lastName].filter(Boolean).join(' ').trim();
  return name || 'there';
};

export const formatDeliveryAddress = (address: DeliveryAddress): string =>
  [address.line1, address.line2, address.city, address.postcode]
    .filter((part): part is string => Boolean(part))
    .join(', ');

export const toEmailOrderItems = (items: OrderItem[]): EmailOrderItem[] =>
  items.map((item) => ({
    name: item.dishName,
    quantity: item.quantity,
    lineTotal: formatMajorAmount(item.lineTotal),
  }));
