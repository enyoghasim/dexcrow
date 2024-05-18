// src/config/emailConfig.ts
import { Resend } from 'resend';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resend = new Resend(process.env.RESEND_API_KEY!);

const partialsDir = path.join(__dirname, '..', 'email-templates', 'partials');
fs.readdirSync(partialsDir).forEach(file => {
  const partialName = path.basename(file, '.hbs');
  const partialTemplate = fs.readFileSync(path.join(partialsDir, file), 'utf-8');
  handlebars.registerPartial(partialName, partialTemplate);
});

export const compileTemplate = (templateName: string, context: any) => {
  const templatePath = path.join(__dirname, '..', 'email-templates', 'templates', `${templateName}.hbs`);
  const templateSource = fs.readFileSync(templatePath, 'utf-8').toString();
  const template = handlebars.compile(templateSource);
  return template(context);
};

export default resend;
