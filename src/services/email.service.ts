import { Resend } from 'resend';
import { render } from '@react-email/components';
import { environment } from '../config/environment';
import { InternalServerError } from '../utils/errors';
import OrderCancelledEmail from '../emails/OrderCancelledEmail';
import OrderPlacedEmail from '../emails/OrderPlacedEmail';
import PaymentCanceledEmail from '../emails/PaymentCanceledEmail';
import PaymentFailedEmail from '../emails/PaymentFailedEmail';
import PaymentRefundedEmail from '../emails/PaymentRefundedEmail';
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

interface PaymentStatusEmailData {
  to: string;
  orderId: string;
  orderNumber?: string;
  customerName: string;
  restaurantName?: string;
  totalAmount: string;
}

interface OrderCancelledEmailData {
  to: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  restaurantName: string;
  totalAmount: string;
  cancellationReason?: string;
}

const getOrderUrl = (orderId: string): string =>
  `${environment.mail.appUrl}/order-confirmation/${encodeURIComponent(orderId)}`;

const getSender = (): string =>
  `${environment.mail.companyName} <${environment.mail.companyEmail}>`;

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
    from: getSender(),
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
    from: getSender(),
    to: data.to,
    subject: data.orderNumber ? `Payment received for ${data.orderNumber}` : 'Payment received',
    html,
  });

  if (error) {
    throw new InternalServerError('Failed to send payment succeeded email');
  }
};

export const sendPaymentFailedEmail = async (data: PaymentStatusEmailData): Promise<void> => {
  const html = await render(
    PaymentFailedEmail({
      orderUrl: getOrderUrl(data.orderId),
      orderNumber: data.orderNumber,
      customerName: data.customerName,
      restaurantName: data.restaurantName,
      totalAmount: data.totalAmount,
      companyName: environment.mail.companyName,
      supportEmail: environment.mail.supportEmail,
      logoUrl: environment.mail.logoUrl,
    })
  );

  const { error } = await resend.emails.send({
    from: getSender(),
    to: data.to,
    subject: data.orderNumber ? `Payment failed for ${data.orderNumber}` : 'Payment failed',
    html,
  });

  if (error) {
    throw new InternalServerError('Failed to send payment failed email');
  }
};

export const sendPaymentCanceledEmail = async (data: PaymentStatusEmailData): Promise<void> => {
  const html = await render(
    PaymentCanceledEmail({
      orderUrl: getOrderUrl(data.orderId),
      orderNumber: data.orderNumber,
      customerName: data.customerName,
      restaurantName: data.restaurantName,
      totalAmount: data.totalAmount,
      companyName: environment.mail.companyName,
      supportEmail: environment.mail.supportEmail,
      logoUrl: environment.mail.logoUrl,
    })
  );

  const { error } = await resend.emails.send({
    from: getSender(),
    to: data.to,
    subject: data.orderNumber ? `Payment cancelled for ${data.orderNumber}` : 'Payment cancelled',
    html,
  });

  if (error) {
    throw new InternalServerError('Failed to send payment cancelled email');
  }
};

export const sendPaymentRefundedEmail = async (data: PaymentStatusEmailData): Promise<void> => {
  const html = await render(
    PaymentRefundedEmail({
      orderUrl: getOrderUrl(data.orderId),
      orderNumber: data.orderNumber,
      customerName: data.customerName,
      restaurantName: data.restaurantName,
      totalAmount: data.totalAmount,
      companyName: environment.mail.companyName,
      supportEmail: environment.mail.supportEmail,
      logoUrl: environment.mail.logoUrl,
    })
  );

  const { error } = await resend.emails.send({
    from: getSender(),
    to: data.to,
    subject: data.orderNumber ? `Refund processed for ${data.orderNumber}` : 'Refund processed',
    html,
  });

  if (error) {
    throw new InternalServerError('Failed to send payment refunded email');
  }
};

export const sendOrderCancelledEmail = async (data: OrderCancelledEmailData): Promise<void> => {
  const html = await render(
    OrderCancelledEmail({
      orderUrl: getOrderUrl(data.orderId),
      orderNumber: data.orderNumber,
      customerName: data.customerName,
      restaurantName: data.restaurantName,
      totalAmount: data.totalAmount,
      cancellationReason: data.cancellationReason,
      companyName: environment.mail.companyName,
      supportEmail: environment.mail.supportEmail,
      logoUrl: environment.mail.logoUrl,
    })
  );

  const { error } = await resend.emails.send({
    from: getSender(),
    to: data.to,
    subject: `Order ${data.orderNumber} cancelled`,
    html,
  });

  if (error) {
    throw new InternalServerError('Failed to send order cancelled email');
  }
};
