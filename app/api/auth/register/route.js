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
        const { username, email, password, phone } = await request.json();

        if (!username || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        
        const [existing] = await pool.query('SELECT id FROM Users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        
        const [result] = await pool.query(
            'INSERT INTO Users (username, email, password_hash, phone) VALUES (?, ?, ?, ?)',
            [username, email, password, phone]
        );

        return NextResponse.json({ message: 'User registered successfully', userId: result.insertId });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
