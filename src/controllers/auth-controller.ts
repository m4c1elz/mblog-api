import { Request, Response } from "express"
import { db } from "../db/connection"
import { eq } from "drizzle-orm"
import { refreshTokens, users } from "../db/schema"
import { compare } from "bcryptjs"
import { createTokens } from "../helpers/create-tokens"
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken"
import type { User } from "../types/user"
import { sendConfirmationEmail } from "../mail/mail"
import { UserPayload } from "../types/user-payload"
import * as authServices from "../services/auth"

export const authController = {
    async login(req: Request, res: Response) {
        const { email, password } = req.body

        const user = await authServices.findUserByEmail({ email })

        if (!user) {
            return res.status(404).json({ msg: "Esse usuário não existe." })
        }

        if (user.isVerified !== 1) return res.sendStatus(403)

        const isPasswordCorrect = await compare(password, user.password)
        if (!isPasswordCorrect) return res.sendStatus(403)

        const { accessToken, refreshToken } = createTokens({
            userId: user.id,
        })

        await authServices.saveRefreshToken({
            userId: user.id,
            token: refreshToken,
        })

        res.cookie("refresh-token", refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        res.status(200).json({
            token: accessToken,
            user: {
                id: user.id,
                name: user.name,
                atsign: user.atsign,
                email: user.email,
                description: user.description,
            },
        })
    },
    async refresh(req: Request, res: Response) {
        const cookies = req.cookies

        if (!cookies || !cookies["refresh-token"]) {
            return res.sendStatus(406)
        }

        const refreshToken = cookies["refresh-token"]
        try {
            const decodedToken = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET
            ) as JwtPayload

            const token = await db.query.refreshTokens.findFirst({
                where: eq(refreshTokens.token, refreshToken),
            })

            if (!token) {
                res.clearCookie("refresh-token")
                res.status(403).send("Token inválido. Faça login novamente.")
            }

            const { userId } = decodedToken

            const { accessToken } = createTokens({ userId })

            return res.status(200).json({ token: accessToken })
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                console.log(error.message)
                await authServices.deleteRefreshToken({ refreshToken })
                return res.status(403).send("Este token foi expirado.")
            }
            return res.sendStatus(500)
        }
    },
    async register(req: Request, res: Response) {
        const { email, password }: User = req.body

        const userAlreadyExists = await authServices.findUserByEmail({ email })

        if (userAlreadyExists)
            return res.status(409).send("Este usuário já existe!")

        const atsign = email.match(/^[^@]+/)![0]

        const newUser = await authServices.registerUser({
            email,
            atsign,
            password,
        })

        const accessToken = jwt.sign(
            {
                userId: newUser.insertId,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h",
            }
        )

        try {
            sendConfirmationEmail({
                to: email,
                token: accessToken,
            })

            return res.status(200).json({
                msg: "Por favor, verifique seu email.",
            })
        } catch (error) {
            console.log(error)
            return res.sendStatus(500)
        }
    },
    async logout(req: Request, res: Response) {
        const { userId } = req.user

        await authServices.logoutUser({ userId })
        res.clearCookie("refresh-token")
        return res.sendStatus(204)
    },
    async verifyEmail(req: Request, res: Response) {
        const { token } = req.params

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            const { userId } = decoded as UserPayload
            const user = await db.query.users.findFirst({
                where: eq(users.id, userId),
            })
            if (!user) return res.send("Este usuário não existe!")

            await authServices.setVerifiedUser({ userId })

            // will change to a redirect when front-end gets to work
            return res.status(200).send({
                msg: "E-mail verificado. Agora você pode fazer login normalmente.",
            })
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                return res.status(401).send("Este link expirou.")
            }
            return res.sendStatus(500)
        }
    },
}
