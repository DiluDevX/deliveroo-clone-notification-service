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

interface PaymentRefundedEmailProps {
  orderUrl: string;
  orderNumber?: string;
  customerName: string;
  restaurantName?: string;
  totalAmount: string;
  companyName: string;
  supportEmail: string;
  logoUrl: string;
}

export const PaymentRefundedEmail = ({
  orderUrl,
  orderNumber,
  customerName,
  restaurantName,
  totalAmount,
  companyName,
  supportEmail,
  logoUrl,
}: PaymentRefundedEmailProps) => {
  return React.createElement(
    Html,
    null,
    React.createElement(Head),
    React.createElement(Preview, null, `Refund processed for your ${companyName} order`),
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
          React.createElement(Text, { style: eyebrow }, 'Refund update')
        ),
        React.createElement(
          Section,
          { style: content },
          React.createElement(Text, { style: successPill }, 'Refund processed'),
          React.createElement(Text, { style: title }, 'Your refund has been processed'),
          React.createElement(
            Text,
            { style: message },
            `Hi ${customerName}, your refund for ${totalAmount} has been processed.${
              restaurantName ? ` This relates to your order from ${restaurantName}.` : ''
            }`
          ),
          React.createElement(
            Section,
            { style: summary },
            orderNumber
              ? React.createElement(
                  Text,
                  { style: summaryLabel },
                  'Order number',
                  React.createElement('span', { style: summaryValue }, orderNumber)
                )
              : null,
            React.createElement(
              Text,
              { style: summaryLabel },
              'Refund amount',
              React.createElement('span', { style: summaryValue }, totalAmount)
            ),
            React.createElement(
              Text,
              { style: summaryLabel },
              'Status',
              React.createElement('span', { style: successValue }, 'Refunded')
            )
          ),
          React.createElement(
            Section,
            { style: note },
            React.createElement(
              Text,
              { style: noteText },
              'Your bank or card provider may take a few business days to show the refund.'
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
const logo = { maxWidth: '140px', height: 'auto' };
const eyebrow = { color: '#828585', fontSize: '13px', fontWeight: 600, marginTop: '16px' };
const content = { padding: '28px 40px 40px' };
const successPill = {
  display: 'inline-block',
  backgroundColor: '#e6f8f6',
  color: '#007e75',
  borderRadius: '999px',
  padding: '6px 12px',
  fontSize: '13px',
  fontWeight: 700,
  margin: '0 0 18px',
};
const title = { fontSize: '28px', lineHeight: '34px', fontWeight: 700, color: '#2e3333' };
const message = { fontSize: '16px', lineHeight: '24px', color: '#585c5c', margin: '0 0 24px' };
const summary = {
  padding: '20px',
  backgroundColor: '#f8fafa',
  border: '1px solid #e8ebeb',
  borderRadius: '8px',
};
const summaryLabel = { fontSize: '14px', color: '#585c5c', margin: '0 0 12px' };
const summaryValue = { float: 'right' as const, color: '#2e3333', fontWeight: 700 };
const successValue = { float: 'right' as const, color: '#007e75', fontWeight: 700 };
const note = {
  marginTop: '20px',
  padding: '16px',
  backgroundColor: '#f8fafa',
  borderLeft: '4px solid #00ccbc',
  borderRadius: '6px',
};
const noteText = { color: '#585c5c', fontSize: '14px', lineHeight: '21px', margin: '0' };
const buttonContainer = { textAlign: 'left' as const, margin: '28px 0 0' };
const button = {
  backgroundColor: '#00ccbc',
  color: '#ffffff',
  textDecoration: 'none',
  padding: '16px 32px',
  borderRadius: '6px',
  fontSize: '16px',
  fontWeight: 700,
};
const link = { color: '#00ccbc', textDecoration: 'none', fontSize: '14px' };
const footer = {
  padding: '28px 40px',
  backgroundColor: '#f6f6f6',
  textAlign: 'left' as const,
  borderTop: '1px solid #e8ebeb',
};
const footerText = { fontSize: '14px', color: '#828585', marginBottom: '10px' };

export default PaymentRefundedEmail;
