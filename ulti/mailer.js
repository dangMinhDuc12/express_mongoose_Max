const nodeMailer = require('nodemailer')

const adminEmail = process.env.ADMIN_EMAIL
const adminPassword = process.env.ADMIN_PASSWORD

const mailHost = process.env.MAIL_HOST
const mailPort = 587

const sendMail = (to, subject, html) => {
    const transporter = nodeMailer.createTransport({
        host: mailHost,
        port: mailPort,
        //true khi dung port 465
        secure: false,
        auth: {
            user: adminEmail,
            pass: adminPassword
        }
    })
    const options = {
        from: adminEmail,
        to,
        subject,
        html
    }
    return transporter.sendMail(options)
}

module.exports = {
    sendMail
}