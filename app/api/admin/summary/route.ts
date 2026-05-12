import { Pool } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(request: Request) {
  try {
    // 1. Overall Metrics
    const metricsResult = await pool.query(`
      SELECT 
        COUNT(id) as total_orders, 
        COALESCE(SUM(total_amount), 0) as total_revenue, 
        COALESCE(AVG(total_amount), 0) as aov 
      FROM "orders" 
      WHERE payment_status = 'paid'
    `);
    
    const customersResult = await pool.query(`
      SELECT COUNT(id) as total_customers FROM "customers"
    `);

    const totalOrders = parseInt(metricsResult.rows[0].total_orders || '0');
    const totalRevenue = parseFloat(metricsResult.rows[0].total_revenue || '0');
    const aov = parseFloat(metricsResult.rows[0].aov || '0');
    const totalCustomers = parseInt(customersResult.rows[0].total_customers || '0');

    // 2. Revenue Trend (Last 30 days)
    const trendResult = await pool.query(`
      SELECT 
        TO_CHAR(DATE(created_at), 'DD Mon') as date,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(id) as orders
      FROM "orders"
      WHERE payment_status = 'paid' AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `);

    // 3. Orders by Type
    const typeResult = await pool.query(`
      SELECT 
        order_type as name,
        COUNT(id) as value
      FROM "orders"
      WHERE payment_status = 'paid'
      GROUP BY order_type
    `);

    // 4. Top 5 Best Menu
    const topMenuResult = await pool.query(`
      SELECT 
        p.name,
        SUM(oi.quantity) as sold
      FROM "order_items" oi
      JOIN "products" p ON oi.product_id = p.id
      JOIN "orders" o ON oi.order_id = o.id
      WHERE o.payment_status = 'paid'
      GROUP BY p.id, p.name
      ORDER BY sold DESC
      LIMIT 5
    `);

    // 5. Top 5 Branches
    const topBranchResult = await pool.query(`
      SELECT 
        b.name,
        COALESCE(SUM(o.total_amount), 0) as revenue
      FROM "orders" o
      JOIN "branches" b ON o.branch_id = b.id
      WHERE o.payment_status = 'paid'
      GROUP BY b.id, b.name
      ORDER BY revenue DESC
      LIMIT 5
    `);

    return NextResponse.json({
      metrics: {
        totalOrders,
        totalRevenue,
        aov,
        totalCustomers
      },
      trend: trendResult.rows,
      orderTypes: typeResult.rows,
      topMenu: topMenuResult.rows.map(row => ({ name: row.name, sold: parseInt(row.sold || '0') })),
      topBranches: topBranchResult.rows.map(row => ({ name: row.name, revenue: parseFloat(row.revenue || '0') }))
    });

  } catch (error: any) {
    console.error(`GET /api/admin/summary Error:`, error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
