import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { UserPayload } from "../types/user-payload"

export function validateToken(req: Request, res: Response, next: NextFunction) {
    const authHeaders = req.headers.authorization
    const token = authHeaders && authHeaders.split(" ")[1]

    if (!token) {
        return res.sendStatus(401)
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error(err.message)
            return res.sendStatus(403)
        }
        req.user = decoded as UserPayload
        next()
    })
}
