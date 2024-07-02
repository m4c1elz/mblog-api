import { Request, Response } from "express"
import { eq } from "drizzle-orm"
import { db } from "../db/connection"
import { users, posts } from "../db/schema"

export const postController = {
    async getPosts(req: Request, res: Response) {
        const result = await db
            .select({
                id: posts.id,
                name: users.name,
                atsign: users.atsign,
                post: posts.post,
                createdAt: posts.createdAt,
            })
            .from(users)
            .innerJoin(posts, eq(users.id, posts.userId))

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
                createdAt: posts.createdAt,
            })
            .from(users)
            .innerJoin(posts, eq(users.id, posts.userId))
            .where(eq(posts.id, Number(id)))

        return res.json(result)
    },
    async createPost(req: Request, res: Response) {
        const { userId } = req.user
        const { post } = req.body

        await db.insert(posts).values([
            {
                userId,
                post,
            },
        ])

        return res.sendStatus(201)
    },
}
