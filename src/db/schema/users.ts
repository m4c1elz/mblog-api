import {
    mysqlTable,
    primaryKey,
    int,
    varchar,
    datetime,
    text,
    unique,
    tinyint,
} from "drizzle-orm/mysql-core"
import { sql, relations } from "drizzle-orm"
import { comments } from "./comments"
import { posts } from "./posts"
import { refreshTokens } from "./refresh-tokens"

export const users = mysqlTable(
    "users",
    {
        id: int("id").autoincrement().notNull(),
        email: varchar("email", { length: 80 }).unique().notNull(),
        password: varchar("password", { length: 72 }).notNull(),
        name: varchar("name", { length: 30 }),
        followers: int("followers").default(0).notNull(),
        atsign: varchar("atsign", { length: 12 }).unique(),
        description: text("description"),
        createdAt: datetime("created_at", { mode: "string" })
            .default(sql`(CURRENT_TIMESTAMP)`)
            .notNull(),
        updatedAt: datetime("updated_at", { mode: "string" }),
        isVerified: tinyint("is_verified").default(0).notNull(),
    },
    table => {
        return {
            usersId: primaryKey({ columns: [table.id], name: "users_id" }),
            atsign: unique("atsign").on(table.atsign),
        }
    }
)

export const usersRelations = relations(users, ({ many }) => ({
    comments: many(comments),
    posts: many(posts),
    refreshTokens: many(refreshTokens),
}))
