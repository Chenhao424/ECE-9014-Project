import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

export async function POST(request) {
    try {
        const { listingId, guestId, startDate, endDate, totalPrice } = await request.json();

        if (!listingId || !guestId || !startDate || !endDate || !totalPrice) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        
        const [conflicts] = await pool.query(`
      SELECT id FROM Bookings 
      WHERE listing_id = ? 
      AND status != 'cancelled'
      AND (
        (start_date <= ? AND end_date >= ?) OR
        (start_date <= ? AND end_date >= ?) OR
        (start_date >= ? AND end_date <= ?)
      )
    `, [listingId, endDate, startDate, endDate, startDate, startDate, endDate]);

        if (conflicts.length > 0) {
            return NextResponse.json({ error: 'Dates are not available' }, { status: 409 });
        }

        
        const [result] = await pool.query(
            'INSERT INTO Bookings (listing_id, guest_id, start_date, end_date, total_price, status) VALUES (?, ?, ?, ?, ?, ?)',
            [listingId, guestId, startDate, endDate, totalPrice, 'confirmed']
        );

        return NextResponse.json({ message: 'Booking confirmed', bookingId: result.insertId });

    } catch (error) {
        console.error('Booking error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get('guestId');

    if (!guestId) {
        return NextResponse.json({ error: 'Missing guestId' }, { status: 400 });
    }

    try {
        const [rows] = await pool.query(`
      SELECT b.*, l.name as listing_name, l.picture_url 
      FROM Bookings b
      JOIN Listings l ON b.listing_id = l.id
      WHERE b.guest_id = ?
      ORDER BY b.created_at DESC
    `, [guestId]);

        return NextResponse.json(rows);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
