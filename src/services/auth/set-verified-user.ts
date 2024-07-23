import { eq } from "drizzle-orm"
import { db } from "../../db/connection"
import { users } from "../../db/schema"

interface SetVerifiedUserParams {
    userId: number
}

export async function setVerifiedUser({ userId }: SetVerifiedUserParams) {
    await db
        .update(users)
        .set({
            isVerified: 1,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
}
