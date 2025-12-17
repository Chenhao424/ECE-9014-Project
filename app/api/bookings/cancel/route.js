import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function POST(request) {
    try {
        const { bookingId } = await request.json();

        if (!bookingId) {
            return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
        }

        const connection = await pool.getConnection();

        try {
            
            const [rows] = await connection.execute(
                'SELECT start_date, status FROM Bookings WHERE id = ?',
                [bookingId]
            );

            if (rows.length === 0) {
                connection.release();
                return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
            }

            const booking = rows[0];

            if (booking.status === 'cancelled') {
                connection.release();
                return NextResponse.json({ error: 'Booking is already cancelled' }, { status: 400 });
            }

            
            const now = new Date();
            const startDate = new Date(booking.start_date);

            
            const diffTime = startDate.getTime() - now.getTime();
            
            const diffDays = diffTime / (1000 * 3600 * 24);

            if (diffDays <= 3) {
                connection.release();
                return NextResponse.json({ error: 'Cancellation is only allowed more than 3 days before check-in' }, { status: 400 });
            }

            
            await connection.execute(
                'UPDATE Bookings SET status = ? WHERE id = ?',
                ['cancelled', bookingId]
            );

            connection.release();
            return NextResponse.json({ message: 'Booking cancelled successfully' });

        } catch (error) {
            connection.release();
            console.error('Database error:', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }
    } catch (error) {
        console.error('Request error:', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
