'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function HostDetail() {
    const { id } = useParams();
    const [host, setHost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchHost();
        }
    }, [id]);

    const fetchHost = async () => {
        try {
            const res = await fetch(`/api/hosts/${id}`);
            if (res.ok) {
                const data = await res.json();
                setHost(data);
            }
        } catch (error) {
            console.error('Failed to fetch host:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!host) return <p>Host not found</p>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <header style={{ marginBottom: '30px' }}>
                <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none' }}>Airbnb Toronto</Link>
            </header>

            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', marginBottom: '40px' }}>
                <img
                    src={host.picture_url}
                    alt={host.name}
                    style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                    <h1 style={{ margin: '0 0 10px 0' }}>{host.name}</h1>
                    {host.is_superhost === 1 && (
                        <span style={{ background: '#f7f7f7', padding: '5px 10px', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 'bold' }}>🏆 Superhost</span>
                    )}
                    <p style={{ color: '#666', marginTop: '10px' }}>{host.location}</p>
                    <p>Response rate: {host.response_rate}</p>
                    <p>Response time: {host.response_time}</p>
                </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h2>About</h2>
                <p style={{ lineHeight: '1.6' }}>{host.about}</p>
            </div>

            <div>
                <h2>{host.name}'s Listings</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                    {host.listings.map(listing => (
                        <Link href={`/listings/${listing.id}`} key={listing.id}>
                            <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                                <img src={listing.picture_url} alt={listing.name} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                                <div style={{ padding: '10px' }}>
                                    <h4 style={{ margin: '0 0 5px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{listing.name}</h4>
                                    <p style={{ margin: 0 }}>${listing.price} / night</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
