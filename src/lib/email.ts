import nodemailer from 'nodemailer';

const getTransporter = () => {
  const user = (process.env.SMTP_EMAIL || 'yemuelinc@gmail.com').trim();
  const pass = (process.env.SMTP_PASSWORD || '').replace(/\s+/g, '');

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
};

export const sendEmail = async ({ 
  to, 
  replyTo, 
  subject, 
  html, 
  attachments 
}: { 
  to: string | string[], 
  replyTo?: string, 
  subject: string, 
  html: string, 
  attachments?: any[] 
}) => {
  const smtpEmail = (process.env.SMTP_EMAIL || 'yemuelinc@gmail.com').trim();
  const smtpPass = (process.env.SMTP_PASSWORD || '').replace(/\s+/g, '');

  if (!smtpPass) {
    console.warn('[EMAIL] SMTP_PASSWORD is not set. Email will not be sent.');
    return { success: false, error: 'SMTP_PASSWORD is not set' };
  }
  
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: `"E.star SleekNails" <${smtpEmail}>`,
      to,
      replyTo,
      subject,
      html,
      attachments,
    });
    console.log('[EMAIL] Message sent successfully. ID: %s, To: %s', info.messageId, Array.isArray(to) ? to.join(', ') : to);
    return info;
  } catch (error) {
    console.error('[EMAIL] Error sending email to', to, error);
    throw error;
  }
};
