import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL || 'peteratambaesther@gmail.com',
    pass: process.env.SMTP_PASSWORD || '',
  },
});

export const sendEmail = async ({ to, subject, html, attachments }: { to: string | string[], subject: string, html: string, attachments?: any[] }) => {
  if (!process.env.SMTP_PASSWORD) {
    console.warn('SMTP_PASSWORD is not set. Email will not be sent.');
    return;
  }
  
  try {
    const info = await transporter.sendMail({
      from: `"E.star SleekNails" <${process.env.SMTP_EMAIL || 'peteratambaesther@gmail.com'}>`,
      to,
      subject,
      html,
      attachments,
    });
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
