import { Request, Response } from "express"
import { db } from "../db/connection"
import { eq } from "drizzle-orm"
import { refreshTokens, users } from "../db/schema"
import { compare, hash } from "bcryptjs"
import { createTokens } from "../helpers/create-tokens"
import jwt, { JwtPayload } from "jsonwebtoken"
import type { User } from "../types/user"

export const authController = {
    async login(req: Request, res: Response) {
        const { email, password } = req.body

        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        })

        if (!user) {
            return res.json({ msg: "Esse usuário não existe." })
        }

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

        const [newUser] = await db.insert(users).values({
            email,
            password: await hash(password, 10),
            name: email,
        })

        const { accessToken, refreshToken } = createTokens({
            userId: newUser.insertId,
        })

        await db.insert(refreshTokens).values({
            userId: newUser.insertId,
            token: refreshToken,
            expiresIn: new Date().toLocaleDateString("en-ca"),
        })

        res.cookie("refresh-token", refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        return res.status(200).json({
            token: accessToken,
        })
    },
}
