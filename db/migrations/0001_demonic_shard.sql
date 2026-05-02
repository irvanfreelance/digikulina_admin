DROP TABLE "payment_instructions" CASCADE;--> statement-breakpoint
DROP TABLE "payment_methods" CASCADE;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "vendor_payment_id" varchar(255);