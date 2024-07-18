import {
    date,
    int,
    mysqlTable,
    primaryKey,
    unique,
} from "drizzle-orm/mysql-core"
import { users } from "./users"
import { relations, sql } from "drizzle-orm"

// Definindo a tabela "followers"
export const followers = mysqlTable(
    "followers",
    {
        id: int("id").primaryKey().autoincrement(),
        userId: int("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        followerId: int("follower_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        createdAt: date("created_at", { mode: "date" }).default(
            sql`(CURRENT_TIMESTAMP)`
        ),
        updatedAt: date("updated_at", { mode: "date" }),
    },
    table => {
        return {
            primaryKey: primaryKey({
                columns: [table.id],
                name: "followers_pk",
            }),
            followersUnique: unique("followers_unique").on(
                table.userId,
                table.followerId
            ),
        }
    }
)

export const followersRelations = relations(followers, ({ many }) => ({
    user: many(users),
    follower: many(users),
}))
