const nodemailer = require("nodemailer");
require("dotenv").config();
let mailHelper = async (option) => {
    let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.AUTH_USER,
          pass: process.env.AUTH_PASSWORD
        }
      });

    // send mail with defined transport object
    let message={
        from: 'arijitbhakta611@gmail.com', // sender address
        to: option.email, // list of receivers
        subject: option.subject, // Subject line
        text: option.message // plain text body
        // html: "<b>Hello world?</b>", // html body
    }
    await transporter.sendMail(message);
}

module.exports=mailHelper;