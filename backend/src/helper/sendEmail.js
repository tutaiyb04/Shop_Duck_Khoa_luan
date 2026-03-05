const nodemailer = require("nodemailer");

async function sendEmail(options) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GOOGLE_USER,
      pass: process.env.GOOGLE_PASS,
    },
  });

  const mailOptions = {
    from: "Hệ thống Duck Shop",
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
