const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter (using Ethereal for development)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendVerificationEmail = async (toEmail, verificationCode) => {
  const mailOptions = {
    from: `"H Wallet" <${process.env.MAIL_FROM}>`,
    to: toEmail,
    subject: '您的 H Wallet 验证码',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">H Wallet 注册验证</h2>
        <p>感谢您注册 H Wallet！</p>
        <p>您的验证码是：</p>
        <div style="background-color: #F9FAFB; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 10px; font-weight: bold; color: #111827; border-radius: 8px; margin: 20px 0;">
          ${verificationCode}
        </div>
        <p>此验证码将在 <strong>60秒</strong> 后过期。</p>
        <p>如果您没有请求此验证码，请忽略此邮件。</p>
        <hr style="border: none; border-top: 1px solid #D1D5DB; margin: 30px 0;" />
        <p style="color: #6B7280; font-size: 14px;">H Wallet 团队</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent: %s', info.messageId);
    // Preview URL for Ethereal emails
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send verification email');
  }
};

module.exports = {
  sendVerificationEmail,
};