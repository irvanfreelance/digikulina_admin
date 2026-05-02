import {
  pgTable,
  bigserial,
  varchar,
  text,
  boolean,
  timestamp,
  bigint,
  integer,
  decimal,
  unique,
  primaryKey,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const brands = pgTable('brands', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  tagline: varchar('tagline', { length: 150 }),
  brandColor: varchar('brand_color', { length: 20 }).default('amber'),
  logoUrl: text('logo_url'),
  whatsappContact: varchar('whatsapp_contact', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const branches = pgTable('branches', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  brandId: bigint('brand_id', { mode: 'number' }).notNull().references(() => brands.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  address: text('address'),
  openHours: varchar('open_hours', { length: 50 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  brandId: bigint('brand_id', { mode: 'number' }).notNull().references(() => brands.id, { onDelete: 'cascade' }),
  branchId: bigint('branch_id', { mode: 'number' }).references(() => branches.id, { onDelete: 'set null' }),
  role: varchar('role', { length: 50 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }),
  pinCode: varchar('pin_code', { length: 10 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const customers = pgTable('customers', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  brandId: bigint('brand_id', { mode: 'number' }).notNull().references(() => brands.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  email: varchar('email', { length: 100 }),
  totalOrders: integer('total_orders').default(0),
  totalSpent: decimal('total_spent', { precision: 10, scale: 2 }).default('0'),
  lastOrderDate: timestamp('last_order_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  unq: unique().on(t.brandId, t.phone),
}));

export const tableAreas = pgTable('table_areas', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  branchId: bigint('branch_id', { mode: 'number' }).notNull().references(() => branches.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 50 }).notNull(),
  sortOrder: integer('sort_order').default(0),
});

export const tables = pgTable('tables', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  branchId: bigint('branch_id', { mode: 'number' }).notNull().references(() => branches.id, { onDelete: 'cascade' }),
  areaId: bigint('area_id', { mode: 'number' }).references(() => tableAreas.id, { onDelete: 'set null' }),
  tableNumber: varchar('table_number', { length: 20 }).notNull(),
  capacity: integer('capacity').default(2),
  status: varchar('status', { length: 20 }).default('available'),
  qrCodeUrl: text('qr_code_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  unq: unique().on(t.branchId, t.tableNumber),
}));

export const reservations = pgTable('reservations', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  branchId: bigint('branch_id', { mode: 'number' }).notNull().references(() => branches.id, { onDelete: 'cascade' }),
  customerId: bigint('customer_id', { mode: 'number' }).references(() => customers.id, { onDelete: 'set null' }),
  tableId: bigint('table_id', { mode: 'number' }).references(() => tables.id),
  customerName: varchar('customer_name', { length: 100 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 20 }).notNull(),
  reservationTime: timestamp('reservation_time', { withTimezone: true }).notNull(),
  guestCount: integer('guest_count').notNull(),
  status: varchar('status', { length: 20 }).default('pending'),
  specialRequest: text('special_request'),
  handledByUserId: bigint('handled_by_user_id', { mode: 'number' }).references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const categories = pgTable('categories', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  brandId: bigint('brand_id', { mode: 'number' }).notNull().references(() => brands.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 50 }).notNull(),
  sortOrder: integer('sort_order').default(0),
});

export const products = pgTable('products', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  brandId: bigint('brand_id', { mode: 'number' }).notNull().references(() => brands.id, { onDelete: 'cascade' }),
  categoryId: bigint('category_id', { mode: 'number' }).references(() => categories.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: text('image_url'),
  isCustomizable: boolean('is_customizable').default(false),
});

export const branchProducts = pgTable('branch_products', {
  branchId: bigint('branch_id', { mode: 'number' }).notNull().references(() => branches.id, { onDelete: 'cascade' }),
  productId: bigint('product_id', { mode: 'number' }).notNull().references(() => products.id, { onDelete: 'cascade' }),
  isAvailable: boolean('is_available').default(true),
  priceOverride: decimal('price_override', { precision: 10, scale: 2 }),
  trackStock: boolean('track_stock').default(false),
  stockQuantity: integer('stock_quantity').default(0),
}, (t) => ({
  pk: primaryKey({ columns: [t.branchId, t.productId] }),
}));

export const modifierGroups = pgTable('modifier_groups', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  productId: bigint('product_id', { mode: 'number' }).notNull().references(() => products.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 50 }).notNull(),
  isRequired: boolean('is_required').default(false),
  selectionType: varchar('selection_type', { length: 20 }).notNull(),
});

export const modifierOptions = pgTable('modifier_options', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  modifierGroupId: bigint('modifier_group_id', { mode: 'number' }).notNull().references(() => modifierGroups.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 50 }).notNull(),
  extraPrice: decimal('extra_price', { precision: 10, scale: 2 }).default('0'),
  isDefault: boolean('is_default').default(false),
});

export const branchModifierOptions = pgTable('branch_modifier_options', {
  branchId: bigint('branch_id', { mode: 'number' }).notNull().references(() => branches.id, { onDelete: 'cascade' }),
  modifierOptionId: bigint('modifier_option_id', { mode: 'number' }).notNull().references(() => modifierOptions.id, { onDelete: 'cascade' }),
  isAvailable: boolean('is_available').default(true),
  priceOverride: decimal('price_override', { precision: 10, scale: 2 }),
  trackStock: boolean('track_stock').default(false),
  stockQuantity: integer('stock_quantity').default(0),
}, (t) => ({
  pk: primaryKey({ columns: [t.branchId, t.modifierOptionId] }),
}));

export const stockLedgers = pgTable('stock_ledgers', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  branchId: bigint('branch_id', { mode: 'number' }).notNull().references(() => branches.id, { onDelete: 'cascade' }),
  userId: bigint('user_id', { mode: 'number' }).references(() => users.id),
  productId: bigint('product_id', { mode: 'number' }).references(() => products.id),
  modifierOptionId: bigint('modifier_option_id', { mode: 'number' }).references(() => modifierOptions.id),
  movementType: varchar('movement_type', { length: 20 }).notNull(),
  quantity: integer('quantity').notNull(),
  referenceId: varchar('reference_id', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const coupons = pgTable('coupons', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  brandId: bigint('brand_id', { mode: 'number' }).notNull().references(() => brands.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 50 }).notNull(),
  discountType: varchar('discount_type', { length: 20 }).notNull(),
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  maxDiscountAmount: decimal('max_discount_amount', { precision: 10, scale: 2 }),
  minPurchaseAmount: decimal('min_purchase_amount', { precision: 10, scale: 2 }).default('0'),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  quotaLimit: integer('quota_limit'),
  usedCount: integer('used_count').default(0),
  isActive: boolean('is_active').default(true),
}, (t) => ({
  unq: unique().on(t.brandId, t.code),
}));

export const paymentMethods = pgTable('payment_methods', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  brandId: bigint('brand_id', { mode: 'number' }).notNull().references(() => brands.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 50 }).notNull(),
  vendor: varchar('vendor', { length: 50 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  feeFlat: decimal('fee_flat', { precision: 10, scale: 2 }).default('0'),
  feePercentage: decimal('fee_percentage', { precision: 5, scale: 2 }).default('0'),
  isPublish: boolean('is_publish').default(true),
  isActive: boolean('is_active').default(true),
});

export const paymentInstructions = pgTable('payment_instructions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  paymentMethodId: bigint('payment_method_id', { mode: 'number' }).notNull().references(() => paymentMethods.id, { onDelete: 'cascade' }),
  stepNumber: integer('step_number').notNull(),
  instructionText: text('instruction_text').notNull(),
});

export const notifTemplates = pgTable('notif_templates', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  brandId: bigint('brand_id', { mode: 'number' }).notNull().references(() => brands.id, { onDelete: 'cascade' }),
  triggerEvent: varchar('trigger_event', { length: 50 }).notNull(),
  channel: varchar('channel', { length: 20 }).notNull(),
  templateText: text('template_text').notNull(),
  isActive: boolean('is_active').default(true),
});

export const orders = pgTable('orders', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  branchId: bigint('branch_id', { mode: 'number' }).notNull().references(() => branches.id),
  customerId: bigint('customer_id', { mode: 'number' }),
  servedByUserId: bigint('served_by_user_id', { mode: 'number' }),
  orderNumber: varchar('order_number', { length: 30 }).notNull(),
  orderType: varchar('order_type', { length: 20 }).notNull(),
  orderSource: varchar('order_source', { length: 20 }).notNull(),
  tableId: bigint('table_id', { mode: 'number' }),
  reservationId: bigint('reservation_id', { mode: 'number' }),
  queueNumber: varchar('queue_number', { length: 20 }),
  customerName: varchar('customer_name', { length: 100 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 20 }),
  deliveryAddress: text('delivery_address'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  couponId: bigint('coupon_id', { mode: 'number' }),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0'),
  taxFee: decimal('tax_fee', { precision: 10, scale: 2 }).default('0'),
  dpAmount: decimal('dp_amount', { precision: 10, scale: 2 }).default('0'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethodId: bigint('payment_method_id', { mode: 'number' }),
  paymentStatus: varchar('payment_status', { length: 20 }).default('unpaid'),
  currentStatus: varchar('current_status', { length: 20 }).default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  orderId: bigint('order_id', { mode: 'number' }).notNull(),
  orderCreatedAt: timestamp('order_created_at', { withTimezone: true }).notNull(),
  productId: bigint('product_id', { mode: 'number' }).references(() => products.id),
  quantity: integer('quantity').notNull().default(1),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  finalPrice: decimal('final_price', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
});

export const orderItemModifiers = pgTable('order_item_modifiers', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  orderItemId: bigint('order_item_id', { mode: 'number' }).notNull().references(() => orderItems.id, { onDelete: 'cascade' }),
  modifierOptionId: bigint('modifier_option_id', { mode: 'number' }).references(() => modifierOptions.id),
  modifierName: varchar('modifier_name', { length: 50 }).notNull(),
  modifierPrice: decimal('modifier_price', { precision: 10, scale: 2 }).default('0'),
});

export const orderReviews = pgTable('order_reviews', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  orderId: bigint('order_id', { mode: 'number' }).notNull(),
  orderCreatedAt: timestamp('order_created_at', { withTimezone: true }).notNull(),
  branchId: bigint('branch_id', { mode: 'number' }).notNull().references(() => branches.id),
  customerId: bigint('customer_id', { mode: 'number' }),
  rating: integer('rating').notNull(),
  reviewText: text('review_text'),
  isPublished: boolean('is_published').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const orderStatusHistories = pgTable('order_status_histories', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  orderId: bigint('order_id', { mode: 'number' }).notNull(),
  orderCreatedAt: timestamp('order_created_at', { withTimezone: true }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  userId: bigint('user_id', { mode: 'number' }),
  changedBy: varchar('changed_by', { length: 50 }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const paymentLogs = pgTable('payment_logs', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  orderId: bigint('order_id', { mode: 'number' }).notNull(),
  orderCreatedAt: timestamp('order_created_at', { withTimezone: true }).notNull(),
  pgReferenceId: varchar('pg_reference_id', { length: 100 }),
  endpointCalled: varchar('endpoint_called', { length: 150 }),
  requestPayload: jsonb('request_payload'),
  responsePayload: jsonb('response_payload'),
  status: varchar('status', { length: 20 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const notifLogs = pgTable('notif_logs', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  orderId: bigint('order_id', { mode: 'number' }).notNull(),
  orderCreatedAt: timestamp('order_created_at', { withTimezone: true }).notNull(),
  channel: varchar('channel', { length: 20 }).notNull(),
  destination: varchar('destination', { length: 100 }).notNull(),
  requestPayload: jsonb('request_payload'),
  responsePayload: jsonb('response_payload'),
  status: varchar('status', { length: 20 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const cashierShifts = pgTable('cashier_shifts', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  branchId: bigint('branch_id', { mode: 'number' }).notNull().references(() => branches.id, { onDelete: 'cascade' }),
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id),
  openingTime: timestamp('opening_time', { withTimezone: true }).notNull().defaultNow(),
  closingTime: timestamp('closing_time', { withTimezone: true }),
  openingBalance: decimal('opening_balance', { precision: 10, scale: 2 }).notNull().default('0'),
  expectedClosingBalance: decimal('expected_closing_balance', { precision: 10, scale: 2 }),
  actualClosingBalance: decimal('actual_closing_balance', { precision: 10, scale: 2 }),
  differenceAmount: decimal('difference_amount', { precision: 10, scale: 2 }),
  status: varchar('status', { length: 20 }).default('open'),
  notes: text('notes'),
});

export const kdsStations = pgTable('kds_stations', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  branchId: bigint('branch_id', { mode: 'number' }).notNull().references(() => branches.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 50 }).notNull(),
});

export const productKdsRoutes = pgTable('product_kds_routes', {
  productId: bigint('product_id', { mode: 'number' }).notNull().references(() => products.id, { onDelete: 'cascade' }),
  kdsStationId: bigint('kds_station_id', { mode: 'number' }).notNull().references(() => kdsStations.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.productId, t.kdsStationId] }),
}));

export const taxConfigs = pgTable('tax_configs', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  branchId: bigint('branch_id', { mode: 'number' }).notNull().references(() => branches.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 50 }).notNull(),
  percentage: decimal('percentage', { precision: 5, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true),
  applyToOrderTypes: varchar('apply_to_order_types', { length: 100 }),
});
