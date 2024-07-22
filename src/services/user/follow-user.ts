import { db } from "../../db/connection"
import { followers } from "../../db/schema"

interface FollowUserParams {
    id: number
    authUserId: number
}

export async function followUser({ id, authUserId }: FollowUserParams) {
    await db.insert(followers).values({
        userId: id,
        followerId: authUserId,
    })
}
