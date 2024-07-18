import { Request, Response } from "express"
import { db } from "../db/connection"
import { and, count, desc, eq, is, like } from "drizzle-orm"
import { comments, followers, posts, users } from "../db/schema"
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
                followers: count(followers.followerId),
                description: users.description,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .leftJoin(followers, eq(users.id, followers.userId))
            .limit(15)
            .offset((Number(page) - 1) * 15)
            .orderBy(users.name)
            .where(like(users.name, search ? `%${search}%` : "%%"))
            .groupBy(users.id)

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
            .innerJoin(users, eq(users.id, posts.userId))
            .leftJoin(comments, eq(posts.id, comments.postId))
            .where(eq(users.id, Number(id)))
            .groupBy(posts.id)
            .orderBy(desc(posts.createdAt))

        return res.json(result)
    },
    async getUserById(req: Request, res: Response) {
        const { id } = req.params
        const { userId } = req.user

        const [result] = await db
            .select({
                id: users.id,
                name: users.name,
                atsign: users.atsign,
                followers: count(followers.id),
                postCount: count(posts.id),
                description: users.description,
                createdAt: users.createdAt,
            })
            .from(users)
            .leftJoin(posts, eq(users.id, posts.userId))
            .leftJoin(followers, eq(followers.followerId, users.id))
            .where(eq(users.id, Number(id)))
            .groupBy(users.id)

        if (!result) return res.sendStatus(404)

        // verifying if the authenticated user ID and from the requested user exist on the followers table
        let isFollowing: boolean = false
        const [followingResult] = await db
            .select()
            .from(followers)
            .where(
                and(
                    eq(followers.followerId, userId),
                    eq(followers.userId, result.id)
                )
            )
        if (followingResult) isFollowing = true

        return res.json({ ...result, isFollowing })
    },
    async getUserByAtsign(req: Request, res: Response) {
        const { atsign } = req.params
        const { userId } = req.user

        const [result] = await db
            .select({
                id: users.id,
                name: users.name,
                atsign: users.atsign,
                followers: count(followers.id),
                postCount: count(posts.id),
                description: users.description,
                createdAt: users.createdAt,
            })
            .from(users)
            .leftJoin(posts, eq(users.id, posts.userId))
            .leftJoin(followers, eq(followers.followerId, users.id))
            .where(eq(users.atsign, atsign))
            .groupBy(users.id)

        if (!result) return res.sendStatus(404)

        // verifying if the authenticated user ID and from the requested user exist on the followers table
        let isFollowing: boolean = false
        const [followingResult] = await db
            .select()
            .from(followers)
            .where(
                and(
                    eq(followers.followerId, userId),
                    eq(followers.userId, result.id)
                )
            )
        if (followingResult) isFollowing = true

        return res.json({ ...result, isFollowing })
    },
    async follow(req: Request, res: Response) {
        const { userId } = req.user
        const { id } = req.params

        await db.insert(followers).values({
            userId: Number(id),
            followerId: userId,
        })

        return res.sendStatus(201)
    },
    async unfollow(req: Request, res: Response) {
        const { userId } = req.user
        const { id } = req.params

        await db
            .delete(followers)
            .where(
                and(
                    eq(followers.userId, Number(id)),
                    eq(followers.followerId, userId)
                )
            )

        return res.sendStatus(204)
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
