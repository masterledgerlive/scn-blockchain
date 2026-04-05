ALTER TABLE `dao_treasury` MODIFY COLUMN `milestoneLabel` varchar(256) DEFAULT 'Community Commons — No Prescribed Purpose';--> statement-breakpoint
ALTER TABLE `dao_treasury` ADD `genesisDate` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `dao_treasury` ADD `tier1Verified` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `dao_treasury` ADD `tier2Verified` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `dao_treasury` ADD `tier3Verified` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `dao_treasury` ADD `deploymentUnlocked` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `dao_treasury` ADD `clrAllocationPct` decimal(5,2) DEFAULT '0.00' NOT NULL;