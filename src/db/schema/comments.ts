import { relations, sql } from "drizzle-orm"
import {
    mysqlTable,
    int,
    varchar,
    datetime,
    primaryKey,
} from "drizzle-orm/mysql-core"
import { posts } from "./posts"
import { users } from "./users"

export const comments = mysqlTable(
    "comments",
    {
        id: int("id").autoincrement().notNull(),
        postId: int("post_id")
            .notNull()
            .references(() => posts.id),
        userId: int("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        comment: varchar("comment", { length: 255 }).notNull(),
        createdAt: datetime("created_at", { mode: "string" })
            .default(sql`(CURRENT_TIMESTAMP)`)
            .notNull(),
        updatedAt: datetime("updated_at", { mode: "string" }),
    },
    table => {
        return {
            commentsId: primaryKey({
                columns: [table.id],
                name: "comments_id",
            }),
        }
    }
)

export const commentsRelations = relations(comments, ({ one }) => ({
    post: one(posts, {
        fields: [comments.postId],
        references: [posts.id],
    }),
    user: one(users, {
        fields: [comments.userId],
        references: [users.id],
    }),
}))
