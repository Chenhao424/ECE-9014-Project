'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const userData = JSON.parse(userStr);
            setUser(userData);
            fetchBookings(userData.id);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchBookings = async (userId) => {
        try {
            const res = await fetch(`/api/bookings?guestId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        try {
            const res = await fetch('/api/bookings/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId })
            });

            if (res.ok) {
                alert('Booking cancelled successfully');
                fetchBookings(user.id); 
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to cancel booking');
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('An error occurred');
        }
    };

    if (!user) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Please <Link href="/login" style={{ color: '#ff385c' }}>login</Link> to view your bookings.</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none' }}>Airbnb Toronto</Link>
                <nav>
                    <span>Welcome, <b>{user.username}</b></span>
                </nav>
            </header>

            <h1>My Bookings</h1>

            {loading ? (
                <p>Loading bookings...</p>
            ) : bookings.length === 0 ? (
                <p>You have no bookings yet.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {bookings.map((booking) => (
                        <div key={booking.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', display: 'flex', gap: '20px', background: 'white' }}>
                            <img
                                src={booking.picture_url}
                                alt={booking.listing_name}
                                style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 10px 0' }}>
                                    <Link href={`/listings/${booking.listing_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        {booking.listing_name}
                                    </Link>
                                </h3>
                                <p style={{ margin: '5px 0', color: '#666' }}>
                                    {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                                </p>
                                <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Total: ${booking.total_price}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        background: booking.status === 'confirmed' ? '#e6fffa' : booking.status === 'cancelled' ? '#f3f4f6' : '#fff5f5',
                                        color: booking.status === 'confirmed' ? '#047857' : booking.status === 'cancelled' ? '#374151' : '#c53030'
                                    }}>
                                        {booking.status.toUpperCase()}
                                    </span>

                                    {booking.status !== 'cancelled' && (
                                        (() => {
                                            const now = new Date();
                                            const startDate = new Date(booking.start_date);
                                            const diffTime = startDate - now;
                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                            if (diffDays > 3) {
                                                return (
                                                    <button
                                                        onClick={() => handleCancel(booking.id)}
                                                        style={{
                                                            padding: '5px 10px',
                                                            borderRadius: '4px',
                                                            border: '1px solid #c53030',
                                                            background: 'white',
                                                            color: '#c53030',
                                                            cursor: 'pointer',
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        Cancel Booking
                                                    </button>
                                                );
                                            }
                                            return null;
                                        })()
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
