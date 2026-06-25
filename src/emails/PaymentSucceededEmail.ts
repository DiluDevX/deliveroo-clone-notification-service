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

interface PaymentSucceededEmailProps {
  orderUrl: string;
  customerName: string;
  totalAmount: string;
  companyName: string;
  supportEmail: string;
  logoUrl: string;
}

export const PaymentSucceededEmail = ({
  orderUrl,
  customerName,
  totalAmount,
  companyName,
  supportEmail,
  logoUrl,
}: PaymentSucceededEmailProps) => {
  return React.createElement(
    Html,
    null,
    React.createElement(Head),
    React.createElement(Preview, null, `Payment received for your ${companyName} order`),
    React.createElement(
      Body,
      { style: main },
      React.createElement(
        Container,
        { style: container },
        React.createElement(
          Section,
          { style: header },
          React.createElement(Img, { src: logoUrl, alt: companyName, style: logo })
        ),
        React.createElement(
          Section,
          { style: content },
          React.createElement(Text, { style: title }, 'Payment Received'),
          React.createElement(
            Text,
            { style: message },
            `Hi ${customerName}, your card payment of ${totalAmount} was successful.`
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
  borderRadius: '8px',
  overflow: 'hidden',
};

const header = {
  backgroundColor: '#00ccbc',
  padding: '30px 40px',
  textAlign: 'center' as const,
};

const logo = {
  maxWidth: '150px',
  height: 'auto',
};

const content = {
  padding: '40px',
};

const title = {
  fontSize: '24px',
  fontWeight: 600,
  color: '#2e3333',
  marginBottom: '20px',
  textAlign: 'center' as const,
};

const message = {
  fontSize: '16px',
  color: '#585c5c',
  marginBottom: '30px',
  textAlign: 'center' as const,
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#00ccbc',
  color: '#ffffff',
  textDecoration: 'none',
  padding: '16px 32px',
  borderRadius: '4px',
  fontSize: '16px',
  fontWeight: 600,
};

const link = {
  color: '#00ccbc',
  textDecoration: 'none',
  fontSize: '14px',
};

const footer = {
  padding: '30px 40px',
  backgroundColor: '#f6f6f6',
  textAlign: 'center' as const,
  borderTop: '1px solid #e8ebeb',
};

const footerText = {
  fontSize: '14px',
  color: '#828585',
  marginBottom: '10px',
};

export default PaymentSucceededEmail;
