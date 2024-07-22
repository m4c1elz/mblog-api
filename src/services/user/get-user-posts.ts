import { eq, desc, count } from "drizzle-orm"
import { db } from "../../db/connection"
import { posts, users, comments } from "../../db/schema"

interface GetUserPostsParams {
    userId: number
}

export async function getUserPosts({ userId }: GetUserPostsParams) {
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
        .where(eq(users.id, userId))
        .groupBy(posts.id)
        .orderBy(desc(posts.createdAt))

    return result
}
