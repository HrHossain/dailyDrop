
import nodemailer from 'nodemailer'
import { env } from '../validations/env.schema.js';

// first transporter configuration 
const transporter = nodemailer.createTransport({
  service: 'gmail', // true for 465, false for other ports
  auth: {
    user: env.GOOGLE_APP_EMAIL, // generated ethereal user
    pass: env.GOOGLE_APP_PASS, // generated ethereal password
  },
});

export const mailService = async (to: string[], subject: string,text:string, html: string) => {
  try {
    await transporter.sendMail({
        from:`"AI SEO checker" <${env.GOOGLE_APP_EMAIL}>`, // sender address
        to: to.join(','), // list of receivers
        text, // plain text body
        subject, // Subject line
        html, // html body
      });
     
  } catch (error) {
    throw (`Failed to send email ${error}`);
  } 
}