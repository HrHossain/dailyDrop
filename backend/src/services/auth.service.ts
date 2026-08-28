import { emailVerificationTemplate } from '../templates/emailVerification.template.js';
import { generateEmailVerificationToken } from '../utils/jwt.js';
import { env } from '../validations/env.schema.js';
import { mailService } from './mail.service.js';
export const sendVerificationEmail = async (
  userId: string,
  name: string,
  email: string
) => {
  const token = generateEmailVerificationToken(userId);
  const verificationLink = `${env.APP_URL}/api/v1/auth/verify-email?token=${token}&id=${userId}`;

  const html = emailVerificationTemplate({ name, verificationLink });
  await mailService(
    [email],
    'Verify Your Email',
    `Please verify your email:${verificationLink}`,
    html
  );
};

export const sendPasswordResetEmail = async (
  userId: string,
  name: string,
  email: string,
  resetToken: string
) => {
  const verificationLink = `${env.APP_URL}/api/v1/auth/reset-password/${resetToken}`;

  const html = emailVerificationTemplate({ name, verificationLink });
  await mailService(
    [email],
    'Verify Your Email',
    `Please verify your email:${verificationLink}`,
    html
  );
};
