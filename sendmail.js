const nodemailer = require('nodemailer');
require('dotenv').config()



function sendMail(email, token){

    let transporter = nodemailer.createTransport({
        host: process.env.HOST,
        port: 587,
        /*secure: true,*/
        auth: {
            user: process.env.USER,
            pass: process.env.PASS,
        },
    });

    let mailOptions = {
        from: 'naturedopes@gmx.fr',
        to: email,
        subject: 'Reset Password Link - NatureDopes' ,
        text: 'please find password rest link',
        html: '<p>You requested for reset password, kindly use this <a href="http://naturedopes.com/reset-password?token=' + token + '">link</a> to reset your password</p>',
    }
    
    transporter.sendMail(mailOptions, function(error, info) {
       
        if (error) {
            console.log(error)
        } else {
            console.log(mailOptions)
        }
    });
}

module.exports = sendMail;
