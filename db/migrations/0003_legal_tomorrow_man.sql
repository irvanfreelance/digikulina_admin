ALTER TABLE "payment_instructions" ALTER COLUMN "title" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_instructions" ALTER COLUMN "content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_methods" ALTER COLUMN "provider" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_instructions" ADD COLUMN "step_number" integer;--> statement-breakpoint
ALTER TABLE "payment_instructions" ADD COLUMN "instruction_text" text;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "brand_id" bigint;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "vendor" varchar(50);--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "fee_flat" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "fee_percentage" numeric(5, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "is_publish" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;