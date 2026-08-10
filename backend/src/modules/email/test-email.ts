import 'dotenv/config';
import { emailService } from '../../shared/email/email.service';

const test = async () => {
  await emailService.send({
    to: 'parthxdev404@gmail.com',
    subject: 'LinkForge Brevo Test',
    html: `
      <h1>Brevo is working 🎉</h1>
      <p>This email was sent from the LinkForge backend.</p>
    `,
  });

  console.log('Test email sent');
};

test().catch((error) => {
  console.error('Test email failed:', error);
  process.exit(1);
});
