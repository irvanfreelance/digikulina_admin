// @ts-nocheck
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import fs from 'fs';
import path from 'path';
import ws from 'ws';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
neonConfig.webSocketConstructor = ws;

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log('Seeding database from SQL file...');
  try {
    const sqlPath = path.join(process.cwd(), 'refs/digikulina_resto.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    const paymentSqlPath = path.join(process.cwd(), 'refs/paymentxnd.sql');
    const paymentSqlContent = fs.readFileSync(paymentSqlPath, 'utf8');

    // Clear existing data
    console.log('Clearing existing data...');
    await db.execute(`
      TRUNCATE TABLE 
        brands, branches, users, customers, table_areas, tables, reservations,
        categories, products, branch_products, modifier_groups, modifier_options,
        branch_modifier_options, stock_ledgers, coupons, payment_methods,
        payment_instructions, notif_templates, orders, order_items,
        order_item_modifiers, order_reviews, order_status_histories,
        payment_logs, notif_logs, cashier_shifts, kds_stations, product_kds_routes, tax_configs
      RESTART IDENTITY CASCADE;
    `);

    // Extract only the INSERT statements, ignoring schema creation
    const statements1 = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.includes('INSERT INTO') || s.includes('SELECT setval'));

    const statements2 = paymentSqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.includes('INSERT INTO') || s.includes('SELECT setval'));

    const allStatements = [...statements1, ...statements2];

    for (const statement of allStatements) {
      if (statement) {
        await db.execute(statement);
      }
    }
    console.log('✅ Seeding completed successfully.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
