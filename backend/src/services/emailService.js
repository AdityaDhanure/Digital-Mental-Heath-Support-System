// src/services/emailService.js - Email sending service via Nodemailer

import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import { EMAIL_CONFIG, CORS_CONFIG } from '../config/env.js';

const SMTP_CONFIG = {
  host: EMAIL_CONFIG.SMTP_HOST,
  port: EMAIL_CONFIG.SMTP_PORT,
  secure: false,
  auth: {
    user: EMAIL_CONFIG.SMTP_USER,
    pass: EMAIL_CONFIG.SMTP_PASS,
  },
};

const APP_NAME = 'MindfulCampus';
const FROM_ADDRESS = `"${APP_NAME}" <${EMAIL_CONFIG.SMTP_USER}>`;
const BRAND_COLOR = '#7c3aed';
const BRAND_LIGHT = '#f5f3ff';

// ─── Create transporter ───────────────────────────────────────────────────────
let transporter;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport(SMTP_CONFIG);
  }
  return transporter;
}

// ─── Base HTML wrapper ────────────────────────────────────────────────────────
function baseTemplate(content) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${APP_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND_COLOR},#a855f7);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
                💙 ${APP_NAME}
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">
                Your mental wellness companion
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:${BRAND_LIGHT};padding:20px 40px;text-align:center;border-top:1px solid #e9d5ff;">
              <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.6;">
                This is an automated message from ${APP_NAME}.<br/>
                If you did not request this, please ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Send OTP Verification Email ──────────────────────────────────────────────
export async function sendVerificationEmail(email, name, otp) {
  const content = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:700;">
      Verify your email address
    </h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
      Hi ${name || 'there'}, use the OTP below to verify your email address for your ${APP_NAME} account.
    </p>

    <!-- OTP Box -->
    <div style="background:${BRAND_LIGHT};border:2px dashed ${BRAND_COLOR};border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
      <p style="margin:0 0 6px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Your verification code</p>
      <p style="margin:0;color:${BRAND_COLOR};font-size:42px;font-weight:800;letter-spacing:10px;">${otp}</p>
      <p style="margin:10px 0 0;color:#9ca3af;font-size:12px;">⏱ Valid for 10 minutes</p>
    </div>

    <p style="margin:0 0 16px;color:#6b7280;font-size:14px;line-height:1.7;">
      Enter this code in the app to complete your email verification.
      Do <strong>not</strong> share this code with anyone.
    </p>

    <div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:6px;padding:14px 18px;">
      <p style="margin:0;color:#92400e;font-size:13px;">
        ⚠️ If you didn't request email verification, please change your password immediately.
      </p>
    </div>`;

  try {
    await getTransporter().sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject: `${otp} — Your ${APP_NAME} Verification Code`,
      html: baseTemplate(content),
    });
    logger.info('Verification OTP email sent', { email });
  } catch (error) {
    logger.error('Failed to send verification email', { email, error: error.message });
    throw error;
  }
}

// ─── Send Notification Email ──────────────────────────────────────────────────
export async function sendNotificationEmail(email, name, notification) {
  const { title, message, actionUrl, actionLabel, type } = notification;

  const typeEmoji = {
    booking_confirmed: '✅',
    booking_reminder: '⏰',
    booking_cancelled: '❌',
    booking_rescheduled: '📅',
    chat_alert: '💬',
    community_reply: '💬',
    community_upvote: '👍',
    resource_recommendation: '📚',
    crisis_alert: '🆘',
    system_announcement: '📢',
    counselor_message: '👨‍⚕️',
    moderation_action: '🛡️',
    general: '🔔',
  }[type] || '🔔';

  const actionButtonHtml = actionUrl ? `
    <div style="text-align:center;margin:28px 0;">
      <a href="${CORS_CONFIG.FRONTEND_URL || 'http://localhost:3000'}${actionUrl}"
         style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;
                padding:13px 32px;border-radius:10px;font-weight:600;font-size:15px;">
        ${actionLabel || 'View Details'} →
      </a>
    </div>` : '';

  const content = `
    <p style="margin:0 0 20px;color:#6b7280;font-size:15px;">Hi ${name || 'there'},</p>

    <div style="background:#f8f9fa;border-radius:12px;padding:24px;margin-bottom:24px;border-left:4px solid ${BRAND_COLOR};">
      <h2 style="margin:0 0 10px;color:#111827;font-size:19px;font-weight:700;">
        ${typeEmoji} ${title}
      </h2>
      <p style="margin:0;color:#374151;font-size:15px;line-height:1.7;">
        ${message}
      </p>
    </div>

    ${actionButtonHtml}

    <p style="margin:0;color:#9ca3af;font-size:13px;">
      You received this because you have email notifications enabled. 
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings" style="color:${BRAND_COLOR};">Manage preferences</a>
    </p>`;

  try {
    await getTransporter().sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject: `${typeEmoji} ${title} — ${APP_NAME}`,
      html: baseTemplate(content),
    });
    logger.info('Notification email sent', { email, type });
  } catch (error) {
    logger.error('Failed to send notification email', { email, error: error.message });
    // Do not throw — notification emails are non-critical
  }
}

// ─── Verify SMTP connection ───────────────────────────────────────────────────
export async function verifyEmailConnection() {
  try {
    await getTransporter().verify();
    logger.info('SMTP connection verified successfully');
    return true;
  } catch (error) {
    logger.warn('SMTP connection could not be verified', { error: error.message });
    return false;
  }
}
