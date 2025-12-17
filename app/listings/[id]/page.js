'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

export default function ListingDetail() {
    const { id } = useParams();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingDates, setBookingDates] = useState(() => {
        const toLocalISO = (date) => {
            const offset = date.getTimezoneOffset() * 60000;
            return new Date(date.getTime() - offset).toISOString().split('T')[0];
        };
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        return { start: toLocalISO(today), end: toLocalISO(tomorrow) };
    });
    const [user, setUser] = useState(null);
    const [showAllReviews, setShowAllReviews] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
        if (id) {
            fetchListing();
        }
    }, [id]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    const fetchListing = async () => {
        try {
            const res = await fetch(`/api/listings/${id}`);
            if (res.ok) {
                const data = await res.json();
                setListing(data);
            }
        } catch (error) {
            console.error('Failed to fetch listing:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();

        const userStr = localStorage.getItem('user');
        if (!userStr) {
            alert('Please login to book');
            return;
        }
        const user = JSON.parse(userStr);

        if (!bookingDates.start || !bookingDates.end) {
            alert('Please select dates');
            return;
        }

        
        const start = new Date(bookingDates.start);
        const end = new Date(bookingDates.end);
        const days = (end - start) / (1000 * 60 * 60 * 24);

        if (days <= 0) {
            alert('Invalid dates');
            return;
        }

        const totalPrice = days * listing.price;

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listingId: listing.id,
                    guestId: user.id,
                    startDate: bookingDates.start,
                    endDate: bookingDates.end,
                    totalPrice
                })
            });

            if (res.ok) {
                alert('Booking confirmed!');
                setBookingDates({ start: '', end: '' });
            } else {
                const data = await res.json();
                alert(data.error || 'Booking failed');
            }
        } catch (err) {
            alert('An error occurred');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!listing) return <p>Listing not found</p>;

    const radarData = [
        { subject: 'Accuracy', A: listing.review_scores_accuracy, fullMark: 5 },
        { subject: 'Cleanliness', A: listing.review_scores_cleanliness, fullMark: 5 },
        { subject: 'Check-in', A: listing.review_scores_checkin, fullMark: 5 },
        { subject: 'Communication', A: listing.review_scores_communication, fullMark: 5 },
        { subject: 'Location', A: listing.review_scores_location, fullMark: 5 },
        { subject: 'Value', A: listing.review_scores_value, fullMark: 5 },
    ];

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <a href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none' }}>Airbnb Toronto</a>
                <nav style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {user ? (
                        <>
                            <span>Welcome, <b>{user.username}</b></span>
                            <a href="/bookings" style={{ textDecoration: 'underline' }}>My Bookings</a>
                            <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Logout</button>
                        </>
                    ) : (
                        <>
                            <a href="/login">Login</a>
                            <a href="/register">Register</a>
                        </>
                    )}
                </nav>
            </header>

            <Link href="/" style={{ display: 'inline-block', marginBottom: '10px', color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
                &larr; Back to Home
            </Link>

            <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>{listing.name}</h1>
            <p style={{ color: '#666', marginBottom: '20px' }}>{listing.neighbourhood}</p>

            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Link href={`/hosts/${listing.host_id}`}>
                    <img
                        src={listing.host_picture_url}
                        alt={listing.host_name}
                        style={{ width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer' }}
                    />
                </Link>
                <div>
                    <h3 style={{ margin: 0 }}>
                        <Link href={`/hosts/${listing.host_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            Hosted by {listing.host_name}
                        </Link>
                    </h3>
                    {listing.is_superhost === 1 && <span style={{ color: '#666', fontSize: '0.9rem' }}>Superhost</span>}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <img
                    src={listing.picture_url}
                    alt={listing.name}
                    style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '10px' }}
                />
                <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ marginTop: 0 }}>${listing.price} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/ night</span></h2>
                    <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Check-in</label>
                            <input
                                type="date"
                                value={bookingDates.start}
                                onChange={(e) => setBookingDates({ ...bookingDates, start: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Check-out</label>
                            <input
                                type="date"
                                value={bookingDates.end}
                                onChange={(e) => setBookingDates({ ...bookingDates, end: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <button
                            type="submit"
                            style={{ background: '#ff385c', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Reserve
                        </button>
                    </form>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                <div>
                    <h2>About this place</h2>
                    <p style={{ lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: listing.description }}></p>

                    <h3>Amenities</h3>
                    <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingLeft: '20px' }}>
                        {listing.amenities.slice(0, 10).map((amenity, index) => (
                            <li key={index}>{amenity}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <div>
                        <h2>Reviews</h2>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                            <span style={{ fontSize: '3rem', fontWeight: 'bold', marginRight: '15px' }}>{listing.review_scores_rating}</span>
                            <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Overall Rating</div>
                                <div style={{ color: '#666' }}>{listing.number_of_reviews} reviews</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'center' }}>
                            <div style={{ height: '300px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                                        <Radar name="Rating" dataKey="A" stroke="#ff385c" fill="#ff385c" fillOpacity={0.6} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                                {radarData.map((item) => (
                                    <div key={item.subject} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                                        <span>{item.subject}</span>
                                        <span style={{ fontWeight: 'bold' }}>{item.A}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: '40px' }}>
                            <h3>Recent Reviews</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                {listing.reviews && listing.reviews.length > 0 ? (
                                    (showAllReviews ? listing.reviews : listing.reviews.slice(0, 4)).map((review) => (
                                        <div key={review.id} style={{ marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                                <div style={{ fontWeight: 'bold', marginRight: '10px' }}>{review.reviewer_name}</div>
                                                <div style={{ color: '#666', fontSize: '0.9rem' }}>{new Date(review.date).toLocaleDateString()}</div>
                                            </div>
                                            <p style={{ margin: 0, lineHeight: '1.5', color: '#484848' }} dangerouslySetInnerHTML={{ __html: review.comments }}></p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No reviews available.</p>
                                )}
                            </div>
                            {listing.reviews && listing.reviews.length > 4 && (
                                <button
                                    onClick={() => setShowAllReviews(!showAllReviews)}
                                    style={{
                                        marginTop: '20px',
                                        padding: '10px 20px',
                                        background: 'white',
                                        border: '1px solid #000',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {showAllReviews ? 'Show fewer reviews' : `Show all ${listing.reviews.length} reviews`}
                                </button>
                            )}
                        </div>          </div>


                </div>
            </div>
        </div>
    );
}
