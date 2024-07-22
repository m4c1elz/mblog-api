import { and, eq } from "drizzle-orm"
import { db } from "../../db/connection"
import { followers } from "../../db/schema"

interface UnfollowUserParams {
    id: number
    authUserId: number
}

export async function unfollowUser({ id, authUserId }: UnfollowUserParams) {
    await db
        .delete(followers)
        .where(
            and(eq(followers.userId, id), eq(followers.followerId, authUserId))
        )
}
