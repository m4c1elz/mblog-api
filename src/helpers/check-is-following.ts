import { and, eq } from "drizzle-orm"
import { db } from "../db/connection"
import { followers } from "../db/schema"

export async function checkIsFollowing({
    authUserId,
    followedUserId,
}: {
    authUserId: number
    followedUserId: number
}) {
    const [followingResult] = await db
        .select()
        .from(followers)
        .where(
            and(
                eq(followers.followerId, authUserId),
                eq(followers.userId, followedUserId)
            )
        )

    if (followingResult) return true
    else return false
}
