import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

export async function GET(request, { params }) {
    const { id } = await params;

    try {
        const [hosts] = await pool.query('SELECT * FROM Hosts WHERE id = ?', [id]);

        if (hosts.length === 0) {
            return NextResponse.json({ error: 'Host not found' }, { status: 404 });
        }

        const host = hosts[0];

        
        const [listings] = await pool.query('SELECT id, name, picture_url, price, review_scores_rating FROM Listings WHERE host_id = ? LIMIT 10', [id]);

        return NextResponse.json({ ...host, listings });

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
