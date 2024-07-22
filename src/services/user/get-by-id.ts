import { sql, eq, and, count } from "drizzle-orm"
import { db } from "../../db/connection"
import { users, followers, posts } from "../../db/schema"
import { checkIsFollowing } from "../../helpers/check-is-following"

interface GetByIdParams {
    userId: number
    authUserId: number
}

export async function getById({ userId, authUserId }: GetByIdParams) {
    const [user] = await db
        .select({
            id: users.id,
            name: users.name,
            atsign: users.atsign,
            followers: sql<number>`
                    (SELECT COUNT(${followers.id}) 
                    FROM ${followers} 
                    WHERE ${followers.userId} = ${users.id})`,
            postCount: count(posts.id),
            description: users.description,
            createdAt: users.createdAt,
        })
        .from(users)
        .leftJoin(posts, eq(users.id, posts.userId))
        .where(eq(users.id, userId))
        .groupBy(users.id)

    if (!user) return null

    const isFollowing = await checkIsFollowing({
        authUserId,
        followedUserId: user.id,
    })

    return { ...user, isFollowing }
}
