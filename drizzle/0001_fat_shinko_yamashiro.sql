PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_serverless-marketplace_prices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()),
	`updatedAt` integer,
	`deletedAt` integer,
	`variantId` integer NOT NULL,
	`amount` integer NOT NULL,
	`currencyCode` text(256) NOT NULL,
	`rules` text,
	`type` text NOT NULL,
	FOREIGN KEY (`variantId`) REFERENCES `serverless-marketplace_product_variants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_serverless-marketplace_prices`("id", "createdAt", "updatedAt", "deletedAt", "variantId", "amount", "currencyCode", "rules", "type") SELECT "id", "createdAt", "updatedAt", "deletedAt", "variantId", "amount", "currencyCode", "rules", "type" FROM `serverless-marketplace_prices`;--> statement-breakpoint
DROP TABLE `serverless-marketplace_prices`;--> statement-breakpoint
ALTER TABLE `__new_serverless-marketplace_prices` RENAME TO `serverless-marketplace_prices`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_serverless-marketplace_product_categories` (
	`productId` integer NOT NULL,
	`categoryId` integer NOT NULL,
	PRIMARY KEY(`productId`, `categoryId`),
	FOREIGN KEY (`productId`) REFERENCES `serverless-marketplace_products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`categoryId`) REFERENCES `serverless-marketplace_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_serverless-marketplace_product_categories`("productId", "categoryId") SELECT "productId", "categoryId" FROM `serverless-marketplace_product_categories`;--> statement-breakpoint
DROP TABLE `serverless-marketplace_product_categories`;--> statement-breakpoint
ALTER TABLE `__new_serverless-marketplace_product_categories` RENAME TO `serverless-marketplace_product_categories`;--> statement-breakpoint
CREATE TABLE `__new_serverless-marketplace_product_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()),
	`updatedAt` integer,
	`deletedAt` integer,
	`productId` integer NOT NULL,
	`name` text(256) NOT NULL,
	FOREIGN KEY (`productId`) REFERENCES `serverless-marketplace_products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_serverless-marketplace_product_options`("id", "createdAt", "updatedAt", "deletedAt", "productId", "name") SELECT "id", "createdAt", "updatedAt", "deletedAt", "productId", "name" FROM `serverless-marketplace_product_options`;--> statement-breakpoint
DROP TABLE `serverless-marketplace_product_options`;--> statement-breakpoint
ALTER TABLE `__new_serverless-marketplace_product_options` RENAME TO `serverless-marketplace_product_options`;--> statement-breakpoint
CREATE TABLE `__new_serverless-marketplace_product_variant_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()),
	`updatedAt` integer,
	`deletedAt` integer,
	`productVariantId` integer NOT NULL,
	`productOptionValueId` integer NOT NULL,
	FOREIGN KEY (`productVariantId`) REFERENCES `serverless-marketplace_product_variants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`productOptionValueId`) REFERENCES `serverless-marketplace_product_option_values`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_serverless-marketplace_product_variant_options`("id", "createdAt", "updatedAt", "deletedAt", "productVariantId", "productOptionValueId") SELECT "id", "createdAt", "updatedAt", "deletedAt", "productVariantId", "productOptionValueId" FROM `serverless-marketplace_product_variant_options`;--> statement-breakpoint
DROP TABLE `serverless-marketplace_product_variant_options`;--> statement-breakpoint
ALTER TABLE `__new_serverless-marketplace_product_variant_options` RENAME TO `serverless-marketplace_product_variant_options`;--> statement-breakpoint
CREATE TABLE `__new_serverless-marketplace_product_variants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()),
	`updatedAt` integer,
	`deletedAt` integer,
	`productId` integer NOT NULL,
	`title` text(256) NOT NULL,
	`description` text,
	`sku` text(256),
	`quantity` integer DEFAULT 0 NOT NULL,
	`manageStock` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`productId`) REFERENCES `serverless-marketplace_products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_serverless-marketplace_product_variants`("id", "createdAt", "updatedAt", "deletedAt", "productId", "title", "description", "sku", "quantity", "manageStock") SELECT "id", "createdAt", "updatedAt", "deletedAt", "productId", "title", "description", "sku", "quantity", "manageStock" FROM `serverless-marketplace_product_variants`;--> statement-breakpoint
DROP TABLE `serverless-marketplace_product_variants`;--> statement-breakpoint
ALTER TABLE `__new_serverless-marketplace_product_variants` RENAME TO `serverless-marketplace_product_variants`;--> statement-breakpoint
CREATE TABLE `__new_serverless-marketplace_shipping_option_prices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()),
	`updatedAt` integer,
	`deletedAt` integer,
	`shippingOptionId` integer NOT NULL,
	`amount` integer NOT NULL,
	`currencyCode` text(256) NOT NULL,
	`rules` text,
	FOREIGN KEY (`shippingOptionId`) REFERENCES `serverless-marketplace_shipping_options`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_serverless-marketplace_shipping_option_prices`("id", "createdAt", "updatedAt", "deletedAt", "shippingOptionId", "amount", "currencyCode", "rules") SELECT "id", "createdAt", "updatedAt", "deletedAt", "shippingOptionId", "amount", "currencyCode", "rules" FROM `serverless-marketplace_shipping_option_prices`;--> statement-breakpoint
DROP TABLE `serverless-marketplace_shipping_option_prices`;--> statement-breakpoint
ALTER TABLE `__new_serverless-marketplace_shipping_option_prices` RENAME TO `serverless-marketplace_shipping_option_prices`;--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique_where_not_deleted` ON `serverless-marketplace_products` (`slug`) WHERE "serverless-marketplace_products"."deletedAt" is null;