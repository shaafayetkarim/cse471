// lib/resend.ts

import { Resend } from 'resend';

// Check if the API key is set
if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not defined. Email functionality will not work.');
}

// Initialize Resend with the API key
export const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender configuration
export const DEFAULT_FROM_EMAIL = 'onboarding@resend.dev'; // Resend's default verified domain

// Email types
export type EmailType = 'welcome' | 'password-reset' | 'notification';

// Function to send emails with error handling using Resend's default email
export async function sendEmail({
  to,
  subject,
  text,
  from = DEFAULT_FROM_EMAIL,
  type = 'notification',
}: {
  to: string;
  subject: string;
  text: string;
  from?: string;
  type?: EmailType;
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not defined');
    }

    const data = await resend.emails.send({
      from,
      to,
      subject,
      text, // Using plain text format instead of HTML
      tags: [{ name: 'email_type', value: type }],
    });

    return { success: true, data };
  } catch (error) {
    console.error(`Failed to send ${type} email:`, error);
    return { success: false, error };
  }
}