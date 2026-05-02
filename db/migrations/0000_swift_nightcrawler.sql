CREATE TABLE "branch_modifier_options" (
	"branch_id" bigint NOT NULL,
	"modifier_option_id" bigint NOT NULL,
	"is_available" boolean DEFAULT true,
	"price_override" numeric(10, 2),
	"track_stock" boolean DEFAULT false,
	"stock_quantity" integer DEFAULT 0,
	CONSTRAINT "branch_modifier_options_branch_id_modifier_option_id_pk" PRIMARY KEY("branch_id","modifier_option_id")
);
--> statement-breakpoint
CREATE TABLE "branch_products" (
	"branch_id" bigint NOT NULL,
	"product_id" bigint NOT NULL,
	"is_available" boolean DEFAULT true,
	"price_override" numeric(10, 2),
	"track_stock" boolean DEFAULT false,
	"stock_quantity" integer DEFAULT 0,
	CONSTRAINT "branch_products_branch_id_product_id_pk" PRIMARY KEY("branch_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"brand_id" bigint NOT NULL,
	"name" varchar(100) NOT NULL,
	"address" text,
	"open_hours" varchar(50),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"tagline" varchar(150),
	"brand_color" varchar(20) DEFAULT 'amber',
	"logo_url" text,
	"whatsapp_contact" varchar(50),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cashier_shifts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"branch_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"opening_time" timestamp with time zone DEFAULT now() NOT NULL,
	"closing_time" timestamp with time zone,
	"opening_balance" numeric(10, 2) DEFAULT '0' NOT NULL,
	"expected_closing_balance" numeric(10, 2),
	"actual_closing_balance" numeric(10, 2),
	"difference_amount" numeric(10, 2),
	"status" varchar(20) DEFAULT 'open',
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"brand_id" bigint NOT NULL,
	"name" varchar(50) NOT NULL,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"brand_id" bigint NOT NULL,
	"code" varchar(50) NOT NULL,
	"discount_type" varchar(20) NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"max_discount_amount" numeric(10, 2),
	"min_purchase_amount" numeric(10, 2) DEFAULT '0',
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"quota_limit" integer,
	"used_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "coupons_brand_id_code_unique" UNIQUE("brand_id","code")
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"brand_id" bigint NOT NULL,
	"name" varchar(100) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(100),
	"total_orders" integer DEFAULT 0,
	"total_spent" numeric(10, 2) DEFAULT '0',
	"last_order_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "customers_brand_id_phone_unique" UNIQUE("brand_id","phone")
);
--> statement-breakpoint
CREATE TABLE "kds_stations" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"branch_id" bigint NOT NULL,
	"name" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modifier_groups" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"product_id" bigint NOT NULL,
	"name" varchar(50) NOT NULL,
	"is_required" boolean DEFAULT false,
	"selection_type" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modifier_options" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"modifier_group_id" bigint NOT NULL,
	"name" varchar(50) NOT NULL,
	"extra_price" numeric(10, 2) DEFAULT '0',
	"is_default" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "notif_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"order_id" bigint NOT NULL,
	"order_created_at" timestamp with time zone NOT NULL,
	"channel" varchar(20) NOT NULL,
	"destination" varchar(100) NOT NULL,
	"request_payload" jsonb,
	"response_payload" jsonb,
	"status" varchar(20),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notif_templates" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"brand_id" bigint NOT NULL,
	"trigger_event" varchar(50) NOT NULL,
	"channel" varchar(20) NOT NULL,
	"template_text" text NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "order_item_modifiers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"order_item_id" bigint NOT NULL,
	"modifier_option_id" bigint,
	"modifier_name" varchar(50) NOT NULL,
	"modifier_price" numeric(10, 2) DEFAULT '0'
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"order_id" bigint NOT NULL,
	"order_created_at" timestamp with time zone NOT NULL,
	"product_id" bigint,
	"quantity" integer DEFAULT 1 NOT NULL,
	"base_price" numeric(10, 2) NOT NULL,
	"final_price" numeric(10, 2) NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "order_reviews" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"order_id" bigint NOT NULL,
	"order_created_at" timestamp with time zone NOT NULL,
	"branch_id" bigint NOT NULL,
	"customer_id" bigint,
	"rating" integer NOT NULL,
	"review_text" text,
	"is_published" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_status_histories" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"order_id" bigint NOT NULL,
	"order_created_at" timestamp with time zone NOT NULL,
	"status" varchar(20) NOT NULL,
	"user_id" bigint,
	"changed_by" varchar(50),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"branch_id" bigint NOT NULL,
	"customer_id" bigint,
	"served_by_user_id" bigint,
	"order_number" varchar(30) NOT NULL,
	"order_type" varchar(20) NOT NULL,
	"order_source" varchar(20) NOT NULL,
	"table_id" bigint,
	"reservation_id" bigint,
	"queue_number" varchar(20),
	"customer_name" varchar(100) NOT NULL,
	"customer_phone" varchar(20),
	"delivery_address" text,
	"subtotal" numeric(10, 2) NOT NULL,
	"coupon_id" bigint,
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"tax_fee" numeric(10, 2) DEFAULT '0',
	"dp_amount" numeric(10, 2) DEFAULT '0',
	"total_amount" numeric(10, 2) NOT NULL,
	"payment_method_id" bigint,
	"payment_status" varchar(20) DEFAULT 'unpaid',
	"current_status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_instructions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"payment_method_id" bigint NOT NULL,
	"step_number" integer NOT NULL,
	"instruction_text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"order_id" bigint NOT NULL,
	"order_created_at" timestamp with time zone NOT NULL,
	"pg_reference_id" varchar(100),
	"endpoint_called" varchar(150),
	"request_payload" jsonb,
	"response_payload" jsonb,
	"status" varchar(20),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"brand_id" bigint NOT NULL,
	"code" varchar(50) NOT NULL,
	"vendor" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(20) NOT NULL,
	"fee_flat" numeric(10, 2) DEFAULT '0',
	"fee_percentage" numeric(5, 2) DEFAULT '0',
	"is_publish" boolean DEFAULT true,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "product_kds_routes" (
	"product_id" bigint NOT NULL,
	"kds_station_id" bigint NOT NULL,
	CONSTRAINT "product_kds_routes_product_id_kds_station_id_pk" PRIMARY KEY("product_id","kds_station_id")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"brand_id" bigint NOT NULL,
	"category_id" bigint,
	"name" varchar(100) NOT NULL,
	"description" text,
	"base_price" numeric(10, 2) NOT NULL,
	"image_url" text,
	"is_customizable" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"branch_id" bigint NOT NULL,
	"customer_id" bigint,
	"table_id" bigint,
	"customer_name" varchar(100) NOT NULL,
	"customer_phone" varchar(20) NOT NULL,
	"reservation_time" timestamp with time zone NOT NULL,
	"guest_count" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"special_request" text,
	"handled_by_user_id" bigint,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stock_ledgers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"branch_id" bigint NOT NULL,
	"user_id" bigint,
	"product_id" bigint,
	"modifier_option_id" bigint,
	"movement_type" varchar(20) NOT NULL,
	"quantity" integer NOT NULL,
	"reference_id" varchar(50),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "table_areas" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"branch_id" bigint NOT NULL,
	"name" varchar(50) NOT NULL,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "tables" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"branch_id" bigint NOT NULL,
	"area_id" bigint,
	"table_number" varchar(20) NOT NULL,
	"capacity" integer DEFAULT 2,
	"status" varchar(20) DEFAULT 'available',
	"qr_code_url" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "tables_branch_id_table_number_unique" UNIQUE("branch_id","table_number")
);
--> statement-breakpoint
CREATE TABLE "tax_configs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"branch_id" bigint NOT NULL,
	"name" varchar(50) NOT NULL,
	"percentage" numeric(5, 2) NOT NULL,
	"is_active" boolean DEFAULT true,
	"apply_to_order_types" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"brand_id" bigint NOT NULL,
	"branch_id" bigint,
	"role" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(100),
	"pin_code" varchar(10),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "branch_modifier_options" ADD CONSTRAINT "branch_modifier_options_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branch_modifier_options" ADD CONSTRAINT "branch_modifier_options_modifier_option_id_modifier_options_id_fk" FOREIGN KEY ("modifier_option_id") REFERENCES "public"."modifier_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branch_products" ADD CONSTRAINT "branch_products_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branch_products" ADD CONSTRAINT "branch_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cashier_shifts" ADD CONSTRAINT "cashier_shifts_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cashier_shifts" ADD CONSTRAINT "cashier_shifts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kds_stations" ADD CONSTRAINT "kds_stations_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modifier_groups" ADD CONSTRAINT "modifier_groups_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modifier_options" ADD CONSTRAINT "modifier_options_modifier_group_id_modifier_groups_id_fk" FOREIGN KEY ("modifier_group_id") REFERENCES "public"."modifier_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notif_templates" ADD CONSTRAINT "notif_templates_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item_modifiers" ADD CONSTRAINT "order_item_modifiers_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item_modifiers" ADD CONSTRAINT "order_item_modifiers_modifier_option_id_modifier_options_id_fk" FOREIGN KEY ("modifier_option_id") REFERENCES "public"."modifier_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_reviews" ADD CONSTRAINT "order_reviews_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_instructions" ADD CONSTRAINT "payment_instructions_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_kds_routes" ADD CONSTRAINT "product_kds_routes_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_kds_routes" ADD CONSTRAINT "product_kds_routes_kds_station_id_kds_stations_id_fk" FOREIGN KEY ("kds_station_id") REFERENCES "public"."kds_stations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_table_id_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_handled_by_user_id_users_id_fk" FOREIGN KEY ("handled_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_ledgers" ADD CONSTRAINT "stock_ledgers_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_ledgers" ADD CONSTRAINT "stock_ledgers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_ledgers" ADD CONSTRAINT "stock_ledgers_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_ledgers" ADD CONSTRAINT "stock_ledgers_modifier_option_id_modifier_options_id_fk" FOREIGN KEY ("modifier_option_id") REFERENCES "public"."modifier_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "table_areas" ADD CONSTRAINT "table_areas_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tables" ADD CONSTRAINT "tables_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tables" ADD CONSTRAINT "tables_area_id_table_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."table_areas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_configs" ADD CONSTRAINT "tax_configs_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE set null ON UPDATE no action;