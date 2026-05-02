-- -------------------------------------------------------------
-- TablePlus 6.8.6(662)
--
-- https://tableplus.com/
--
-- Database: neondb
-- Generation Time: 2026-05-02 23:39:05.3760
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "public"."payment_methods";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS payment_methods_id_seq1;

-- Table Definition
CREATE TABLE "public"."payment_methods" (
    "id" int8 NOT NULL DEFAULT nextval('payment_methods_id_seq1'::regclass),
    "code" varchar(50) NOT NULL,
    "name" varchar(100) NOT NULL,
    "logo_url" varchar(255),
    "type" varchar(50) NOT NULL,
    "provider" varchar(50) NOT NULL,
    "admin_fee_flat" int8 DEFAULT 0,
    "admin_fee_pct" numeric(5,2) DEFAULT 0.00,
    "is_active" bool DEFAULT true,
    "is_redirect" bool DEFAULT false,
    "sort_order" int4 DEFAULT 0,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."payment_instructions";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS payment_instructions_id_seq1;

-- Table Definition
CREATE TABLE "public"."payment_instructions" (
    "id" int8 NOT NULL DEFAULT nextval('payment_instructions_id_seq1'::regclass),
    "payment_method_id" int8 NOT NULL,
    "title" varchar(255) NOT NULL,
    "content" text NOT NULL,
    "sort_order" int4 DEFAULT 0,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

INSERT INTO "public"."payment_methods" ("id", "code", "name", "logo_url", "type", "provider", "admin_fee_flat", "admin_fee_pct", "is_active", "is_redirect", "sort_order") VALUES
(1, 'GOPAY', 'GoPay', 'https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg', 'E-Wallet', 'Midtrans', 0, 0.00, 't', 'f', 3),
(2, 'BCA', 'BCA Virtual Account', 'https://upload.wikimedia.org/wikipedia/id/e/e0/BCA_logo.svg', 'Bank Transfer', 'Xendit', 4000, 0.00, 't', 'f', 4),
(3, 'MANDIRI', 'Mandiri Virtual Account', 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_of_Bank_Mandiri.svg', 'Bank Transfer', 'Xendit', 4000, 0.00, 't', 'f', 5),
(4, 'BSI', 'BSI Virtual Account', 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Bank_Syariah_Indonesia.svg', 'Bank Transfer', 'Xendit', 4000, 0.00, 't', 'f', 2),
(5, 'QR_CODE', 'QRIS Dynamic', 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg', 'qr_code', 'Xendit', 0, 0.00, 't', 'f', 1),
(6, 'SHOPEEPAY', 'ShopeePay', 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg', 'E-Wallet', 'Xendit', 0, 0.00, 't', 'f', 6),
(7, 'DANA', 'DANA', 'https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg', 'E-Wallet', 'Xendit', 0, 0.00, 't', 'f', 7),
(8, 'LINKAJA', 'LinkAja', 'https://upload.wikimedia.org/wikipedia/commons/8/83/LinkAja.svg', 'E-Wallet', 'Xendit', 0, 0.00, 't', 'f', 8),
(9, 'BRI', 'BRI Virtual Account', 'https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_Logo.svg', 'Bank Transfer', 'Xendit', 4000, 0.00, 't', 'f', 9),
(10, 'BNI', 'BNI Virtual Account', 'https://upload.wikimedia.org/wikipedia/id/5/55/BNI_logo.svg', 'Bank Transfer', 'Xendit', 4000, 0.00, 't', 'f', 10),
(11, 'BJB', 'BJB Virtual Account', 'https://upload.wikimedia.org/wikipedia/id/8/8a/Logo_Bank_BJB.svg', 'Bank Transfer', 'Xendit', 4000, 0.00, 't', 'f', 11),
(12, 'BNC', 'BNC Virtual Account', 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_Bank_Neo_Commerce.svg', 'Bank Transfer', 'Xendit', 4000, 0.00, 't', 'f', 12),
(13, 'CIMB', 'CIMB Niaga Virtual Account', 'https://upload.wikimedia.org/wikipedia/commons/e/e0/CIMB_Niaga_logo.svg', 'Bank Transfer', 'Xendit', 4000, 0.00, 't', 'f', 13),
(14, 'MUAMALAT', 'Muamalat Virtual Account', 'https://upload.wikimedia.org/wikipedia/id/5/52/Logo_Bank_Muamalat.svg', 'Bank Transfer', 'Xendit', 4000, 0.00, 't', 'f', 14),
(15, 'PERMATA', 'Permata Virtual Account', 'https://upload.wikimedia.org/wikipedia/id/a/af/Bank_Permata_logo.svg', 'Bank Transfer', 'Xendit', 4000, 0.00, 't', 'f', 15),
(16, 'ALFAMART', 'Alfamart', 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Alfamart_logo.svg', 'Over-the-Counter', 'Xendit', 5000, 0.00, 't', 'f', 16),
(17, 'INDOMARET', 'Indomaret', 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Logo_Indomaret.svg', 'Over-the-Counter', 'Xendit', 5000, 0.00, 't', 'f', 17),
(18, 'BCA_MANUAL', 'BCA (Transfer Manual)', 'https://upload.wikimedia.org/wikipedia/id/e/e0/BCA_logo.svg', 'Bank Transfer', 'Manual', 0, 0.00, 't', 'f', 18),
(19, 'MANDIRI_MANUAL', 'Mandiri (Transfer Manual)', 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_of_Bank_Mandiri.svg', 'Bank Transfer', 'Manual', 0, 0.00, 't', 'f', 19);

INSERT INTO "public"."payment_instructions" ("id", "payment_method_id", "title", "content", "sort_order", "created_at") VALUES
(1, 2, 'Pembayaran via Mbanking', '<ol><li>Buka aplikasi BCA Mobile</li><li>Pilih m-BCA, lalu pilih m-Transfer</li><li>Masukkan nomor Virtual Account Anda, contoh: 3816523906568, lalu tekan OK</li><li>Klik tombol Kirim di pojok kanan atas untuk melanjutkan</li><li>Klik OK untuk melanjutkan</li><li>Masukkan PIN m-BCA Anda untuk otorisasi transaksi</li></ol>', 1, '2026-05-01 03:32:23.084429+00'),
(2, 2, 'Pembayaran via Ibanking', '<ol><li>Login ke KlikBCA Individual (https://ibank.klikbca.com)</li><li>Pilih menu Transfer, lalu pilih Transfer ke BCA Virtual Account</li><li>Masukkan nomor Virtual Account, contoh: 3816523906568</li><li>Pilih Lanjutkan untuk memproses pembayaran</li><li>Masukkan respon KEYBCA APPLI 1 yang muncul di Token BCA Anda, lalu klik tombol Kirim</li><li>Masukkan kode token autentikasi</li></ol>', 2, '2026-05-01 03:32:23.084429+00'),
(3, 2, 'Pembayaran via Atm', '<ol><li>Masukkan kartu ATM BCA dan PIN Anda</li><li>Pilih menu Transaksi Lainnya</li><li>Pilih Transfer</li><li>Pilih Ke Rekening BCA Virtual Account</li><li>Masukkan nomor Virtual Account, contoh: 3816523906568. Tekan Benar untuk melanjutkan</li><li>Verifikasi detail Virtual Account lalu masukkan nominal yang akan ditransfer dan pilih Benar untuk konfirmasi</li><li>Konfirmasi detail transaksi Anda yang muncul di layar</li><li>Pilih Ya jika detail sudah benar atau Tidak jika detail belum benar</li></ol>', 3, '2026-05-01 03:32:23.084429+00'),
(4, 3, 'Pembayaran via Livin', '<ol><li>Login ke aplikasi Livin’ by Mandiri</li><li>Pilih Transfer IDR > Transfer ke penerima baru</li><li>Masukkan nomor virtual account (contoh: 8860863623046)</li><li>Masukkan atau konfirmasi jumlah pembayaran</li><li>Klik Lanjutkan</li><li>Masukkan PIN MPIN Anda</li></ol>', 4, '2026-05-01 03:32:23.084429+00'),
(5, 3, 'Pembayaran via Atm', '<ol><li>Masukkan kartu ATM</li><li>Pilih bahasa yang diinginkan</li><li>Masukkan PIN ATM</li><li>Pilih menu BAYAR > MULTI PAYMENT</li><li>Masukkan kode perusahaan 88608 (XENDIT), lalu tekan BENAR</li><li>Masukkan nomor virtual account (contoh: 8860863623046), lalu tekan BENAR</li><li>Masukkan jumlah pembayaran, lalu tekan BENAR</li><li>Konfirmasi detail pembayaran</li></ol>', 5, '2026-05-01 03:32:23.084429+00'),
(6, 9, 'Pembayaran via Brimo', '<ol><li>Login ke aplikasi BRI Mobile Banking</li><li>Pilih menu Pembayaran > Briva</li><li>Masukkan nomor virtual account (contoh: 1328216932121)</li><li>Masukkan jumlah pembayaran</li><li>Masukkan PIN</li><li>Klik Kirim</li></ol>', 6, '2026-05-01 03:32:23.084429+00'),
(7, 9, 'Pembayaran via Atm', '<ol><li>Masukkan kartu ATM</li><li>Pilih bahasa</li><li>Masukkan PIN ATM</li><li>Pilih menu Lainnya > Pembayaran > Pembayaran Lainnya > BRIVA</li><li>Masukkan nomor virtual account (contoh: 1328216932121)</li><li>Masukkan jumlah pembayaran</li><li>Konfirmasi detail pembayaran dan tekan YA</li></ol>', 7, '2026-05-01 03:32:23.084429+00'),
(8, 10, 'Pembayaran via Mobile', '<ol><li>Login ke aplikasi BNI Mobile Banking</li><li>Klik Transfer > Virtual Account Billing, lalu pilih rekening debet</li><li>Masukkan nomor virtual account (contoh: 880849021633)</li><li>Jumlah pembayaran akan muncul di layar</li><li>Konfirmasi informasi pembayaran</li><li>Masukkan password transaksi</li></ol>', 8, '2026-05-01 03:32:23.084429+00'),
(9, 10, 'Pembayaran via Ibanking', '<ol><li>Login ke https://ibank.bni.co.id</li><li>Klik Transfer > Virtual Account Billing</li><li>Masukkan nomor virtual account (contoh: 880849021633)</li><li>Pilih rekening bank</li><li>Jumlah pembayaran akan muncul di layar</li><li>Masukkan kode token autentikasi</li></ol>', 9, '2026-05-01 03:32:23.084429+00'),
(10, 10, 'Pembayaran via Atm', '<ol><li>Masukkan kartu ATM</li><li>Pilih bahasa</li><li>Masukkan PIN ATM</li><li>Pilih menu Transaksi Lainnya > Transfer</li><li>Pilih tipe rekening</li><li>Masukkan nomor virtual account (contoh: 880849021633)</li><li>Jumlah pembayaran akan muncul di layar</li><li>Konfirmasi informasi pembayaran</li></ol>', 10, '2026-05-01 03:32:23.084429+00'),
(11, 11, 'Pembayaran via Mobile', '<ol><li>Buka aplikasi BJB Mobile</li><li>Masukkan User ID dan Password</li><li>Pilih Virtual Account</li><li>Pilih tipe rekening yang Anda gunakan untuk transfer (misal: Rekening Tabungan)</li><li>Masukkan Nomor Virtual Account, contoh: 1234999968795947</li><li>Konfirmasi detail transaksi Anda yang muncul di layar</li></ol>', 11, '2026-05-01 03:32:23.084429+00'),
(12, 11, 'Pembayaran via Ibanking', '<ol><li>Buka https://ib.bankbjb.co.id/bjb.net</li><li>Masukkan User ID dan Password</li><li>Pilih Virtual Account</li><li>Pilih tipe rekening yang Anda gunakan untuk transfer (misal: Rekening Tabungan)</li><li>Masukkan Nomor Virtual Account, contoh: 1234999968795947</li><li>Konfirmasi detail transaksi Anda yang muncul di layar</li></ol>', 12, '2026-05-01 03:32:23.084429+00'),
(13, 11, 'Pembayaran via Atm', '<ol><li>Masukkan kartu ATM BJB dan PIN Anda</li><li>Pilih menu Transaksi Lainnya</li><li>Pilih Virtual Account</li><li>Pilih tipe rekening yang Anda gunakan untuk transfer (misal: Rekening Tabungan)</li></ol>', 13, '2026-05-01 03:32:23.084429+00'),
(14, 12, 'Pembayaran via Mobile', '<ol><li>Login ke aplikasi BNC mobile banking atau Neobank</li><li>Klik Hematpay VA & QRIS</li><li>Masukkan nomor virtual account (contoh: 9010001050411994)</li><li>Masukkan jumlah pembayaran</li><li>Konfirmasi informasi pembayaran</li><li>Masukkan PIN</li></ol>', 14, '2026-05-01 03:32:23.084429+00'),
(15, 12, 'Pembayaran via Atm', '<ol><li>Masukkan kartu ATM</li><li>Pilih bahasa</li><li>Masukkan PIN ATM</li><li>Pilih menu Pembayaran VA</li><li>Masukkan nomor virtual account (contoh: 9010001050411994)</li><li>Masukkan jumlah pembayaran</li><li>Konfirmasi informasi pembayaran</li><li>Masukkan PIN</li></ol>', 15, '2026-05-01 03:32:23.084429+00'),
(16, 4, 'Pembayaran via Byond', '<ol><li>Login ke BYOND BSI</li><li>Pilih menu Bayar & Beli</li><li>Cari Xendit, Pilih Prefix VA: 9347 atau 9655</li><li>Masukkan kode (tanpa prefix) (contoh: 33371937)</li><li>Masukkan PIN</li><li>Konfirmasi detail pembayaran</li></ol>', 16, '2026-05-01 03:32:23.084429+00'),
(17, 4, 'Pembayaran via Ibanking', '<ol><li>Login ke https://bsinet.bankbsi.co.id</li><li>Klik Pembayaran</li><li>Pilih sumber pembayaran</li><li>Klik Institusi</li><li>Masukkan Xendit sebagai nama institusi (kode 9347)</li><li>Masukkan nomor virtual account (contoh: 33371937)</li><li>Konfirmasi detail pembayaran</li><li>Masukkan kode token autentikasi</li></ol>', 17, '2026-05-01 03:32:23.084429+00'),
(18, 4, 'Pembayaran via Atm', '<ol><li>Masukkan kartu ATM</li><li>Pilih bahasa</li><li>Masukkan PIN ATM</li><li>Pilih menu Pembayaran/Pembelian > Institusi</li><li>Masukkan nomor virtual account (contoh: 934733371937)</li><li>Konfirmasi detail pembayaran</li></ol>', 18, '2026-05-01 03:32:23.084429+00'),
(19, 4, 'Pembayaran via Antarbank', '<ol><li>Login ke rekening bank Anda</li><li>Klik Transfer > Pilih BSI</li><li>Masukkan 009 + kode BSI Virtual Account 9347 + nomor virtual account, (contoh: 934733371937)</li><li>Masukkan jumlah pembayaran</li><li>Pilih sumber pembayaran</li><li>Pilih Transfer Online</li><li>Konfirmasi detail pembayaran</li></ol>', 19, '2026-05-01 03:32:23.084429+00'),
(20, 13, 'Pembayaran via Octo', '<ol><li>Buka aplikasi Octo Mobile dan masukkan User ID dan Password Anda</li><li>Pilih menu Transfer lalu pilih CIMB Niaga Lainnya</li><li>Masukkan Nomor Virtual Account Anda pada menu Input Baru</li><li>Masukkan jumlah pembayaran yang sesuai</li><li>Konfirmasi transaksi dan masukkan password Anda</li><li>Transaksi Anda selesai</li></ol>', 20, '2026-05-01 03:32:23.084429+00'),
(21, 13, 'Pembayaran via Atm', '<ol><li>Masukkan kartu ATM Anda</li><li>Pilih bahasa</li><li>Masukkan PIN ATM Anda</li><li>Pilih menu Transfer lalu pilih CIMB Niaga Lainnya</li><li>Masukkan Nomor Virtual Account Anda pada menu Input Baru</li><li>Masukkan jumlah pembayaran yang sesuai</li><li>Konfirmasi transaksi dan masukkan password Anda</li><li>Transaksi Anda selesai</li></ol>', 21, '2026-05-01 03:32:23.084429+00'),
(22, 13, 'Pembayaran via Ibanking', '<ol><li>Buka alamat https://www.octoclicks.co.id/login dan tekan Enter</li><li>Masukkan User ID dan Password</li><li>Pilih menu Transfer lalu pilih CIMB Niaga Lainnya</li><li>Masukkan Nomor Virtual Account Anda pada menu Input Baru</li><li>Masukkan jumlah pembayaran yang sesuai</li><li>Konfirmasi transaksi dan masukkan password Anda</li><li>Transaksi Anda selesai</li></ol>', 22, '2026-05-01 03:32:23.084429+00'),
(23, 14, 'Pembayaran via Mdin', '<ol><li>Login ke aplikasi MDIN mobile banking</li><li>Pilih menu Beli/Bayar > Beli/Bayar Tagihan > Virtual Account</li><li>Masukkan nomor virtual account (contoh: 9010001112341234234)</li><li>Masukkan jumlah pembayaran</li><li>Konfirmasi detail pembayaran</li><li>Masukkan PIN</li></ol>', 23, '2026-05-01 03:32:23.084429+00'),
(24, 14, 'Pembayaran via Ibanking', '<ol><li>Login ke Muamalat Internet Banking</li><li>Klik menu Pembayaran > Virtual Account</li><li>Masukkan nomor virtual account (contoh: 9010001112341234234)</li><li>Masukkan jumlah pembayaran</li><li>Konfirmasi detail pembayaran</li><li>Masukkan PIN</li></ol>', 24, '2026-05-01 03:32:23.084429+00'),
(25, 14, 'Pembayaran via Atm', '<ol><li>Masukkan kartu ATM</li><li>Pilih bahasa</li><li>Masukkan PIN ATM</li><li>Pilih menu Pembayaran > Virtual Account</li><li>Masukkan nomor virtual account (contoh: 9010001112341234234)</li><li>Masukkan jumlah pembayaran</li><li>Konfirmasi detail pembayaran</li><li>Masukkan PIN</li></ol>', 25, '2026-05-01 03:32:23.084429+00'),
(26, 15, 'Pembayaran via Mobile', '<ol><li>Login ke aplikasi Permata mobile</li><li>Pilih menu Pembayaran Tagihan > Virtual Account</li><li>Masukkan nomor virtual account (contoh: 729361827494)</li><li>Masukkan token autentikasi</li></ol>', 26, '2026-05-01 03:32:23.084429+00'),
(27, 15, 'Pembayaran via Ibanking', '<ol><li>Login ke https://www.permatanet.com</li><li>Pilih menu Pembayaran Tagihan > Virtual Account</li><li>Masukkan nomor virtual account (contoh: 729361827494)</li><li>Konfirmasi detail pembayaran</li><li>Masukkan kode respon token SMS</li></ol>', 27, '2026-05-01 03:32:23.084429+00'),
(28, 15, 'Pembayaran via Atm', '<ol><li>Masukkan kartu ATM</li><li>Pilih bahasa</li><li>Masukkan PIN ATM</li><li>Pilih menu Transaksi Lainnya > Pembayaran > Pembayaran Lainnya > Virtual Account</li><li>Masukkan nomor virtual account (contoh: 729361827494)</li><li>Konfirmasi detail pembayaran</li><li>Masukkan PIN</li></ol>', 28, '2026-05-01 03:32:23.084429+00'),
(29, 16, 'Pembayaran via Note', '<ol><li>Anda dapat melakukan pembayaran di Alfamart Group (Alfamart, Alfamidi, Dan+Dan, Lawson).</li><li>Pembayaran di bawah Rp 2,5 Juta tersedia di Alfamart, Alfamidi, Dan+Dan, Lawson.</li><li>Pembayaran di atas Rp 2,5 Juta tidak tersedia di Alfamidi.</li><li>Kunjungi gerai ALFAMART terdekat sebelum batas waktu kode pembayaran/barcode habis</li><li>Beri tahu kasir bahwa Anda ingin melakukan pembayaran ke "[Nama Merchant]" via Xendit atau biarkan mereka memindai barcode di atas</li><li>Tunjukkan kode pembayaran/barcode ke kasir dan konfirmasi bahwa jumlahnya sudah benar</li><li>Informasikan kepada kasir jika Anda ingin membayar menggunakan Tunai saja, atau kombinasi Tunai dan Kartu Debit/Prabayar atau E-wallet.</li><li>Jumlah maksimum yang diizinkan bayar dengan Tunai adalah Rp 2,5 Juta, sisanya harus dikombinasikan menggunakan Kartu Debit/Prabayar atau E-wallet.</li><li>Lanjutkan proses pembayaran dengan jumlah yang tertera pada kode pembayaran/barcode Anda</li></ol>', 29, '2026-05-01 03:32:23.084429+00'),
(30, 1, 'Pembayaran via Gojek / GoPay', '<ol><li>Buka aplikasi Gojek / GoPay Anda.</li><li>Pilih menu <strong>Bayar / Scan</strong>.</li><li>Scan QR Code yang tampil di layar atau upload dari galeri.</li></ol>', 30, '2026-05-01 03:32:23.084429+00'),
(31, 6, 'Pembayaran via Shopee', '<ol><li>Buka aplikasi Shopee Anda.</li><li>Pilih menu <strong>Bayar / Scan</strong>.</li><li>Scan QR Code yang tampil di layar atau upload dari galeri.</li></ol>', 31, '2026-05-01 03:32:23.084429+00'),
(32, 7, 'Pembayaran via DANA', '<ol><li>Buka aplikasi DANA Anda.</li><li>Pilih menu <strong>Bayar / Scan</strong>.</li><li>Scan QR Code yang tampil di layar atau upload dari galeri.</li></ol>', 32, '2026-05-01 03:32:23.084429+00'),
(33, 8, 'Pembayaran via LinkAja', '<ol><li>Buka aplikasi LinkAja Anda.</li><li>Pilih menu <strong>Bayar / Scan</strong>.</li><li>Scan QR Code yang tampil di layar atau upload dari galeri.</li></ol>', 33, '2026-05-01 03:32:23.084429+00'),
(34, 5, 'Pembayaran via QRIS', '<ol><li>Buka aplikasi pembayaran pilihan Anda (GoPay, OVO, DANA, LinkAja, BCA Mobile, dll).</li><li>Pilih menu <strong>Scan / Bayar</strong>.</li><li>Scan QR Code yang tampil di layar.</li><li>Konfirmasi pembayaran dan masukkan PIN Anda.</li></ol>', 34, '2026-05-01 03:32:23.084429+00'),
(35, 18, 'Instruksi Transfer Manual BCA', '<ol><li>Transfer sesuai nominal (hingga 3 digit terakhir) ke rekening berikut:</li><li><strong>Bank BCA: 1234567890</strong></li><li><strong>Atas Nama: Yayasan Peduli Sesama</strong></li><li>Simpan bukti transfer Anda.</li><li>Konfirmasi pembayaran melalui WhatsApp atau unggah bukti di halaman status.</li></ol>', 35, '2026-05-01 03:32:23.084429+00'),
(36, 19, 'Instruksi Transfer Manual Mandiri', '<ol><li>Transfer sesuai nominal (hingga 3 digit terakhir) ke rekening berikut:</li><li><strong>Bank Mandiri: 9876543210</strong></li><li><strong>Atas Nama: Yayasan Peduli Sesama</strong></li><li>Simpan bukti transfer Anda.</li><li>Konfirmasi pembayaran melalui WhatsApp atau unggah bukti di halaman status.</li></ol>', 36, '2026-05-01 03:32:23.084429+00');

ALTER TABLE "public"."payment_instructions" ADD FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE CASCADE;
