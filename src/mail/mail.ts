import nodemailer from "nodemailer"
import { Email } from "./templates/email"
import { render } from "@react-email/components"

const { API_MAIL_USER, API_MAIL_PASS, EMAIL_REDIRECT_BASE_URL } = process.env

const transport = nodemailer.createTransport({
    service: "gmail",
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
    transport.sendMail({
        from: API_MAIL_USER,
        to,
        subject: "Verificação de email",
        html: render(
            Email({
                email: to,
                authLink: new URL(
                    `/verify/${token}`,
                    EMAIL_REDIRECT_BASE_URL
                ).toString(),
            })
        ),
    })
}
