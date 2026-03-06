const dotenv = require("dotenv");
dotenv.config();

async function sendEmail(options) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.GOOGLE_USER; // Email bạn đã xác thực trên Brevo (Senders)

  console.log("Kiểm tra API Key:", apiKey);
  console.log("Kiểm tra Sender Email:", senderEmail);

  // Cấu hình dữ liệu gửi đi theo chuẩn API của Brevo
  const emailData = {
    sender: {
      name: "Hệ thống Duck Shop",
      email: senderEmail,
    },
    to: [
      {
        email: options.email,
      },
    ],
    subject: options.subject,
    htmlContent: options.html,
  };

  try {
    // Gọi API của Brevo qua giao thức HTTPS (Cổng 443 - không bị Render chặn)
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.log("Lỗi từ hệ thống Brevo: ", errorDetails);
      throw new Error("Không thể gửi email qua Brevo API");
    }

    console.log(`Gửi email thành công tới: ${options.email}`);
    return true;
  } catch (error) {
    console.log("Lỗi catch được khi gửi mail: ", error);
    throw new Error("Lỗi khi gửi email");
  }
}

module.exports = sendEmail;
