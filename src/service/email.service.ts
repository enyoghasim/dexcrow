import resend, { compileTemplate } from '../config/email.js';
import logger from '../utils/logger.js';

export const sendEmail = async ({
  from = 'Dexcrow <noreply@dexcrow.fun>',
  to,
  subject,
  templateName,
  context,
}: {
  from?: string;
  to: string | string[];
  subject: string;
  templateName: string;
  context: any;
}) => {
  try {
    const html = compileTemplate(templateName, context);

    await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    logger.info('Email sent:', subject);
  } catch (error) {
    logger.error('Error sending email:', error);
  }
};

export const sendVerificationOtp = async ({
  from,
  to,
  subject,
  templateName = 'verification-otp',
  context,
}: {
  from?: string;
  to: string | string[];
  subject: string;
  templateName?: string;
  context: any;
}) => {
  await sendEmail({
    from,
    to,
    subject,
    templateName,
    context,
  });
};
