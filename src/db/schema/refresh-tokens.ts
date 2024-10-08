import {
    mysqlTable,
    int,
    datetime,
    primaryKey,
    text,
} from "drizzle-orm/mysql-core"
import { users } from "./users"

export const refreshTokens = mysqlTable(
    "refresh_tokens",
    {
        id: int("id").autoincrement().notNull(),
        userId: int("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        token: text("token").notNull(),
        expiresIn: datetime("expires_in", { mode: "date" }).notNull(),
    },
    table => {
        return {
            refreshTokensId: primaryKey({
                columns: [table.id],
                name: "refresh_tokens_id",
            }),
        }
    }
)
