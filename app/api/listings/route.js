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
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const neighbourhood = searchParams.get('neighbourhood');
    const minRating = searchParams.get('minRating');
    const sort = searchParams.get('sort') || 'price_asc';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 30;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, name, picture_url, neighbourhood, price, review_scores_rating FROM Listings WHERE 1=1';
    const params = [];

    if (minPrice) {
        query += ' AND price >= ?';
        params.push(minPrice);
    }
    if (maxPrice) {
        query += ' AND price <= ?';
        params.push(maxPrice);
    }
    if (neighbourhood) {
        query += ' AND neighbourhood LIKE ?';
        params.push(`%${neighbourhood}%`);
    }
    if (minRating) {
        query += ' AND review_scores_rating >= ?';
        params.push(minRating);
    }

    
    const countQuery = query.replace('SELECT id, name, picture_url, neighbourhood, price, review_scores_rating', 'SELECT COUNT(*) as total');

    if (sort === 'price_asc') {
        query += ' ORDER BY price ASC';
    } else if (sort === 'price_desc') {
        query += ' ORDER BY price DESC';
    } else if (sort === 'rating_desc') {
        query += ' ORDER BY review_scores_rating DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    try {
        const [countRows] = await pool.query(countQuery, params.slice(0, -2)); 
        const total = countRows[0].total;
        const totalPages = Math.ceil(total / limit);

        const [rows] = await pool.query(query, params);

        return NextResponse.json({
            listings: rows,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
