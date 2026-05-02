-- ==============================================================================
-- DATABASE SCHEMA & FULL SEEDER: SAAS F&B (ENTERPRISE LEVEL)
-- Fitur: Multi-Branch, Price Override, Partitioning, JSONB, Table Management,
--        Stock Tracking, Coupons, Verified Reviews, CRM (Customers), HR (Users)
-- ==============================================================================

-- 1. Tabel Brands (Induk Restoran)
CREATE TABLE brands (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    tagline VARCHAR(150),
    brand_color VARCHAR(20) DEFAULT 'amber',
    logo_url TEXT,
    whatsapp_contact VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Branches (Daftar Cabang)
CREATE TABLE branches (
    id BIGSERIAL PRIMARY KEY,
    brand_id BIGINT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    open_hours VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- MODULE: HR & CUSTOMER RELATIONSHIP MANAGEMENT (NEW)
-- ==============================================================================

-- 3. Tabel Users (Manajemen Internal & Role Karyawan)
-- Digunakan untuk audit trail dan perhitungan performa personal tim
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    brand_id BIGINT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL, -- Null berarti staf Head Quarter (Pusat)
    role VARCHAR(50) NOT NULL, -- 'superadmin', 'brand_manager', 'branch_manager', 'cashier', 'waiter', 'kitchen', 'driver'
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    pin_code VARCHAR(10), -- PIN Kasir untuk Quick Login di POS Tablet
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Customers (Database Pelanggan & Retensi)
-- Berbasis nomor telepon per Brand untuk analitik retensi yang akurat
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    brand_id BIGINT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    total_orders INT DEFAULT 0, -- Cache performa retensi
    total_spent DECIMAL(10, 2) DEFAULT 0, -- Cache Customer Lifetime Value (CLV)
    last_order_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (brand_id, phone)
);

-- ==============================================================================
-- MODULE: TABLE MANAGEMENT & RESERVATION
-- ==============================================================================

-- Tabel Area/Lantai (Manajemen Ruangan)
CREATE TABLE table_areas (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0
);

CREATE TABLE tables (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    area_id BIGINT REFERENCES table_areas(id) ON DELETE SET NULL,
    table_number VARCHAR(20) NOT NULL,
    capacity INT DEFAULT 2,
    status VARCHAR(20) DEFAULT 'available', 
    qr_code_url TEXT, 
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (branch_id, table_number)
);

CREATE TABLE reservations (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL, -- Linked to CRM
    table_id BIGINT REFERENCES tables(id),
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    reservation_time TIMESTAMPTZ NOT NULL,
    guest_count INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    special_request TEXT,
    handled_by_user_id BIGINT REFERENCES users(id), -- Staf yang menerima reservasi
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- MODULE: CATALOG, AVAILABILITY & HYBRID STOCK MANAGEMENT
-- ==============================================================================

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    brand_id BIGINT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0
);

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    brand_id BIGINT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    is_customizable BOOLEAN DEFAULT FALSE
);

CREATE TABLE branch_products (
    branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT TRUE, 
    price_override DECIMAL(10, 2), 
    track_stock BOOLEAN DEFAULT FALSE, 
    stock_quantity INT DEFAULT 0, 
    PRIMARY KEY (branch_id, product_id)
);

CREATE TABLE modifier_groups (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    selection_type VARCHAR(20) NOT NULL 
);

CREATE TABLE modifier_options (
    id BIGSERIAL PRIMARY KEY,
    modifier_group_id BIGINT NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    extra_price DECIMAL(10, 2) DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE
);

CREATE TABLE branch_modifier_options (
    branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    modifier_option_id BIGINT NOT NULL REFERENCES modifier_options(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT TRUE, 
    price_override DECIMAL(10, 2),
    track_stock BOOLEAN DEFAULT FALSE, 
    stock_quantity INT DEFAULT 0,
    PRIMARY KEY (branch_id, modifier_option_id)
);

-- Tabel Riwayat Pergerakan Stok
CREATE TABLE stock_ledgers (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id), -- Siapa yang mengupdate/menambah stok (Audit)
    product_id BIGINT REFERENCES products(id), 
    modifier_option_id BIGINT REFERENCES modifier_options(id), 
    movement_type VARCHAR(20) NOT NULL, 
    quantity INT NOT NULL, 
    reference_id VARCHAR(50), 
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- MODULE: COUPON & DISCOUNTS (PROMO)
-- ==============================================================================

CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    brand_id BIGINT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL, 
    discount_type VARCHAR(20) NOT NULL, 
    discount_value DECIMAL(10, 2) NOT NULL,
    max_discount_amount DECIMAL(10, 2), 
    min_purchase_amount DECIMAL(10, 2) DEFAULT 0, 
    start_date TIMESTAMPTZ, 
    end_date TIMESTAMPTZ, 
    quota_limit INT, 
    used_count INT DEFAULT 0, 
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE (brand_id, code)
);

-- ==============================================================================
-- MODULE: PAYMENT & NOTIFICATION CONFIG
-- ==============================================================================

CREATE TABLE payment_methods (
    id BIGSERIAL PRIMARY KEY,
    brand_id BIGINT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    vendor VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    fee_flat DECIMAL(10, 2) DEFAULT 0,
    fee_percentage DECIMAL(5, 2) DEFAULT 0,
    is_publish BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE payment_instructions (
    id BIGSERIAL PRIMARY KEY,
    payment_method_id BIGINT NOT NULL REFERENCES payment_methods(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    instruction_text TEXT NOT NULL
);

CREATE TABLE notif_templates (
    id BIGSERIAL PRIMARY KEY,
    brand_id BIGINT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    trigger_event VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    template_text TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- ==============================================================================
-- MODULE: ORDERS & TRANSACTIONS (PARTITIONED)
-- ==============================================================================

CREATE TABLE orders (
    id BIGSERIAL,
    branch_id BIGINT NOT NULL REFERENCES branches(id),
    
    -- ENTITAS CRM & HR
    customer_id BIGINT, -- Linked ke CRM jika nomornya terdaftar
    served_by_user_id BIGINT, -- Kasir/Waiter yang menangani order ini
    
    order_number VARCHAR(30) NOT NULL,
    order_type VARCHAR(20) NOT NULL,
    order_source VARCHAR(20) NOT NULL,
    table_id BIGINT,
    reservation_id BIGINT REFERENCES reservations(id) ON DELETE SET NULL,
    queue_number VARCHAR(20),
    
    -- Snapshot Kontak Pelanggan (untuk Guest Checkout)
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20),
    delivery_address TEXT,
    
    -- FINANSIAL & DISKON
    subtotal DECIMAL(10, 2) NOT NULL, 
    coupon_id BIGINT, 
    discount_amount DECIMAL(10, 2) DEFAULT 0, 
    tax_fee DECIMAL(10, 2) DEFAULT 0, 
    dp_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL, 
    
    payment_method_id BIGINT, 
    payment_status VARCHAR(20) DEFAULT 'unpaid',
    current_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_y2026m04 PARTITION OF orders FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE orders_y2026m05 PARTITION OF orders FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    order_created_at TIMESTAMPTZ NOT NULL,
    product_id BIGINT REFERENCES products(id),
    quantity INT NOT NULL DEFAULT 1,
    base_price DECIMAL(10, 2) NOT NULL,
    final_price DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    FOREIGN KEY (order_id, order_created_at) REFERENCES orders(id, created_at) ON DELETE CASCADE
);

CREATE TABLE order_item_modifiers (
    id BIGSERIAL PRIMARY KEY,
    order_item_id BIGINT NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    modifier_option_id BIGINT REFERENCES modifier_options(id),
    modifier_name VARCHAR(50) NOT NULL,
    modifier_price DECIMAL(10, 2) DEFAULT 0
);

-- ==============================================================================
-- MODULE: REVIEWS, TRACKING, LOGS & WEBHOOKS
-- ==============================================================================

CREATE TABLE order_reviews (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    order_created_at TIMESTAMPTZ NOT NULL,
    branch_id BIGINT NOT NULL REFERENCES branches(id), 
    customer_id BIGINT, -- Linked ke Pelanggan (CRM)
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5), 
    review_text TEXT,
    is_published BOOLEAN DEFAULT TRUE, 
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id, order_created_at) REFERENCES orders(id, created_at) ON DELETE CASCADE
);

-- Audit Trail Transaksi (Digunakan untuk mengukur kecepatan koki / barista)
CREATE TABLE order_status_histories (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    order_created_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL,
    user_id BIGINT, -- Staf spesifik yang mengubah status (misal: Chef A)
    changed_by VARCHAR(50), -- Fallback string (misal: 'system', 'customer_app')
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id, order_created_at) REFERENCES orders(id, created_at) ON DELETE CASCADE
);

CREATE TABLE payment_logs (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    order_created_at TIMESTAMPTZ NOT NULL,
    pg_reference_id VARCHAR(100),
    endpoint_called VARCHAR(150),
    request_payload JSONB,
    response_payload JSONB,
    status VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id, order_created_at) REFERENCES orders(id, created_at) ON DELETE CASCADE
);

CREATE TABLE notif_logs (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    order_created_at TIMESTAMPTZ NOT NULL,
    channel VARCHAR(20) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    request_payload JSONB,
    response_payload JSONB,
    status VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id, order_created_at) REFERENCES orders(id, created_at) ON DELETE CASCADE
);

-- INDEXING
CREATE INDEX idx_tables_branch ON tables(branch_id);
CREATE INDEX idx_reservations_date ON reservations(branch_id, reservation_time);
CREATE INDEX idx_order_histories_order ON order_status_histories(order_id, order_created_at);
CREATE INDEX idx_payment_logs_order ON payment_logs(order_id, order_created_at);
CREATE INDEX idx_payment_logs_pg_ref ON payment_logs(pg_reference_id);
CREATE INDEX idx_payment_payload_json ON payment_logs USING GIN (response_payload);
CREATE INDEX idx_reviews_branch_rating ON order_reviews(branch_id, rating);
CREATE INDEX idx_users_branch_role ON users(branch_id, role);
CREATE INDEX idx_customers_brand_phone ON customers(brand_id, phone);
CREATE INDEX idx_orders_customer ON orders(customer_id) WHERE customer_id IS NOT NULL;


-- ==============================================================================
-- ==============================================================================
-- 💡 SARAN & PENINGKATAN ENTERPRISE (TAMBAHAN DARI AI)
-- Fitur: Shift Kasir, KDS Routing, & Konfigurasi Pajak (Service Charge)
-- ==============================================================================
-- ==============================================================================

-- A. SHIFT MANAGEMENT (PENCEGAHAN FRAUD LACI KASIR)
-- Fungsi: Menghindari uang kasir hilang dengan mencatat waktu masuk/keluar shift
CREATE TABLE cashier_shifts (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id), -- Kasir yang berjaga
    opening_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closing_time TIMESTAMPTZ, -- Diisi saat klik "Tutup Shift" di POS
    opening_balance DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Modal awal di laci (misal: 100rb uang kembalian)
    expected_closing_balance DECIMAL(10, 2), -- Hitungan sistem (Modal + Uang Cash Tunai Transaksi)
    actual_closing_balance DECIMAL(10, 2), -- Hitungan fisik uang oleh kasir saat tutup toko
    difference_amount DECIMAL(10, 2), -- Selisih uang (Lebih/Kurang)
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'closed'
    notes TEXT
);

-- B. KITCHEN DISPLAY SYSTEM (KDS) ROUTING
-- Fungsi: Pesanan minuman otomatis masuk ke Tablet "Bar", Makanan ke Tablet "Dapur"
CREATE TABLE kds_stations (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL -- Contoh: 'Hot Kitchen', 'Bar / Beverage', 'Dessert'
);

CREATE TABLE product_kds_routes (
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    kds_station_id BIGINT NOT NULL REFERENCES kds_stations(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, kds_station_id)
);

-- C. TAX & SERVICE CHARGE CONFIGURATION
-- Fungsi: Fleksibilitas jika ada aturan pajak daerah (PB1) yang berbeda tiap kota cabang
CREATE TABLE tax_configs (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- 'Pajak Resto PB1', 'Service Charge'
    percentage DECIMAL(5, 2) NOT NULL, -- Contoh: 10.00 untuk 10%
    is_active BOOLEAN DEFAULT TRUE,
    apply_to_order_types VARCHAR(100) -- Jika 'dine_in,take_away' -> tidak berlaku untuk delivery
);

-- *Saran Soft Delete (Opsional untuk Implementasi API)*
-- Di arsitektur Backend Anda nanti (NodeJS/Go/PHP), sangat disarankan menambahkan
-- kolom `deleted_at TIMESTAMPTZ NULL` di tabel-tabel utama (Products, Users)
-- sehingga riwayat laporan tahunan tidak rusak ketika ada menu/pegawai yang dihapus.


-- ==============================================================================
-- ==============================================================================
-- SEEDER ENTITAS 1: COFFEE SHOP (KOPI SENJA)
-- Meliputi: Performa Tim & Data Pelanggan Setia (Retensi)
-- ==============================================================================
-- ==============================================================================

-- ==============================================================================
-- ==============================================================================
-- SEEDER ENTITAS 2: RESTO MIE (MIE PEDAS JUARA)
-- ==============================================================================
-- ==============================================================================

INSERT INTO brands (id, name, tagline, brand_color, logo_url, whatsapp_contact) VALUES 
(2, 'Mie Pedas Juara', 'Jagonya Mie Pedas No.1', 'pink', 'https://example.com/logo/mie.png', '+628222222222');

INSERT INTO branches (id, brand_id, name, address, open_hours) VALUES 
(3, 2, 'Mie Pedas Juara - Tebet', 'Jl. Tebet Utara Dalam', '10:00 - 22:00'),
(4, 2, 'Mie Pedas Juara - Antapani', 'Jl. Terusan Jakarta No 10', '10:00 - 22:00');

-- SEEDER HR (USERS) MIE PEDAS
INSERT INTO users (id, brand_id, branch_id, role, name, email, pin_code) VALUES
(5, 2, 3, 'cashier', 'Putri', 'putri@miejuara.com', '2222'),
(6, 2, 3, 'kitchen', 'Chef Juna', 'juna@miejuara.com', '3333'),
(7, 2, 3, 'driver', 'Gojek Kurir Internal', NULL, NULL);

-- SEEDER CRM (CUSTOMERS) MIE PEDAS
INSERT INTO customers (id, brand_id, name, phone, email, total_orders, total_spent, last_order_date) VALUES
(2, 2, 'Fajar', '08199999999', 'fajar@email.com', 2, 107800, '2026-04-18 12:00:00+07');

INSERT INTO table_areas (id, branch_id, name, sort_order) VALUES 
(3, 3, 'Lantai 1 - Indoor', 1),
(4, 3, 'Lantai 2 - Outdoor', 2);

INSERT INTO tables (id, branch_id, area_id, table_number, capacity, qr_code_url, status) VALUES 
(4, 3, 3, 'Table 10', 4, 'https://order.miejuara.com/t/tbt-10', 'available'),
(5, 3, 3, 'Table 11', 4, 'https://order.miejuara.com/t/tbt-11', 'cleaning'),
(6, 3, 4, 'Outdoor 1', 4, 'https://order.miejuara.com/t/tbt-o1', 'available');

INSERT INTO reservations (id, branch_id, customer_id, table_id, customer_name, customer_phone, reservation_time, guest_count, status, special_request) VALUES 
(2, 3, NULL, 4, 'Ibu Rina', '0855555555', '2026-04-18 20:00:00+07', 4, 'pending', 'Tolong hias meja untuk ulang tahun');

INSERT INTO categories (id, brand_id, name, sort_order) VALUES 
(3, 2, 'Paket Hemat', 1), (4, 2, 'Ala Carte Mie', 2), (5, 2, 'Dimsum', 3), (6, 2, 'Minuman', 4);

INSERT INTO products (id, brand_id, category_id, name, description, base_price, is_customizable, image_url) VALUES 
(3, 2, 3, 'Paket Combat A', '2 Porsi Mie, 2 Porsi Dimsum, 2 Minuman. Puas dan hemat!', 54000, TRUE, 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=400&h=300'),
(4, 2, 4, 'Mie Spesial', 'Mie kenyal dengan bumbu pedas rahasia dan taburan ayam cincang.', 11000, TRUE, 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&q=80&w=400&h=300'),
(5, 2, 5, 'Udang Keju', 'Dimsum ayam udang goreng dengan isian keju lumer di dalam.', 10000, FALSE, 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=400&h=300'),
(8, 2, 5, 'Udang Rambutan', 'Bola daging udang goreng berbalut kulit pangsit renyah berbentuk rambutan.', 10000, FALSE, 'https://images.unsplash.com/photo-1626200419109-382a5c9a75ba?auto=format&fit=crop&q=80&w=400&h=300'),
(9, 2, 6, 'Es Teh Manis Juara', 'Es teh manis segar ukuran jumbo untuk meredakan pedas.', 6000, FALSE, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=400&h=300');

INSERT INTO branch_products (branch_id, product_id, is_available, price_override, track_stock, stock_quantity) VALUES 
(3, 3, TRUE, NULL, FALSE, 0), (3, 4, TRUE, NULL, FALSE, 0), (3, 5, TRUE, NULL, TRUE, 50),
(3, 8, TRUE, NULL, TRUE, 8), (3, 9, TRUE, NULL, FALSE, 0),
(4, 3, TRUE, NULL, FALSE, 0), (4, 4, TRUE, NULL, FALSE, 0), (4, 5, FALSE, NULL, TRUE, 0),
(4, 8, TRUE, NULL, TRUE, 10), (4, 9, TRUE, NULL, FALSE, 0);

INSERT INTO modifier_groups (id, product_id, name, is_required, selection_type) VALUES 
(3, 3, 'Pilihan Mie (Maks 2)', TRUE, 'multiple'),
(4, 3, 'Pilihan Dimsum', TRUE, 'single'),
(5, 4, 'Level Pedas', TRUE, 'single'),
(6, 4, 'Tambahan Topping', FALSE, 'multiple');

INSERT INTO modifier_options (id, modifier_group_id, name, extra_price, is_default) VALUES 
(5, 3, 'Mie Level 1', 0, TRUE), (6, 3, 'Mie Level 3', 0, FALSE), (7, 3, 'Mie Level 5', 0, FALSE),
(8, 4, 'Udang Rambutan', 0, TRUE), (9, 4, 'Udang Keju', 0, FALSE),
(10, 5, 'Level 0 (Original)', 0, TRUE), (11, 5, 'Level 1', 0, FALSE), (12, 5, 'Level 3', 0, FALSE),
(13, 6, 'Ekstra Ayam Cincang', 4000, FALSE), (14, 6, 'Pangsit Goreng (2pcs)', 3000, FALSE);

INSERT INTO branch_modifier_options (branch_id, modifier_option_id, is_available, price_override, track_stock, stock_quantity) VALUES 
(3, 8, TRUE, NULL, TRUE, 200), (3, 9, TRUE, NULL, TRUE, 50),
(3, 5, TRUE, NULL, FALSE, 0), (3, 6, TRUE, NULL, FALSE, 0), (3, 7, TRUE, NULL, FALSE, 0),
(3, 10, TRUE, NULL, FALSE, 0), (3, 11, TRUE, NULL, FALSE, 0), (3, 12, TRUE, NULL, FALSE, 0),
(3, 13, TRUE, NULL, FALSE, 0), (3, 14, TRUE, NULL, FALSE, 0);

INSERT INTO coupons (id, brand_id, code, discount_type, discount_value, max_discount_amount, min_purchase_amount, start_date, used_count) VALUES 
(2, 2, 'POTONGAN10K', 'nominal', 10000, NULL, 50000, '2026-01-01 00:00:00+07', 850);

INSERT INTO payment_methods (id, brand_id, code, vendor, name, type, fee_flat, is_active) VALUES 
(99, 2, 'CASH', 'internal', 'Uang Tunai Kasir', 'cashier', 0, TRUE);

-- TRANSAKSI 2: DELIVERY VIA WA, DI-INPUT KASIR PUTRI UNTUK CUSTOMER FAJAR
INSERT INTO orders (
    id, branch_id, customer_id, served_by_user_id, order_number, order_type, order_source, queue_number, 
    customer_name, customer_phone, delivery_address, subtotal, coupon_id, discount_amount, tax_fee, total_amount, payment_method_id, payment_status, current_status, created_at
) VALUES (
    2, 3, 2, 5, 'MP-0426-099', 'delivery', 'cashier_pos', 'DLV-01', 
    'Fajar', '08199999999', 'Kos Blok B', 54000, 2, 10000, 4400, 48400, 99, 'paid', 'completed', '2026-04-18 12:00:00+07'
);

INSERT INTO order_items (id, order_id, order_created_at, product_id, quantity, base_price, final_price)
VALUES (2, 2, '2026-04-18 12:00:00+07', 3, 1, 54000, 54000);

INSERT INTO order_item_modifiers (id, order_item_id, modifier_option_id, modifier_name, modifier_price) VALUES
(3, 2, 5, 'Mie Level 1', 0), 
(4, 2, 8, 'Udang Rambutan', 0);

INSERT INTO stock_ledgers (branch_id, modifier_option_id, movement_type, quantity, reference_id) VALUES
(3, 8, 'sale', -1, 'MP-0426-099');

INSERT INTO order_status_histories (order_id, order_created_at, status, user_id, changed_by, notes, created_at) VALUES 
(2, '2026-04-18 12:00:00+07', 'preparing', 6, 'Chef Juna', 'Dimasak', '2026-04-18 12:05:00+07'),
(2, '2026-04-18 12:00:00+07', 'ready', 6, 'Chef Juna', 'Selesai di-packing', '2026-04-18 12:15:00+07'),
(2, '2026-04-18 12:00:00+07', 'delivering', 7, 'Gojek Kurir Internal', 'Diserahkan ke kurir', '2026-04-18 12:20:00+07');

-- TRANSAKSI 3: KOMPLEKS (BANYAK ITEM)
INSERT INTO orders (
    id, branch_id, customer_id, served_by_user_id, order_number, order_type, order_source, queue_number, 
    customer_name, customer_phone, delivery_address, subtotal, coupon_id, discount_amount, tax_fee, total_amount, payment_method_id, payment_status, current_status, created_at
) VALUES (
    3, 3, NULL, 5, 'MP-0502-100', 'dine_in', 'cashier_pos', 'A-012', 
    'Rombongan Kantor', NULL, NULL, 147000, NULL, 0, 14700, 161700, 99, 'paid', 'completed', '2026-05-02 12:30:00+07'
);

INSERT INTO order_items (id, order_id, order_created_at, product_id, quantity, base_price, final_price) VALUES 
(3, 3, '2026-05-02 12:30:00+07', 3, 2, 54000, 54000), 
(4, 3, '2026-05-02 12:30:00+07', 4, 1, 11000, 18000), 
(5, 3, '2026-05-02 12:30:00+07', 5, 1, 10000, 10000), 
(6, 3, '2026-05-02 12:30:00+07', 9, 2, 6000, 6000);   

INSERT INTO order_item_modifiers (id, order_item_id, modifier_option_id, modifier_name, modifier_price) VALUES
(5, 3, 5, 'Mie Level 1', 0), 
(6, 3, 8, 'Udang Rambutan', 0),
(7, 3, 7, 'Mie Level 5', 0), 
(8, 3, 9, 'Udang Keju', 0),
(9, 4, 11, 'Level 1', 0),
(10, 4, 13, 'Ekstra Ayam Cincang', 4000),
(11, 4, 14, 'Pangsit Goreng (2pcs)', 3000);


-- ==============================================================================
-- 10. RESET SEQUENCE (WAJIB)
-- ==============================================================================
SELECT setval('brands_id_seq', (SELECT MAX(id) FROM brands));
SELECT setval('branches_id_seq', (SELECT MAX(id) FROM branches));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers));
SELECT setval('table_areas_id_seq', (SELECT MAX(id) FROM table_areas));
SELECT setval('tables_id_seq', (SELECT MAX(id) FROM tables));
SELECT setval('reservations_id_seq', (SELECT MAX(id) FROM reservations));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
SELECT setval('modifier_groups_id_seq', (SELECT MAX(id) FROM modifier_groups));
SELECT setval('modifier_options_id_seq', (SELECT MAX(id) FROM modifier_options));
SELECT setval('coupons_id_seq', (SELECT MAX(id) FROM coupons));
SELECT setval('payment_methods_id_seq', (SELECT MAX(id) FROM payment_methods));
SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));
SELECT setval('order_items_id_seq', (SELECT MAX(id) FROM order_items));
SELECT setval('order_reviews_id_seq', (SELECT MAX(id) FROM order_reviews));
SELECT setval('stock_ledgers_id_seq', (SELECT MAX(id) FROM stock_ledgers));
SELECT setval('cashier_shifts_id_seq', (SELECT MAX(id) FROM cashier_shifts));
SELECT setval('kds_stations_id_seq', (SELECT MAX(id) FROM kds_stations));
SELECT setval('tax_configs_id_seq', (SELECT MAX(id) FROM tax_configs));