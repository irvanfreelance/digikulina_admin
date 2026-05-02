CREATE TABLE "payment_instructions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"payment_method_id" bigint NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"logo_url" varchar(255),
	"type" varchar(50) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"admin_fee_flat" bigint DEFAULT 0,
	"admin_fee_pct" numeric(5, 2) DEFAULT '0.00',
	"is_active" boolean DEFAULT true,
	"is_redirect" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "payment_instructions" ADD CONSTRAINT "payment_instructions_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE cascade ON UPDATE no action;