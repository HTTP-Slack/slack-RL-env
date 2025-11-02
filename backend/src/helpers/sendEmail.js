import nodemailer from 'nodemailer';

export default async function sendEmail(to, subject, html, text) {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_HOST,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
      text,
    })
  } catch (error) {
    console.log("Error in send email", error);
  }
}