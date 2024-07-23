import { eq } from "drizzle-orm"
import { db } from "../../db/connection"
import { users } from "../../db/schema"

interface FindUserByEmailParams {
    email: string
}

export async function findUserByEmail({ email }: FindUserByEmailParams) {
    const user = await db.query.users.findFirst({
        where: eq(users.email, email),
    })

    return user
}
