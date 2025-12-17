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
    
    const [listings] = await pool.query(`
      SELECT l.*, h.name as host_name, h.picture_url as host_picture_url, h.is_superhost, h.response_rate, h.response_time
      FROM Listings l
      JOIN Hosts h ON l.host_id = h.id
      WHERE l.id = ?
    `, [id]);

    if (listings.length === 0) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const listing = listings[0];

    
    const [amenities] = await pool.query(`
      SELECT a.name
      FROM Amenities a
      JOIN Listings_Amenities la ON a.id = la.amenity_id
      WHERE la.listing_id = ?
    `, [id]);

    
    const [photos] = await pool.query(`
      SELECT photo_url FROM Listing_Photos WHERE listing_id = ?
    `, [id]);

    
    const [reviews] = await pool.query(`
      SELECT id, date, reviewer_name, comments
      FROM Reviews
      WHERE listing_id = ?
      ORDER BY date DESC
      LIMIT 20
    `, [id]);

    
    const allPhotos = [listing.picture_url, ...photos.map(p => p.photo_url)].filter(Boolean);

    return NextResponse.json({
      ...listing,
      amenities: amenities.map(a => a.name),
      photos: allPhotos,
      reviews: reviews 
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
