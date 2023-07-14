const nodemailer = require("nodemailer");
require("dotenv").config();
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  secureConnection: true,
  port: 465,
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function sendEmail(user, errorDetails) {
  try {
    // Compose the email message
    const mailOptions = {
      from: process.env.EMAIL_ID,
      to: user.email,
      subject: "Website Error Notification",
      text: `Dear ${user.name},\n\nYour website is experiencing errors:\n\n${errorDetails}\n\nPlease take necessary action.\n\nBest regards,\nYour Website Monitoring Team`,
    };

    //   Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${user.email}`);
    // return { success: true };
  } catch (error) {
    console.error(`Error sending email to ${user.email}: ${error}`);
  }
}

module.exports = {
  sendEmail,
};
