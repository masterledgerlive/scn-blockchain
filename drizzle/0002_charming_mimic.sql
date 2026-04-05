CREATE TABLE `burn_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`burnId` varchar(64) NOT NULL,
	`cardId` int NOT NULL,
	`cardTokenId` varchar(64) NOT NULL,
	`burnerWalletId` int NOT NULL,
	`tearCodeSubmitted` varchar(32) NOT NULL,
	`txHash` varchar(128) NOT NULL,
	`blockNumber` bigint NOT NULL,
	`poolId` int,
	`poolAmountClaimed` decimal(18,6) DEFAULT '0.000000',
	`scarcityDividendPerCard` decimal(18,6) DEFAULT '0.000000',
	`seriesBeforeBurn` int,
	`seriesAfterBurn` int,
	`burnedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `burn_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `burn_events_burnId_unique` UNIQUE(`burnId`),
	CONSTRAINT `burn_events_txHash_unique` UNIQUE(`txHash`)
);
--> statement-breakpoint
CREATE TABLE `burn_pool_contributions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`poolId` int NOT NULL,
	`contributorWalletId` int NOT NULL,
	`amount` decimal(18,6) NOT NULL,
	`txHash` varchar(128) NOT NULL,
	`refunded` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `burn_pool_contributions_id` PRIMARY KEY(`id`),
	CONSTRAINT `burn_pool_contributions_txHash_unique` UNIQUE(`txHash`)
);
--> statement-breakpoint
CREATE TABLE `burn_pools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`poolId` varchar(64) NOT NULL,
	`cardId` int NOT NULL,
	`cardTokenId` varchar(64) NOT NULL,
	`status` enum('open','threshold_met','claimed','expired','cancelled') NOT NULL DEFAULT 'open',
	`totalContributed` decimal(18,6) NOT NULL DEFAULT '0.000000',
	`thresholdAmount` decimal(18,6) NOT NULL,
	`cardMarketValue` decimal(12,2) DEFAULT '0.00',
	`contributorCount` int NOT NULL DEFAULT 0,
	`burnTxHash` varchar(128),
	`claimedAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `burn_pools_id` PRIMARY KEY(`id`),
	CONSTRAINT `burn_pools_poolId_unique` UNIQUE(`poolId`)
);
--> statement-breakpoint
ALTER TABLE `scn_transactions` MODIFY COLUMN `txType` enum('mint','transfer','sale','slab_create','slab_open','verify','dao_deposit','dao_vote','governance','burn','burn_pool_contribute','burn_pool_claim') NOT NULL;--> statement-breakpoint
ALTER TABLE `cards` ADD `isBurned` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `cards` ADD `burnedAt` timestamp;--> statement-breakpoint
ALTER TABLE `cards` ADD `tearCode` varchar(32);--> statement-breakpoint
ALTER TABLE `cards` ADD `tearCodeRevealed` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `cards` ADD `seriesTotal` int;--> statement-breakpoint
ALTER TABLE `cards` ADD `seriesRemaining` int;--> statement-breakpoint
ALTER TABLE `cards` ADD CONSTRAINT `cards_tearCode_unique` UNIQUE(`tearCode`);