CREATE TABLE `serverless-marketplace_account` (
	`userId` text(255) NOT NULL,
	`type` text(255) NOT NULL,
	`provider` text(255) NOT NULL,
	`providerAccountId` text(255) NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text(255),
	`scope` text(255),
	`id_token` text,
	`session_state` text(255),
	PRIMARY KEY(`provider`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `serverless-marketplace_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `account_user_id_idx` ON `serverless-marketplace_account` (`userId`);--> statement-breakpoint
CREATE TABLE `serverless-marketplace_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()),
	`updatedAt` integer,
	`deletedAt` integer,
	`name` text(256) NOT NULL,
	`description` text,
	`slug` text(256) NOT NULL,
	`parentId` integer
);
--> statement-breakpoint
CREATE TABLE `serverless-marketplace_product_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()),
	`updatedAt` integer,
	`deletedAt` integer,
	`productId` integer,
	`imageUrl` text(256) NOT NULL,
	`rank` integer NOT NULL,
	FOREIGN KEY (`productId`) REFERENCES `serverless-marketplace_products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `serverless-marketplace_prices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()),
	`updatedAt` integer,
	`deletedAt` integer,
	`variantId` integer,
	`amount` integer NOT NULL,
	`currencyCode` text(256) NOT NULL,
	`rules` text,
	`type` text NOT NULL,
	FOREIGN KEY (`variantId`) REFERENCES `serverless-marketplace_product_variants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `serverless-marketplace_product_categories` (
	`productId` integer,
	`categoryId` integer,
	PRIMARY KEY(`productId`, `categoryId`),
	FOREIGN KEY (`productId`) REFERENCES `serverless-marketplace_products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`categoryId`) REFERENCES `serverless-marketplace_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `serverless-marketplace_product_materials` (
	`productId` integer NOT NULL,
	`materialId` integer NOT NULL,
	PRIMARY KEY(`productId`, `materialId`),
	FOREIGN KEY (`productId`) REFERENCES `serverless-marketplace_products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`materialId`) REFERENCES `serverless-marketplace_materials`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `serverless-marketplace_materials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()),
	`updatedAt` integer,
	`deletedAt` integer,
	`value` text(256) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `serverless-marketplace_materials_value_unique` ON `serverless-marketplace_materials` (`value`);--> statement-breakpoint
CREATE TABLE `serverless-marketplace_product_option_values` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`productOptionId` integer NOT NULL,
	`value` text(256) NOT NULL,
	FOREIGN KEY (`productOptionId`) REFERENCES `serverless-marketplace_product_options`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `serverless-marketplace_product_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()),
	`updatedAt` integer,
	`deletedAt` integer,
	`productId` integer,
	`name` text(256) NOT NULL,
	FOREIGN KEY (`productId`) REFERENCES `serverless-marketplace_products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `serverless-marketplace_product_tags` (
	`productId` integer NOT NULL,
	`tagId` integer NOT NULL,
	PRIMARY KEY(`productId`, `tagId`),
	FOREIGN KEY (`productId`) REFERENCES `serverless-marketplace_products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tagId`) REFERENCES `serverless-marketplace_tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `serverless-marketplace_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()),
	`updatedAt` integer,
	`deletedAt` integer,
	`value` text(256) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `serverless-marketplace_tags_value_unique` ON `serverless-marketplace_tags` (`value`);--> statement-breakpoint
CREATE TABLE `serverless-marketplace_product_variant_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()),
	`updatedAt` integer,
	`deletedAt` integer,
	`productVariantId` integer,
	`productOptionValueId` integer,
	FOREIGN KEY (`productVariantId`) REFERENCES `serverless-marketplace_product_variants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`productOptionValueId`) REFERENCES `serverless-marketplace_product_option_values`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `serverless-marketplace_product_variants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()),
	`updatedAt` integer,
	`deletedAt` integer,
	`productId` integer,
	`title` text(256) NOT NULL,
	`description` text,
	`sku` text(256),
	`quantity` integer DEFAULT 0 NOT NULL,
	`manageStock` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`productId`) REFERENCES `serverless-marketplace_products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `serverless-marketplace_products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()),
	`updatedAt` integer,
	`deletedAt` integer,
	`status` text DEFAULT 'draft' NOT NULL,
	`rejectionReason` text,
	`rejectedAt` integer,
	`title` text(256) NOT NULL,
	`subtitle` text(256),
	`description` text,
	`slug` text(256) NOT NULL,
	`weight` integer,
	`width` integer,
	`height` integer,
	`depth` integer,
	`metadata` text,
	`originCountry` text(256)
);
--> statement-breakpoint
CREATE TABLE `serverless-marketplace_session` (
	`sessionToken` text(255) PRIMARY KEY NOT NULL,
	`userId` text(255) NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `serverless-marketplace_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `serverless-marketplace_session` (`userId`);--> statement-breakpoint
CREATE TABLE `serverless-marketplace_shipping_option_prices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()),
	`updatedAt` integer,
	`deletedAt` integer,
	`shippingOptionId` integer,
	`amount` integer NOT NULL,
	`currencyCode` text(256) NOT NULL,
	`rules` text,
	FOREIGN KEY (`shippingOptionId`) REFERENCES `serverless-marketplace_shipping_options`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `serverless-marketplace_shipping_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()),
	`updatedAt` integer,
	`deletedAt` integer,
	`isShippingProfile` integer NOT NULL,
	`name` text(256) NOT NULL,
	`postalCode` text(20),
	`countryCode` text(2)
);
--> statement-breakpoint
CREATE TABLE `serverless-marketplace_user` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`name` text(255),
	`email` text(255) NOT NULL,
	`emailVerified` integer DEFAULT (unixepoch()),
	`image` text(255)
);
--> statement-breakpoint
CREATE TABLE `serverless-marketplace_verification_token` (
	`identifier` text(255) NOT NULL,
	`token` text(255) NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
