import { eq } from "drizzle-orm"
import { db } from "../../db/connection"
import { refreshTokens } from "../../db/schema"

interface LogoutUserParams {
    userId: number
}

export async function logoutUser({ userId }: LogoutUserParams) {
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId))
}
