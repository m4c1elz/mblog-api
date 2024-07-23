import { hash } from "bcryptjs"
import { db } from "../../db/connection"
import { users } from "../../db/schema"

interface RegisterUserParams {
    email: string
    password: string
    atsign: string
}

export async function registerUser({
    email,
    password,
    atsign,
}: RegisterUserParams) {
    const [newUser] = await db.insert(users).values({
        email,
        password: await hash(password, 10),
        name: atsign,
        atsign,
        isVerified: 0,
    })

    return newUser
}
