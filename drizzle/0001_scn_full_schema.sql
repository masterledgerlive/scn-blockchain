CREATE TABLE `wallets` (
`id` int AUTO_INCREMENT NOT NULL,
`userId` int NOT NULL,
`address` varchar(64) NOT NULL,
`publicKey` text NOT NULL,
`sbtTokenId` varchar(64),
`trustScore` int NOT NULL DEFAULT 0,
`trustTier` enum('newcomer','verified','certified_shop','master_trader','verified_player') NOT NULL DEFAULT 'newcomer',
`stainCount` int NOT NULL DEFAULT 0,
`web2Links` json,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `wallets_id` PRIMARY KEY(`id`),
CONSTRAINT `wallets_address_unique` UNIQUE(`address`),
CONSTRAINT `wallets_sbtTokenId_unique` UNIQUE(`sbtTokenId`)
);
--> statement-breakpoint
CREATE TABLE `cards` (
`id` int AUTO_INCREMENT NOT NULL,
`tokenId` varchar(64) NOT NULL,
`mintedBy` int NOT NULL,
`ownerWalletId` int NOT NULL,
`athleteName` varchar(128) NOT NULL,
`sport` varchar(64) NOT NULL,
`cardYear` int NOT NULL,
`series` varchar(128),
`cardNumber` varchar(32),
`edition` enum('base','rare','ultra_rare','legendary','1_of_1') NOT NULL DEFAULT 'base',
`imageUrl` text,
`aiScrubbed` boolean NOT NULL DEFAULT false,
`nilOnly` boolean NOT NULL DEFAULT true,
`pufHash` varchar(128),
`pufFiberPattern` text,
`verificationStatus` enum('unverified','pending','verified','disputed') NOT NULL DEFAULT 'unverified',
`gradeScore` decimal(4,1),
`marketValue` decimal(12,2) DEFAULT '0.00',
`isInSlab` boolean NOT NULL DEFAULT false,
`isListed` boolean NOT NULL DEFAULT false,
`metadata` json,
`mintedAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `cards_id` PRIMARY KEY(`id`),
CONSTRAINT `cards_tokenId_unique` UNIQUE(`tokenId`),
CONSTRAINT `cards_pufHash_unique` UNIQUE(`pufHash`)
);
--> statement-breakpoint
CREATE TABLE `slabs` (
`id` int AUTO_INCREMENT NOT NULL,
`slabId` varchar(64) NOT NULL,
`creatorWalletId` int NOT NULL,
`ownerWalletId` int NOT NULL,
`slabType` enum('single','mystery_pack','set') NOT NULL DEFAULT 'single',
`status` enum('sealed','opened','listed','sold') NOT NULL DEFAULT 'sealed',
`totalCards` int NOT NULL DEFAULT 0,
`isMysterySlab` boolean NOT NULL DEFAULT false,
`onChainOdds` json,
`remainingInventory` json,
`faradayShielded` boolean NOT NULL DEFAULT false,
`posaActivated` boolean NOT NULL DEFAULT false,
`posaCode` varchar(64),
`cryptoLiquidity` decimal(12,2) DEFAULT '0.00',
`marketValue` decimal(12,2) DEFAULT '0.00',
`isListed` boolean NOT NULL DEFAULT false,
`breadcrumbHash` varchar(128),
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `slabs_id` PRIMARY KEY(`id`),
CONSTRAINT `slabs_slabId_unique` UNIQUE(`slabId`),
CONSTRAINT `slabs_posaCode_unique` UNIQUE(`posaCode`)
);
--> statement-breakpoint
CREATE TABLE `slab_cards` (
`id` int AUTO_INCREMENT NOT NULL,
`slabId` int NOT NULL,
`cardId` int NOT NULL,
`position` int DEFAULT 0,
`addedAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `slab_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `custody_records` (
`id` int AUTO_INCREMENT NOT NULL,
`txHash` varchar(128) NOT NULL,
`assetType` enum('card','slab') NOT NULL,
`assetId` int NOT NULL,
`fromWalletId` int,
`toWalletId` int NOT NULL,
`transferType` enum('mint','sale','transfer','slab_seal','slab_open','verification') NOT NULL,
`price` decimal(12,2),
`blockNumber` bigint NOT NULL,
`gasUsed` decimal(12,6) DEFAULT '0.000021',
`daoFee` decimal(12,6) DEFAULT '0.000001',
`notes` text,
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `custody_records_id` PRIMARY KEY(`id`),
CONSTRAINT `custody_records_txHash_unique` UNIQUE(`txHash`)
);
--> statement-breakpoint
CREATE TABLE `marketplace_listings` (
`id` int AUTO_INCREMENT NOT NULL,
`listingId` varchar(64) NOT NULL,
`sellerWalletId` int NOT NULL,
`buyerWalletId` int,
`assetType` enum('card','slab') NOT NULL,
`assetId` int NOT NULL,
`askPrice` decimal(12,2) NOT NULL,
`finalPrice` decimal(12,2),
`currency` varchar(16) NOT NULL DEFAULT 'SCN',
`status` enum('active','sold','cancelled','expired') NOT NULL DEFAULT 'active',
`description` text,
`expiresAt` timestamp,
`soldAt` timestamp,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `marketplace_listings_id` PRIMARY KEY(`id`),
CONSTRAINT `marketplace_listings_listingId_unique` UNIQUE(`listingId`)
);
--> statement-breakpoint
CREATE TABLE `dao_treasury` (
`id` int AUTO_INCREMENT NOT NULL,
`totalAccumulated` decimal(18,6) NOT NULL DEFAULT '0.000000',
`totalDeployed` decimal(18,6) NOT NULL DEFAULT '0.000000',
`currentBalance` decimal(18,6) NOT NULL DEFAULT '0.000000',
`totalTransactions` bigint NOT NULL DEFAULT 0,
`targetMilestone` decimal(18,2) DEFAULT '1000000000.00',
`milestoneLabel` varchar(256) DEFAULT 'MLB Licensing Rights Acquisition',
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `dao_treasury_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `governance_proposals` (
`id` int AUTO_INCREMENT NOT NULL,
`proposalId` varchar(64) NOT NULL,
`proposerWalletId` int NOT NULL,
`title` varchar(256) NOT NULL,
`description` text NOT NULL,
`category` enum('treasury_deployment','protocol_upgrade','licensing_bid','community_fund','rule_change') NOT NULL,
`requestedAmount` decimal(18,2),
`status` enum('active','passed','rejected','executed','cancelled') NOT NULL DEFAULT 'active',
`votesFor` int NOT NULL DEFAULT 0,
`votesAgainst` int NOT NULL DEFAULT 0,
`quorumRequired` int NOT NULL DEFAULT 100,
`votingEndsAt` timestamp NOT NULL,
`executedAt` timestamp,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `governance_proposals_id` PRIMARY KEY(`id`),
CONSTRAINT `governance_proposals_proposalId_unique` UNIQUE(`proposalId`)
);
--> statement-breakpoint
CREATE TABLE `proposal_votes` (
`id` int AUTO_INCREMENT NOT NULL,
`proposalId` int NOT NULL,
`voterWalletId` int NOT NULL,
`vote` enum('for','against','abstain') NOT NULL,
`votingPower` int NOT NULL DEFAULT 1,
`reason` text,
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `proposal_votes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scn_transactions` (
`id` int AUTO_INCREMENT NOT NULL,
`txHash` varchar(128) NOT NULL,
`blockNumber` bigint NOT NULL,
`txType` enum('mint','transfer','sale','slab_create','slab_open','verify','dao_deposit','dao_vote','governance') NOT NULL,
`fromAddress` varchar(64),
`toAddress` varchar(64),
`value` decimal(12,6) DEFAULT '0.000000',
`gasUsed` decimal(12,6) DEFAULT '0.000021',
`status` enum('confirmed','pending','failed') NOT NULL DEFAULT 'confirmed',
`metadata` json,
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `scn_transactions_id` PRIMARY KEY(`id`),
CONSTRAINT `scn_transactions_txHash_unique` UNIQUE(`txHash`)
);
