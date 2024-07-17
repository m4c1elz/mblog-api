import { Request, Response } from "express"
import { db } from "../db/connection"
import { count, desc, eq, like } from "drizzle-orm"
import { comments, posts, users } from "../db/schema"
import { hash } from "bcryptjs"
import type { User } from "../types/user"

export const userController = {
    async getUsers(req: Request, res: Response) {
        const { page, search } = req.query

        if (!page)
            return res.status(400).json({ msg: "Please inform the page." })

        const result = await db
            .select({
                id: users.id,
                name: users.name,
                atsign: users.atsign,
                email: users.email,
                followers: users.followers,
                description: users.description,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .limit(15)
            .offset((Number(page) - 1) * 15)
            .orderBy(users.name)
            .where(like(users.name, search ? `%${search}%` : "%%"))

        return res.json(result)
    },
    async getUserPosts(req: Request, res: Response) {
        const { id } = req.params

        const result = await db
            .select({
                id: posts.id,
                name: users.name,
                atsign: users.atsign,
                post: posts.post,
                likes: posts.likes,
                comments: count(comments.id),
                createdAt: posts.createdAt,
                updatedAt: posts.updatedAt,
            })
            .from(posts)
            .rightJoin(users, eq(users.id, posts.userId))
            .leftJoin(comments, eq(posts.id, comments.postId))
            .where(eq(users.id, Number(id)))
            .groupBy(posts.id)
            .orderBy(desc(posts.createdAt))

        return res.json(result)
    },
    async getUserById(req: Request, res: Response) {
        const { id } = req.params
        const { posts: postQuery } = req.query
        const result = await db.query.users.findFirst({
            where: eq(users.id, Number(id)),
            with:
                postQuery == "true"
                    ? {
                          posts: {
                              columns: {
                                  id: true,
                                  post: true,
                                  likes: true,
                                  createdAt: true,
                                  updatedAt: true,
                              },
                              orderBy: desc(posts.createdAt),
                          },
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

        if (!result) return res.sendStatus(404)

        return res.json(result)
    },
    async getUserByAtsign(req: Request, res: Response) {
        const { atsign } = req.params
        const { posts: postQuery } = req.query
        const result = await db.query.users.findFirst({
            where: eq(users.atsign, atsign),
            with:
                postQuery == "true"
                    ? {
                          posts: {
                              columns: {
                                  id: true,
                                  post: true,
                                  likes: true,
                                  createdAt: true,
                                  updatedAt: true,
                              },
                              orderBy: desc(posts.createdAt),
                          },
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

        if (!result) return res.sendStatus(404)

        return res.json(result)
    },
    async updateUser(req: Request, res: Response) {
        const { userId } = req.user
        const userData: Partial<User> = req.body

        const updateData: Partial<User> = {
            ...userData,
        }

        if (userData.password) {
            updateData.password = await hash(userData.password, 10)
        } else {
            delete updateData.password
        }

        await db
            .update(users)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId))

        return res.sendStatus(201)
    },
    async deleteUser(req: Request, res: Response) {
        const { id } = req.params
        const { userId } = req.user

        if (Number(id) !== userId) return res.sendStatus(403)

        await db.delete(users).where(eq(users.id, Number(id)))
        res.clearCookie("refresh-token")

        return res.sendStatus(200)
    },
}
