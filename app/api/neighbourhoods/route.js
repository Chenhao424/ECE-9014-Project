import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
        return NextResponse.json([]);
    }

    try {
        const [rows] = await pool.query(`
            SELECT DISTINCT neighbourhood 
            FROM Listings 
            WHERE neighbourhood LIKE ? 
            LIMIT 5
        `, [`%${query}%`]);

        return NextResponse.json(rows.map(row => row.neighbourhood));
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
