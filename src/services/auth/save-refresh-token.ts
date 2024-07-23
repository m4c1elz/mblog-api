import { db } from "../../db/connection"
import { refreshTokens } from "../../db/schema"

interface SaveRefreshTokenParams {
    userId: number
    token: string
}

export async function saveRefreshToken({
    userId,
    token,
}: SaveRefreshTokenParams) {
    const today = new Date()
    const expireDate = new Date(today)
    expireDate.setDate(today.getDate() + 7)

    await db.insert(refreshTokens).values({
        userId,
        token,
        expiresIn: expireDate,
    })
}
