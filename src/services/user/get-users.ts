import { count } from "console"
import { eq, like, sql } from "drizzle-orm"
import { db } from "../../db/connection"
import { users, followers } from "../../db/schema"

export async function getUsers({
    page,
    search,
}: {
    page: number
    search?: string
}) {
    const result = await db
        .select({
            id: users.id,
            name: users.name,
            atsign: users.atsign,
            email: users.email,
            followers: sql<number>`count(${followers.followerId})`,
            description: users.description,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
        })
        .from(users)
        .leftJoin(followers, eq(users.id, followers.userId))
        .limit(15)
        .offset((Number(page) - 1) * 15)
        .orderBy(users.name)
        .where(like(users.name, search ? `%${search}%` : "%%"))
        .groupBy(users.id)

    return result
}
