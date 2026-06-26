import { Resend } from 'resend';
import { render } from '@react-email/components';
import { environment } from '../config/environment';
import { InternalServerError } from '../utils/errors';
import OrderPlacedEmail from '../emails/OrderPlacedEmail';
import PaymentSucceededEmail from '../emails/PaymentSucceededEmail';
import { type EmailOrderItem } from '../types/email';

const resend = new Resend(environment.mail.resendApiKey);

interface OrderPlacedEmailData {
  to: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  restaurantName: string;
  totalAmount: string;
  paymentMethod: string;
  deliveryAddress: string;
  items: EmailOrderItem[];
}

interface PaymentSucceededEmailData {
  to: string;
  orderId: string;
  orderNumber?: string;
  customerName: string;
  restaurantName?: string;
  totalAmount: string;
  items?: EmailOrderItem[];
}

const getOrderUrl = (orderId: string): string =>
  `${environment.mail.appUrl}/order-confirmation/${encodeURIComponent(orderId)}`;

export const sendOrderPlacedEmail = async (data: OrderPlacedEmailData): Promise<void> => {
  const html = await render(
    OrderPlacedEmail({
      orderUrl: getOrderUrl(data.orderId),
      orderNumber: data.orderNumber,
      customerName: data.customerName,
      restaurantName: data.restaurantName,
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
      deliveryAddress: data.deliveryAddress,
      items: data.items,
      companyName: environment.mail.companyName,
      supportEmail: environment.mail.supportEmail,
      logoUrl: environment.mail.logoUrl,
    })
  );

  const { error } = await resend.emails.send({
    from: `${environment.mail.companyName} <${environment.mail.companyEmail}>`,
    to: data.to,
    subject: `Order ${data.orderNumber} placed`,
    html,
  });

  if (error) {
    throw new InternalServerError('Failed to send order placed email');
  }
};

export const sendPaymentSucceededEmail = async (data: PaymentSucceededEmailData): Promise<void> => {
  const html = await render(
    PaymentSucceededEmail({
      orderUrl: getOrderUrl(data.orderId),
      orderNumber: data.orderNumber,
      customerName: data.customerName,
      restaurantName: data.restaurantName,
      totalAmount: data.totalAmount,
      items: data.items,
      companyName: environment.mail.companyName,
      supportEmail: environment.mail.supportEmail,
      logoUrl: environment.mail.logoUrl,
    })
  );

  const { error } = await resend.emails.send({
    from: `${environment.mail.companyName} <${environment.mail.companyEmail}>`,
    to: data.to,
    subject: data.orderNumber ? `Payment received for ${data.orderNumber}` : 'Payment received',
    html,
  });

  if (error) {
    throw new InternalServerError('Failed to send payment succeeded email');
  }
};
