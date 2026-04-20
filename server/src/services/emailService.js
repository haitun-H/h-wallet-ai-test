const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendVerificationCode(email, code) {
    const mailOptions = {
      from: `"H Wallet" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: '【H Wallet】邮箱验证码',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">H Wallet 邮箱验证</h2>
          <p>您好！</p>
          <p>您正在注册 H Wallet 账户，验证码为：</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; background-color: #F3F4F6; padding: 10px 20px; border-radius: 8px;">
              ${code}
            </span>
          </div>
          <p>此验证码 <strong>5分钟</strong> 内有效，请勿泄露给他人。</p>
          <p>如非本人操作，请忽略此邮件。</p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6B7280;">H Wallet 团队</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ 验证码邮件已发送至: ${email}`);
      return true;
    } catch (error) {
      console.error('❌ 发送邮件失败:', error);
      throw new Error('邮件发送失败，请稍后重试');
    }
  }
}

module.exports = new EmailService();