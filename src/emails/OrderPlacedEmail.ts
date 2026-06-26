import React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Img,
  Link,
} from '@react-email/components';

interface OrderPlacedEmailProps {
  orderUrl: string;
  orderNumber: string;
  customerName: string;
  totalAmount: string;
  paymentMethod: string;
  companyName: string;
  supportEmail: string;
  logoUrl: string;
}

export const OrderPlacedEmail = ({
  orderUrl,
  orderNumber,
  customerName,
  totalAmount,
  paymentMethod,
  companyName,
  supportEmail,
  logoUrl,
}: OrderPlacedEmailProps) => {
  return React.createElement(
    Html,
    null,
    React.createElement(Head),
    React.createElement(Preview, null, `Your ${companyName} order has been placed`),
    React.createElement(
      Body,
      { style: main },
      React.createElement(
        Container,
        { style: container },
        React.createElement(
          Section,
          { style: header },
          React.createElement(Img, { src: logoUrl, alt: companyName, style: logo }),
          React.createElement(Text, { style: eyebrow }, 'Order update')
        ),
        React.createElement(
          Section,
          { style: content },
          React.createElement(Text, { style: statusPill }, 'Order placed'),
          React.createElement(Text, { style: title }, 'We have received your order'),
          React.createElement(
            Text,
            { style: message },
            `Hi ${customerName}, your order ${orderNumber} has been placed.`
          ),
          React.createElement(
            Section,
            { style: summary },
            React.createElement(
              Text,
              { style: summaryLabel },
              'Order number',
              React.createElement('span', { style: summaryValue }, orderNumber)
            ),
            React.createElement(
              Text,
              { style: summaryLabel },
              'Total',
              React.createElement('span', { style: summaryValue }, totalAmount)
            ),
            React.createElement(
              Text,
              { style: summaryLabel },
              'Payment method',
              React.createElement('span', { style: summaryValue }, paymentMethod)
            )
          ),
          React.createElement(
            Section,
            { style: note },
            React.createElement(
              Text,
              { style: noteText },
              paymentMethod.toLowerCase() === 'cash'
                ? `Please have ${totalAmount} ready when your rider arrives.`
                : 'We will send another update after your payment is confirmed.'
            )
          ),
          React.createElement(
            Section,
            { style: buttonContainer },
            React.createElement(Button, { style: button, href: orderUrl }, 'View Order')
          )
        ),
        React.createElement(
          Section,
          { style: footer },
          React.createElement(
            Text,
            { style: footerText },
            'Need help? Contact us at ',
            React.createElement(Link, { href: `mailto:${supportEmail}`, style: link }, supportEmail)
          ),
          React.createElement(
            Text,
            { style: footerText },
            `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`
          )
        )
      )
    )
  );
};

const main = {
  backgroundColor: '#f6f6f6',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  lineHeight: '1.6',
};

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  overflow: 'hidden',
  border: '1px solid #e8ebeb',
};

const header = {
  backgroundColor: '#ffffff',
  padding: '28px 40px 20px',
  textAlign: 'left' as const,
  borderTop: '6px solid #00ccbc',
};

const logo = {
  maxWidth: '140px',
  height: 'auto',
};

const eyebrow = {
  color: '#828585',
  fontSize: '13px',
  fontWeight: 600,
  letterSpacing: '0',
  marginTop: '16px',
  marginBottom: '0',
};

const content = {
  padding: '28px 40px 40px',
};

const statusPill = {
  display: 'inline-block',
  backgroundColor: '#e6f8f6',
  color: '#007e75',
  borderRadius: '999px',
  padding: '6px 12px',
  fontSize: '13px',
  fontWeight: 700,
  margin: '0 0 18px',
};

const title = {
  fontSize: '28px',
  lineHeight: '34px',
  fontWeight: 700,
  color: '#2e3333',
  margin: '0 0 16px',
  textAlign: 'left' as const,
};

const message = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#585c5c',
  margin: '0 0 24px',
  textAlign: 'left' as const,
};

const summary = {
  padding: '20px',
  backgroundColor: '#f8fafa',
  border: '1px solid #e8ebeb',
  borderRadius: '8px',
};

const summaryLabel = {
  fontSize: '14px',
  color: '#585c5c',
  margin: '0 0 12px',
};

const summaryValue = {
  float: 'right' as const,
  color: '#2e3333',
  fontWeight: 700,
};

const note = {
  marginTop: '20px',
  padding: '16px',
  backgroundColor: '#fff9f0',
  borderLeft: '4px solid #fabb00',
  borderRadius: '6px',
};

const noteText = {
  color: '#585c5c',
  fontSize: '14px',
  lineHeight: '21px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'left' as const,
  margin: '28px 0 0',
};

const button = {
  backgroundColor: '#00ccbc',
  color: '#ffffff',
  textDecoration: 'none',
  padding: '16px 32px',
  borderRadius: '6px',
  fontSize: '16px',
  fontWeight: 700,
};

const link = {
  color: '#00ccbc',
  textDecoration: 'none',
  fontSize: '14px',
};

const footer = {
  padding: '28px 40px',
  backgroundColor: '#f6f6f6',
  textAlign: 'left' as const,
  borderTop: '1px solid #e8ebeb',
};

const footerText = {
  fontSize: '14px',
  color: '#828585',
  marginBottom: '10px',
};

export default OrderPlacedEmail;
