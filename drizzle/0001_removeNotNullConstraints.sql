ALTER TABLE `comments` DROP FOREIGN KEY `fk_comments_postid`;
--> statement-breakpoint
ALTER TABLE `comments` DROP FOREIGN KEY `fk_comments_userid`;
--> statement-breakpoint
ALTER TABLE `posts` DROP FOREIGN KEY `fk_posts_userid`;
--> statement-breakpoint
ALTER TABLE `refresh_tokens` DROP FOREIGN KEY `fk_refreshtokens_userid`;
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `name` varchar(30);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `followers` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `atsign` varchar(12);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `description` text;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `posts` ADD CONSTRAINT `posts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;