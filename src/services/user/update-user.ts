import { hash } from "bcryptjs"
import { User } from "../../types/user"
import { eq } from "drizzle-orm"
import { db } from "../../db/connection"
import { users } from "../../db/schema"

interface UpdateUserParams {
    userId: number
    userData: Partial<User>
}

export async function updateUser({ userId, userData }: UpdateUserParams) {
    if (userData.password) {
        userData.password = await hash(userData.password, 10)
    } else {
        delete userData.password
    }

    await db
        .update(users)
        .set({
            ...userData,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
}
