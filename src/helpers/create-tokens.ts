import jwt from "jsonwebtoken"

export function createTokens(data: { userId: number }) {
    const accessToken = jwt.sign(data, process.env.JWT_SECRET, {
        expiresIn: "5m",
    })

    const refreshToken = jwt.sign(data, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    })
    return { accessToken, refreshToken }
}
