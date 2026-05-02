import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';
import { renderToStream } from '@react-pdf/renderer';
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const styles = StyleSheet.create({
    page: { padding: 36, fontFamily: 'Helvetica', backgroundColor: '#fff' },
    // Header
    headerBox: { alignItems: 'center', marginBottom: 16 },
    brandName: { fontSize: 22, fontWeight: 'bold', color: '#be185d', letterSpacing: 1 },
    tagline: { fontSize: 9, color: '#94a3b8', marginTop: 2 },
    divider: { borderBottom: '1 solid #e2e8f0', marginVertical: 10 },
    // Order Info Grid
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    infoLabel: { fontSize: 9, color: '#94a3b8', marginBottom: 1 },
    infoValue: { fontSize: 11, fontWeight: 'bold', color: '#1e293b' },
    infoBlock: { flex: 1 },
    // Table
    tableHeader: { flexDirection: 'row', backgroundColor: '#f8fafc', borderRadius: 4, paddingVertical: 6, paddingHorizontal: 4, marginTop: 12, marginBottom: 4 },
    tableHeaderCell: { fontSize: 8, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' },
    tableRow: { flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 4, borderBottom: '1 solid #f1f5f9' },
    colItem: { flex: 3 },
    colQty: { flex: 0.8, textAlign: 'center' },
    colPrice: { flex: 1.5, textAlign: 'right' },
    colTotal: { flex: 1.5, textAlign: 'right' },
    itemName: { fontSize: 11, fontWeight: 'bold', color: '#1e293b' },
    itemModifier: { fontSize: 8.5, color: '#94a3b8', marginTop: 1.5 },
    modifierPrice: { color: '#db2777' },
    cellText: { fontSize: 11, color: '#475569' },
    cellBold: { fontSize: 11, fontWeight: 'bold', color: '#1e293b' },
    // Summary
    summaryBox: { marginTop: 10, borderTop: '1 solid #e2e8f0', paddingTop: 10 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    summaryLabel: { fontSize: 10, color: '#64748b' },
    summaryValue: { fontSize: 10, color: '#64748b' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1 dashed #cbd5e1' },
    totalLabel: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
    totalValue: { fontSize: 14, fontWeight: 'bold', color: '#be185d' },
    // Footer
    footer: { marginTop: 28, alignItems: 'center' },
    footerText: { fontSize: 9, color: '#94a3b8', marginBottom: 2 },
    paymentBadge: { backgroundColor: '#f0fdf4', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 3, marginTop: 6 },
    paymentText: { fontSize: 10, fontWeight: 'bold', color: '#16a34a' },
});

const ReceiptDocument = ({ order }: { order: any }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.headerBox}>
                <Text style={styles.brandName}>DIGIKULINA POS</Text>
                <Text style={styles.tagline}>Struk Pembayaran / Kuitansi Resmi</Text>
            </View>
            <View style={styles.divider} />

            {/* Order Info */}
            <View style={styles.infoRow}>
                <View style={styles.infoBlock}>
                    <Text style={styles.infoLabel}>No. Pesanan</Text>
                    <Text style={styles.infoValue}>{order.order_number}</Text>
                </View>
                <View style={styles.infoBlock}>
                    <Text style={styles.infoLabel}>Tanggal</Text>
                    <Text style={styles.infoValue}>{new Date(order.created_at).toLocaleString('id-ID')}</Text>
                </View>
            </View>
            <View style={[styles.infoRow, { marginTop: 8 }]}>
                <View style={styles.infoBlock}>
                    <Text style={styles.infoLabel}>Pelanggan</Text>
                    <Text style={styles.infoValue}>{order.customer_name || 'Tamu'}</Text>
                </View>
                <View style={styles.infoBlock}>
                    <Text style={styles.infoLabel}>Tipe Pesanan</Text>
                    <Text style={styles.infoValue}>{order.order_type.toUpperCase()}</Text>
                </View>
            </View>
            <View style={styles.divider} />

            {/* Items Table Header */}
            <View style={styles.tableHeader}>
                <View style={styles.colItem}><Text style={styles.tableHeaderCell}>Item</Text></View>
                <View style={styles.colQty}><Text style={[styles.tableHeaderCell, { textAlign: 'center' }]}>Qty</Text></View>
                <View style={styles.colPrice}><Text style={[styles.tableHeaderCell, { textAlign: 'right' }]}>Harga Satuan</Text></View>
                <View style={styles.colTotal}><Text style={[styles.tableHeaderCell, { textAlign: 'right' }]}>Total</Text></View>
            </View>

            {/* Items Table Rows */}
            {order.items.map((item: any, i: number) => (
                <View key={i} style={styles.tableRow}>
                    <View style={styles.colItem}>
                        <Text style={styles.itemName}>{item.product_name}</Text>
                        {item.modifiers && item.modifiers.map((m: any, idx: number) => (
                            <Text key={idx} style={styles.itemModifier}>
                                {'+ '}{m.modifier_name}{m.modifier_price > 0 ? ` (Rp ${Number(m.modifier_price).toLocaleString('id-ID')})` : ''}
                            </Text>
                        ))}
                    </View>
                    <View style={styles.colQty}>
                        <Text style={[styles.cellText, { textAlign: 'center' }]}>{item.quantity}</Text>
                    </View>
                    <View style={styles.colPrice}>
                        <Text style={[styles.cellText, { textAlign: 'right' }]}>Rp {Number(item.final_price).toLocaleString('id-ID')}</Text>
                    </View>
                    <View style={styles.colTotal}>
                        <Text style={[styles.cellBold, { textAlign: 'right' }]}>Rp {Number(item.final_price * item.quantity).toLocaleString('id-ID')}</Text>
                    </View>
                </View>
            ))}

            {/* Summary */}
            <View style={styles.summaryBox}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>Rp {Number(order.subtotal).toLocaleString('id-ID')}</Text>
                </View>
                {Number(order.discount_amount) > 0 && (
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: '#db2777' }]}>Diskon</Text>
                        <Text style={[styles.summaryValue, { color: '#db2777' }]}>-Rp {Number(order.discount_amount).toLocaleString('id-ID')}</Text>
                    </View>
                )}
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Pajak & Layanan</Text>
                    <Text style={styles.summaryValue}>Rp {Number(order.tax_fee).toLocaleString('id-ID')}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>TOTAL BAYAR</Text>
                    <Text style={styles.totalValue}>Rp {Number(order.total_amount).toLocaleString('id-ID')}</Text>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.paymentBadge}>
                    <Text style={styles.paymentText}>✓ Dibayar via {order.payment_method_name || 'Kasir'}</Text>
                </View>
                <Text style={[styles.footerText, { marginTop: 12 }]}>Terima kasih atas kunjungan Anda!</Text>
                <Text style={styles.footerText}>Simpan struk ini sebagai bukti pembayaran yang sah.</Text>
            </View>
        </Page>
    </Document>
);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const paramsAwaited = await params;
        const orderId = parseInt(paramsAwaited.id, 10);
        if (isNaN(orderId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

        const orderQuery = `
            SELECT o.*, pm.name as payment_method_name 
            FROM orders o
            LEFT JOIN payment_methods pm ON o.payment_method_id = pm.id
            WHERE o.id = $1
        `;
        const { rows: orderRows } = await pool.query(orderQuery, [orderId]);
        if (orderRows.length === 0) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

        const order = orderRows[0];

        const itemsQuery = `
            SELECT oi.*, p.name as product_name
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = $1
        `;
        const { rows: itemsRows } = await pool.query(itemsQuery, [orderId]);

        if (itemsRows.length > 0) {
            const itemIds = itemsRows.map((i: any) => i.id);
            const { rows: modifierRows } = await pool.query(
                `SELECT * FROM order_item_modifiers WHERE order_item_id = ANY($1::int[])`,
                [itemIds]
            );
            order.items = itemsRows.map((item: any) => ({
                ...item,
                modifiers: modifierRows.filter((m: any) => m.order_item_id === item.id)
            }));
        } else {
            order.items = [];
        }

        const stream = await renderToStream(<ReceiptDocument order={order} />);

        return new Response(stream as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="receipt-${order.order_number}.pdf"`
            }
        });
    } catch (error: any) {
        console.error('PDF Gen Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
