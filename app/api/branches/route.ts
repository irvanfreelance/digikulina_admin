import { Pool } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of searchParams.entries()) {
        conditions.push(`"${key}" = $${paramIndex}`);
        values.push(value);
        paramIndex++;
    }

    let query = `SELECT * FROM "branches"`;
    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
    }
    query += ' ORDER BY id DESC LIMIT 1000';

    const { rows } = await pool.query(query, values);
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error(`GET /api/branches Error:`, error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const columns = Object.keys(body);
    const values = Object.values(body);

    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const columnsString = columns.map(c => `"${c}"`).join(', ');

    const query = `INSERT INTO "branches" (${columnsString}) VALUES (${placeholders}) RETURNING *`;
    const { rows } = await pool.query(query, values);

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error(`POST /api/branches Error:`, error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required for updates' }, { status: 400 });
    }

    const columns = Object.keys(updateData);
    const values = Object.values(updateData);

    const setString = columns.map((c, i) => `"${c}" = $${i + 1}`).join(', ');
    values.push(id); // ID is the last parameter

    const query = `UPDATE "branches" SET ${setString} WHERE id = $${values.length} RETURNING *`;
    const { rows } = await pool.query(query, values);

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error(`PUT /api/branches Error:`, error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required for deletion' }, { status: 400 });
    }

    const query = `DELETE FROM "branches" WHERE id = $1 RETURNING *`;
    const { rows } = await pool.query(query, [id]);

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error(`DELETE /api/branches Error:`, error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
