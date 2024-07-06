import { Request, Response } from "express"
import { db } from "../db/connection"
import { eq } from "drizzle-orm"
import { refreshTokens, users } from "../db/schema"
import { compare, hash } from "bcryptjs"
import { createTokens } from "../helpers/create-tokens"
import jwt, { JwtPayload } from "jsonwebtoken"
import type { User } from "../types/user"
import { sendConfirmationEmail } from "../mail/mail"

export const authController = {
    async login(req: Request, res: Response) {
        const { email, password } = req.body

        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        })

        if (!user) {
            return res.json({ msg: "Esse usuário não existe." })
        }

        if (user.isVerified !== 1) return res.sendStatus(403)

        const isPasswordCorrect = await compare(password, user.password)

        if (!isPasswordCorrect) {
            return res.sendStatus(403)
        }

        const { accessToken, refreshToken } = createTokens({
            userId: user.id,
        })

        await db.insert(refreshTokens).values({
            userId: user.id,
            token: refreshToken,
            expiresIn: new Date().toLocaleDateString("en-ca"),
        })

        res.cookie("refresh-token", refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        res.status(200).json({
            token: accessToken,
            user: {
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
                return res.status(403).send("Token inválido.")
            }

            const { userId } = decodedToken

            const { accessToken } = createTokens({ userId })

            return res.status(200).json({ token: accessToken })
        } catch (error) {
            console.log(error)
            await db
                .delete(refreshTokens)
                .where(eq(refreshToken, refreshTokens.token))
            return res.sendStatus(403)
        }
    },
    async register(req: Request, res: Response) {
        const { email, password }: User = req.body

        const userAlreadyExists = await db.query.users.findFirst({
            where: eq(users.email, email),
        })

        if (userAlreadyExists) {
            return res.status(409).send("Este usuário já existe!")
        }

        const atsign = email.match(/^[^@]+/)![0]

        const [newUser] = await db.insert(users).values({
            email,
            password: await hash(password, 10),
            name: email,
            atsign,
            isVerified: 0,
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
        // email auth logic enters here
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
        const { userId }: { userId: number } = req.user

        await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId))
        res.clearCookie("refresh-token")
        return res.sendStatus(204)
    },
    async verifyEmail(req: Request, res: Response) {
        const { token } = req.params

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            const { userId } = decoded as { userId: number }
            const user = await db.query.users.findFirst({
                where: eq(users.id, userId),
            })
            if (!user) {
                return res.send("Este usuário não existe!")
            }

            await db
                .update(users)
                .set({
                    isVerified: 1,
                })
                .where(eq(users.id, userId))

            // will change to a redirect when front-end gets to work
            return res.status(200).send({
                msg: "E-mail verificado. Agora você pode fazer login normalmente.",
            })
        } catch (error) {
            console.log(error)
            return res.sendStatus(500)
        }
    },
}
