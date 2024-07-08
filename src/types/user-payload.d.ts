import { JwtPayload } from "jsonwebtoken"

interface UserPayload extends JwtPayload {
    userId: number
}
