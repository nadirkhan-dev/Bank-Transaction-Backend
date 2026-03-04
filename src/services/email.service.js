require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Bank_Transaction" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

async function sendRegisterUserEmail(userEmail, name) {
  const subject = "Welcome to Bank_Transaction";
  const text = `Hello ${name}, \n\n Best regards,\nThe Bank_Transaction Team`;
  const html = `<p> Hello ${name},</p> <p>Thank you for registering at Bank_Transaction <br> Best regards `;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Alert";
  const text = `Hello ${name}, \n\n Your account has been debited with amount ${amount} for transaction to account ${toAccount}. \n\n Best regards,\nThe Bank_Transaction Team`;
  const html = `<p> Hello ${name},</p> <p>Your account has been debited with amount ${amount} for transaction to account ${toAccount}. <br> Best regards `;
  await sendEmail(userEmail, subject, text, html);
}
async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Failed";
  const text = `Hello ${name}, \n\n Your transaction to account ${toAccount} with amount ${amount} has failed. \n\n Best regards,\nThe Bank_Transaction Team`;
  const html = `<p> Hello ${name},</p> <p>Your transaction to account ${toAccount} with amount ${amount} has failed. <br> Best regards `;
  await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendRegisterUserEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail,
};
