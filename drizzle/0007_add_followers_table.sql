CREATE TABLE `followers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`follower_id` int NOT NULL,
	`created_at` date DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` date,
	CONSTRAINT `followers_id` PRIMARY KEY(`id`),
	CONSTRAINT `followers_unique` UNIQUE(`user_id`,`follower_id`)
);
--> statement-breakpoint
ALTER TABLE `followers` ADD CONSTRAINT `followers_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `followers` ADD CONSTRAINT `followers_follower_id_users_id_fk` FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;