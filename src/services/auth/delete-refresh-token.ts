import { eq } from "drizzle-orm"
import { db } from "../../db/connection"
import { refreshTokens } from "../../db/schema"

interface DeleteRefreshTokenParams {
    refreshToken: string
}

export async function deleteRefreshToken({
    refreshToken,
}: DeleteRefreshTokenParams) {
    await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken))
}
