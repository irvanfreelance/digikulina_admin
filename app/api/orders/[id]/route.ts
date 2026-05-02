import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const paramsAwaited = await params;
        const orderId = parseInt(paramsAwaited.id, 10);
        
        if (isNaN(orderId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

        // 1. Get main order data
        const orderQuery = `
            SELECT o.*, pm.name as payment_method_name 
            FROM orders o
            LEFT JOIN payment_methods pm ON o.payment_method_id = pm.id
            WHERE o.id = $1
        `;
        const { rows: orderRows } = await pool.query(orderQuery, [orderId]);
        if (orderRows.length === 0) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        
        const order = orderRows[0];
        
        // 2. Get order items
        const itemsQuery = `
            SELECT oi.*, p.name as product_name
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = $1
        `;
        const { rows: itemsRows } = await pool.query(itemsQuery, [orderId]);
        
        // 3. Get modifiers for these items
        if (itemsRows.length > 0) {
            const itemIds = itemsRows.map((i: any) => i.id);
            const modifiersQuery = `
                SELECT * FROM order_item_modifiers
                WHERE order_item_id = ANY($1::int[])
            `;
            const { rows: modifierRows } = await pool.query(modifiersQuery, [itemIds]);
            
            order.items = itemsRows.map((item: any) => ({
                ...item,
                modifiers: modifierRows.filter((m: any) => m.order_item_id === item.id)
            }));
        } else {
            order.items = [];
        }

        return NextResponse.json(order);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
