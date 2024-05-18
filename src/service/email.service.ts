import resend, { compileTemplate } from '../config/email.js';

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

    console.log('Email sent:', subject);
  } catch (error) {
    console.error('Error sending email:', error);
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
