ALTER TABLE `comments` DROP FOREIGN KEY `comments_user_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `posts` DROP FOREIGN KEY `posts_user_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `refresh_tokens` DROP FOREIGN KEY `refresh_tokens_user_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `posts` ADD CONSTRAINT `posts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;