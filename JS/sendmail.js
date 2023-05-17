const nodemailer = require('nodemailer');
require("dotenv").config();


function resetPasswordMail(email, token){

    let transporter = nodemailer.createTransport({
        host: process.env.HOST,
        port: 465,
        secure: true,
        auth: {
            user: process.env.USER,
            pass: process.env.PASS,
        },
    });

    let mailOptions = {
        from: test,
        to: test,
        subject: 'Reset Password Link - NatureDopes' ,
        text: test,
        html: '<p>You requested for reset password, kindly use this <a href="http://localhost:4000/reset-password?token=' + token + '">link</a> to reset your password</p>',
    }
    
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(1)
        } else {
            console.log(0)
        }
    });
}

module.exports = resetPasswordMail;