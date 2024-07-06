import { Request, Response } from "express"
import { desc, eq } from "drizzle-orm"
import { db } from "../db/connection"
import { users, posts } from "../db/schema"
import type { Post } from "../types/post"

export const postController = {
    async getPosts(req: Request, res: Response) {
        const result = await db
            .select({
                id: posts.id,
                name: users.name,
                atsign: users.atsign,
                post: posts.post,
                createdAt: posts.createdAt,
                updatedAt: posts.updatedAt,
            })
            .from(users)
            .innerJoin(posts, eq(users.id, posts.userId))
            .orderBy(desc(posts.createdAt))

        res.status(200).json(result)
    },
    async getPost(req: Request, res: Response) {
        const { id } = req.params

        const [result] = await db
            .select({
                id: posts.id,
                name: users.name,
                atsign: users.atsign,
                post: posts.post,
                likes: posts.likes,
                createdAt: posts.createdAt,
            })
            .from(users)
            .innerJoin(posts, eq(users.id, posts.userId))
            .where(eq(posts.id, Number(id)))

        return res.json(result)
    },
    async createPost(req: Request, res: Response) {
        const { userId } = req.user
        const { post }: Post = req.body

        await db.insert(posts).values({
            userId,
            post,
        })

        return res.sendStatus(201)
    },
    async updatePost(req: Request, res: Response) {
        const { id } = req.params
        const { post }: Post = req.body

        // checking if current user is the author of the post
        const { userId }: { userId: number } = req.user

        const postToCheck = await db.query.posts.findFirst({
            where: eq(posts.id, Number(id)),
        })

        if (!postToCheck) {
            return res.sendStatus(404)
        }

        if (postToCheck.userId !== userId) {
            return res.sendStatus(403)
        }

        // updating post
        await db
            .update(posts)
            .set({
                post,
                updatedAt: new Date().toLocaleDateString("en-ca"),
            })
            .where(eq(posts.id, Number(id)))

        return res.sendStatus(204)
    },
    async deletePost(req: Request, res: Response) {
        const { id: postId } = req.params
        const { userId }: { userId: number } = req.user

        const postToCheck = await db.query.posts.findFirst({
            where: eq(posts.id, Number(postId)),
        })

        if (!postToCheck) {
            return res.sendStatus(404)
        }

        if (postToCheck.userId !== userId) {
            return res.sendStatus(403)
        }

        await db.delete(posts).where(eq(posts.id, Number(postId)))

        return res.sendStatus(204)
    },
}
