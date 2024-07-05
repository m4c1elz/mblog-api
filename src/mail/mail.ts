import nodemailer, { SendMailOptions } from "nodemailer"
import { Email } from "./templates/email"
import { render } from "@react-email/components"

const { API_MAIL_USER, API_MAIL_PASS, BASE_URL } = process.env

const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    ssl: true,
    tls: true,
    auth: {
        user: API_MAIL_USER,
        pass: API_MAIL_PASS,
    },
})

export function sendConfirmationEmail({
    to,
    token,
}: {
    to: string
    token: string
}) {
    transport
        .sendMail({
            from: API_MAIL_USER,
            to,
            subject: "Verificação de email",
            html: render(
                Email({
                    email: to,
                    authLink: new URL(
                        `/auth/confirm/${token}`,
                        BASE_URL
                    ).toString(),
                })
            ),
        })
        .then(emailInfo => {
            console.log(emailInfo.envelope)
        })
        .catch(err => {
            console.log(err)
        })
}
