import { Request, Response } from "express"
import { db } from "../db/connection"
import { asc, eq } from "drizzle-orm"
import { users } from "../db/schema"
import { hash } from "bcryptjs"
import type { User } from "../types/user"

export const userController = {
    async getUsers(req: Request, res: Response) {
        const { page } = req.query

        if (!page)
            return res.status(400).json({ msg: "Please inform the page." })

        const result = await db.query.users.findMany({
            orderBy: [asc(users.name)],
            columns: {
                id: true,
                name: true,
                atsign: true,
                email: true,
                followers: true,
                description: true,
                createdAt: true,
                updatedAt: true,
            },
            limit: 10,
            offset: (Number(page) - 1) * 10,
        })

        return res.json(result)
    },
    async getUser(req: Request, res: Response) {
        const { id } = req.params
        const { posts: postQuery } = req.query
        const result = await db.query.users.findFirst({
            where: eq(users.id, Number(id)),
            with:
                postQuery == "true"
                    ? {
                          posts: true,
                      }
                    : undefined,
            columns: {
                id: true,
                name: true,
                atsign: true,
                email: true,
                followers: true,
                description: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        return res.json(result)
    },
    async updateUser(req: Request, res: Response) {
        const { userId }: { userId: number } = req.user
        const userData: User = req.body

        await db
            .update(users)
            .set({
                ...userData,
                password:
                    userData.password && (await hash(userData.password, 10)),
            })
            .where(eq(users.id, userId))

        return res.sendStatus(201)
    },
    async deleteUser(req: Request, res: Response) {
        const { id } = req.params

        await db.delete(users).where(eq(users.id, Number(id)))

        return res.sendStatus(200)
    },
}
