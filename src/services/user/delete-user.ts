import { eq } from "drizzle-orm"
import { db } from "../../db/connection"
import { users } from "../../db/schema"

interface DeleteUserParams {
    id: number
}

export async function deleteUser({ id }: DeleteUserParams) {
    await db.delete(users).where(eq(users.id, id))
}
