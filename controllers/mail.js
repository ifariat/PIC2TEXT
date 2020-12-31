const nodemailer = require('nodemailer');
const errorsList = require('./errorsList.js');


module.exports = {
    send: ({
            name,
            email,
            message
        }) => {
        return new Promise((resolve,reject) => { 

            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
    
            let mailOptions = {
                from: `📨 New message ${process.env.EMAIL_USER}`,
                to: 'hi@pic2text.com',
                subject: `New message from ${name}`,
                cc: email,
                html: `<p>${message}</p>`
            };
    
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(errorsList.mailSuccess);
                }
            });
        })
    }
}