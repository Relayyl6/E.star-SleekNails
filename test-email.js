import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'oseghaleleonard39@gmail.com',
    pass: 'ehmijxkucwhlmfww',
  },
});

async function main() {
  try {
    const info = await transporter.sendMail({
      from: 'oseghaleleonard39@gmail.com',
      to: 'oseghaleleonard39@gmail.com',
      subject: 'Test Email',
      text: 'This is a test email.',
    });
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

main();
