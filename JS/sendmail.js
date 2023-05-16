const nodemailer = require('nodemailer');


async function resetPasswordMail(email){

    let transporter = nodemailer.createTransport({
        host: process.env.HOST,
        port: 465,
        secure: true,
        auth: {
            user: process.env.USER,
            pass: process.env.PASS,
        },
    });

    let info = await transporter.sendMail({
        from: test,
        to: test,
        subject: test ,
        text: test,
        html: test,
    })
    

}

module.exports = resetPasswordMail;