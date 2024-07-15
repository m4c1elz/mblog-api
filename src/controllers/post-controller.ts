import { Request, Response } from "express"
import { and, desc, eq, sql, count } from "drizzle-orm"
import { db } from "../db/connection"
import { users, posts, comments } from "../db/schema"
import type { Post } from "../types/post"
import type { Comment } from "../types/comment"
import { alias } from "drizzle-orm/mysql-core"

export const postController = {
    async getPosts(req: Request, res: Response) {
        const { page } = req.query

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
            .from(users)
            .innerJoin(posts, eq(users.id, posts.userId))
            .leftJoin(comments, eq(posts.id, comments.postId))
            .orderBy(desc(posts.createdAt))
            .groupBy(posts.id, posts.post)
            .limit(15)
            .offset((Number(page) - 1) * 15)

        res.status(200).json(result)
    },
    async getPost(req: Request, res: Response) {
        const { id } = req.params

        const postUser = alias(users, "u_post")
        const commentUser = alias(users, "u_comment")

        const [result] = await db
            .select({
                id: posts.id,
                username: postUser.name,
                atsign: postUser.atsign,
                post: posts.post,
                commentCount: count(comments.id),
                likes: posts.likes,
                createdAt: posts.createdAt,
                updatedAt: posts.updatedAt,
                comments: sql<object[]>`
                    IF (${count(comments.id)} > 0, 
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                "user", ${commentUser.atsign}, 
                                "comment", ${comments.comment}, 
                                "createdAt", ${comments.createdAt}, 
                                "updatedAt", ${comments.updatedAt}
                            )
                        ), 
                    JSON_ARRAY())`,
            })
            .from(posts)
            .innerJoin(postUser, eq(posts.userId, postUser.id))
            .leftJoin(comments, eq(comments.postId, posts.id))
            .leftJoin(commentUser, eq(comments.userId, commentUser.id))
            .where(eq(posts.id, Number(id)))
            .groupBy(posts.id)

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
    async likePost(req: Request, res: Response) {
        const { id } = req.params

        await db
            .update(posts)
            .set({
                likes: sql`${posts.likes} + 1`,
                updatedAt: new Date(),
            })
            .where(eq(posts.id, Number(id)))

        return res.sendStatus(201)
    },
    async createComment(req: Request, res: Response) {
        const { userId } = req.user
        const { id } = req.params
        const { comment } = req.body

        await db.insert(comments).values({
            userId,
            postId: Number(id),
            comment,
        })

        return res.sendStatus(201)
    },
    async updatePost(req: Request, res: Response) {
        const { id } = req.params
        const { post }: Post = req.body

        // checking if current user is the author of the post
        const { userId } = req.user

        const postToCheck = await db.query.posts.findFirst({
            where: eq(posts.id, Number(id)),
        })

        if (!postToCheck) return res.sendStatus(404)
        if (postToCheck.userId !== userId) return res.sendStatus(403)

        // updating post
        await db
            .update(posts)
            .set({
                post,
                updatedAt: new Date(),
            })
            .where(eq(posts.id, Number(id)))

        return res.sendStatus(204)
    },
    async updateComment(req: Request, res: Response) {
        const { comment_id: commentId, post_id: postId } = req.params
        const { userId } = req.user
        const { comment }: Comment = req.body

        const commentToEdit = await db.query.comments.findFirst({
            where: and(
                eq(comments.id, Number(commentId)),
                eq(comments.postId, Number(postId))
            ),
        })

        if (!commentToEdit) return res.sendStatus(404)
        if (commentToEdit.userId !== userId) return res.sendStatus(403)

        await db
            .update(comments)
            .set({
                comment,
                updatedAt: new Date(),
            })
            .where(eq(comments.id, Number(commentId)))

        return res.sendStatus(201)
    },
    async removeLike(req: Request, res: Response) {
        const { id } = req.params

        await db
            .update(posts)
            .set({
                likes: sql`${posts.likes} - 1`,
                updatedAt: new Date(),
            })
            .where(eq(posts.id, Number(id)))

        return res.sendStatus(201)
    },
    async deletePost(req: Request, res: Response) {
        const { id: postId } = req.params
        const { userId } = req.user

        const postToCheck = await db.query.posts.findFirst({
            where: eq(posts.id, Number(postId)),
        })

        if (!postToCheck) return res.sendStatus(404)
        if (postToCheck.userId !== userId) return res.sendStatus(403)

        await db.delete(posts).where(eq(posts.id, Number(postId)))

        return res.sendStatus(204)
    },
    async deleteComment(req: Request, res: Response) {
        const { comment_id: commentId, post_id: postId } = req.params
        const { userId } = req.user

        const comment = await db.query.comments.findFirst({
            where: and(
                eq(comments.id, Number(commentId)),
                eq(comments.postId, Number(postId))
            ),
        })

        if (!comment) return res.sendStatus(404)
        if (comment.userId !== userId) return res.sendStatus(403)

        await db.delete(comments).where(eq(comments.id, Number(commentId)))

        return res.sendStatus(204)
    },
}
