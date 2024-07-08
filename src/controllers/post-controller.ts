import { Request, Response } from "express"
import { and, desc, eq } from "drizzle-orm"
import { db } from "../db/connection"
import { users, posts, comments } from "../db/schema"
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

        const result = await db.query.posts.findFirst({
            columns: {
                id: true,
                post: true,
                likes: true,
                createdAt: true,
                updatedAt: true,
            },
            where: eq(posts.id, Number(id)),
            with: {
                user: {
                    columns: {
                        name: true,
                        atsign: true,
                    },
                },
                comments: {
                    columns: {
                        comment: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                    with: {
                        user: {
                            columns: {
                                atsign: true,
                            },
                        },
                    },
                },
            },
        })

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
        const { commentid: commentId, postid: postId } = req.params
        const { userId } = req.user
        const { comment } = req.body

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
        const { commentid: commentId, postid: postId } = req.params
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
