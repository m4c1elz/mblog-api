import { sql, relations } from "drizzle-orm"
import {
    mysqlTable,
    int,
    varchar,
    datetime,
    primaryKey,
} from "drizzle-orm/mysql-core"
import { users } from "./users"
import { comments } from "./comments"

export const posts = mysqlTable(
    "posts",
    {
        id: int("id").autoincrement().notNull(),
        userId: int("user_id")
            .notNull()
            .references(() => users.id),
        post: varchar("post", { length: 255 }).notNull(),
        likes: int("likes").default(0),
        createdAt: datetime("created_at", { mode: "string" })
            .default(sql`(CURRENT_TIMESTAMP)`)
            .notNull(),
        updatedAt: datetime("updated_at", { mode: "string" }),
    },
    table => {
        return {
            postsId: primaryKey({ columns: [table.id], name: "posts_id" }),
        }
    }
)

export const postsRelations = relations(posts, ({ one, many }) => ({
    comments: many(comments),
    user: one(users, {
        fields: [posts.userId],
        references: [users.id],
    }),
}))
