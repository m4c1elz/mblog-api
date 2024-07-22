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
    await db
        .update(users)
        .set({
            ...userData,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
}
