var nodemailer = require('nodemailer');


function sendEmail(subject, text) {
    var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.FROM_EMAIL,
            pass: process.env.FROM_PASSWORD
        },
    });

    var mailOptions = {
        from: process.env.FROM_EMAIL, // sender address
        to: process.env.TO_EMAIL, // list of receivers
        subject, // Subject line
        html: text
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    })
}

module.exports = {
    sendEmail
};