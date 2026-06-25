import { Resend } from 'resend';
import { render } from '@react-email/components';
import { environment } from '../config/environment';
import { InternalServerError } from '../utils/errors';
import OrderPlacedEmail from '../emails/OrderPlacedEmail';
import PaymentSucceededEmail from '../emails/PaymentSucceededEmail';

const resend = new Resend(environment.mail.resendApiKey);

interface OrderPlacedEmailData {
  to: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  totalAmount: string;
  paymentMethod: string;
}

interface PaymentSucceededEmailData {
  to: string;
  orderId: string;
  customerName: string;
  totalAmount: string;
}

const getOrderUrl = (orderId: string): string =>
  `${environment.mail.appUrl}/order-confirmation/${encodeURIComponent(orderId)}`;

export const sendOrderPlacedEmail = async (data: OrderPlacedEmailData): Promise<void> => {
  const html = await render(
    OrderPlacedEmail({
      orderUrl: getOrderUrl(data.orderId),
      orderNumber: data.orderNumber,
      customerName: data.customerName,
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
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
      customerName: data.customerName,
      totalAmount: data.totalAmount,
      companyName: environment.mail.companyName,
      supportEmail: environment.mail.supportEmail,
      logoUrl: environment.mail.logoUrl,
    })
  );

  const { error } = await resend.emails.send({
    from: `${environment.mail.companyName} <${environment.mail.companyEmail}>`,
    to: data.to,
    subject: 'Payment received',
    html,
  });

  if (error) {
    throw new InternalServerError('Failed to send payment succeeded email');
  }
};
