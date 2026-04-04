import { Resend } from 'resend';
import { env } from '../config/env.js';

const resendClient = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

type PasswordResetEmailParams = {
  to: string;
  resetUrl: string;
};

export const sendPasswordResetEmail = async ({ to, resetUrl }: PasswordResetEmailParams) => {
  if (!resendClient) {
    if (env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(`RESEND_API_KEY is missing. Password reset email was not sent. Reset URL for ${to}: ${resetUrl}`);
    }
    return;
  }

  await resendClient.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: 'Reset your password',
    html: `
      <p>We received a request to reset your The Backstage password.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link expires in ${env.PASSWORD_RESET_TOKEN_TTL_MINUTES} minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
    text: `We received a request to reset your The Backstage password.\n\nReset your password: ${resetUrl}\n\nThis link expires in ${env.PASSWORD_RESET_TOKEN_TTL_MINUTES} minutes.\n\nIf you did not request this, you can ignore this email.`,
  });
};
