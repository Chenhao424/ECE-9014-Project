'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilters, setActiveFilters] = useState({
        minPrice: '',
        maxPrice: '',
        neighbourhood: '',
        minRating: ''
    });
    const [inputFilters, setInputFilters] = useState({
        minPrice: '',
        maxPrice: '',
        neighbourhood: '',
        minRating: ''
    });
    const [sort, setSort] = useState('price_asc');
    const [user, setUser] = useState(null);
    const [initialLoadDone, setInitialLoadDone] = useState(false);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }

        
        const savedFilters = sessionStorage.getItem('homeFilters');
        const savedSort = sessionStorage.getItem('homeSort');
        const savedPage = sessionStorage.getItem('homePage');

        if (savedFilters) {
            const parsed = JSON.parse(savedFilters);
            setActiveFilters(parsed);
            setInputFilters(parsed);
        }
        if (savedSort) setSort(savedSort);
        if (savedPage) setPage(parseInt(savedPage));

        setInitialLoadDone(true);
    }, []);

    useEffect(() => {
        if (!initialLoadDone) return;

        
        sessionStorage.setItem('homeFilters', JSON.stringify(activeFilters));
        sessionStorage.setItem('homeSort', sort);
        sessionStorage.setItem('homePage', page.toString());

        fetchListings();
    }, [activeFilters, sort, page, initialLoadDone]);

    useEffect(() => {
        if (!loading && initialLoadDone) {
            
            const savedScrollY = sessionStorage.getItem('homeScrollY');
            if (savedScrollY) {
                window.scrollTo(0, parseInt(savedScrollY));
                sessionStorage.removeItem('homeScrollY'); 
            }
        }
    }, [loading, initialLoadDone]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    const fetchListings = async () => {
        setLoading(true);
        const query = new URLSearchParams({
            ...activeFilters,
            sort,
            page: page.toString(),
            limit: '30'
        }).toString();

        try {
            const res = await fetch(`/api/listings?${query}`);
            if (res.ok) {
                const data = await res.json();
                
                if (data.listings && Array.isArray(data.listings)) {
                    setListings(data.listings);
                    setTotalPages(data.pagination.totalPages);
                } else if (Array.isArray(data)) {
                    
                    setListings(data);
                } else {
                    console.error('Invalid data format:', data);
                    setListings([]);
                }
            } else {
                console.error('Failed to fetch listings:', res.statusText);
                setListings([]);
            }
        } catch (error) {
            console.error('Failed to fetch listings:', error);
            setListings([]);
        } finally {
            setLoading(false);
        }
    };

    const [suggestions, setSuggestions] = useState([]);

    const fetchSuggestions = async (query) => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }
        try {
            const res = await fetch(`/api/neighbourhoods?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setSuggestions(data);
            }
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setInputFilters({ ...inputFilters, [name]: value });
        if (name === 'neighbourhood') {
            fetchSuggestions(value);
        }
    };

    const handleSuggestionClick = (value) => {
        setInputFilters({ ...inputFilters, neighbourhood: value });
        setSuggestions([]);
    };

    const handleSearch = () => {
        setActiveFilters(inputFilters);
        setPage(1); 
        setSuggestions([]);
    };

    const handleListingClick = () => {
        sessionStorage.setItem('homeScrollY', window.scrollY.toString());
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            window.scrollTo(0, 0); 
        }
    };

    return (
        <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Airbnb Toronto</h1>
                <nav style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {user ? (
                        <>
                            <span>Welcome, <b>{user.username}</b></span>
                            <Link href="/bookings" style={{ textDecoration: 'underline' }}>My Bookings</Link>
                            <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">Login</Link>
                            <Link href="/register">Register</Link>
                        </>
                    )}
                </nav>
            </header>

            <section style={{ marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                        type="number"
                        name="minPrice"
                        placeholder="Min Price"
                        value={inputFilters.minPrice}
                        onChange={handleFilterChange}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <input
                        type="number"
                        name="maxPrice"
                        placeholder="Max Price"
                        value={inputFilters.maxPrice}
                        onChange={handleFilterChange}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            name="neighbourhood"
                            placeholder="Neighbourhood"
                            value={inputFilters.neighbourhood}
                            onChange={handleFilterChange}
                            autoComplete="off"
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', width: '200px' }}
                        />
                        {suggestions.length > 0 && (
                            <ul style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                background: 'white',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                zIndex: 1000,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                {suggestions.map((s, i) => (
                                    <li
                                        key={i}
                                        onClick={() => handleSuggestionClick(s)}
                                        style={{ padding: '8px', cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? '1px solid #eee' : 'none' }}
                                        onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                                        onMouseLeave={(e) => e.target.style.background = 'white'}
                                    >
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <select
                        name="minRating"
                        value={inputFilters.minRating}
                        onChange={handleFilterChange}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                        <option value="">Any Rating</option>
                        <option value="4.5">4.5+</option>
                        <option value="4.0">4.0+</option>
                        <option value="3.5">3.5+</option>
                    </select>
                    <button
                        onClick={handleSearch}
                        style={{ padding: '8px 16px', background: '#ff385c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Search
                    </button>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', marginLeft: 'auto' }}
                    >
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="rating_desc">Rating: High to Low</option>
                    </select>
                </div>
            </section>

            {loading ? (
                <p>Loading listings...</p>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {listings.map((listing) => (
                            <Link href={`/listings/${listing.id}`} key={listing.id} onClick={handleListingClick}>
                                <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: '100%' }}>
                                    <div style={{ height: '200px', background: '#eee', backgroundImage: `url(${listing.picture_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                    <div style={{ padding: '15px' }}>
                                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>{listing.name}</h3>
                                        <p style={{ margin: '0', color: '#666' }}>{listing.neighbourhood}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 'bold' }}>${listing.price} / night</span>
                                            <span style={{ display: 'flex', alignItems: 'center' }}>★ {listing.review_scores_rating}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '40px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            style={{
                                padding: '8px 16px',
                                cursor: page === 1 ? 'not-allowed' : 'pointer',
                                opacity: page === 1 ? 0.5 : 1,
                                border: '1px solid #ddd',
                                background: 'white',
                                borderRadius: '4px'
                            }}
                        >
                            Previous
                        </button>

                        {(() => {
                            const pageNumbers = [];
                            if (totalPages <= 7) {
                                for (let i = 1; i <= totalPages; i++) {
                                    pageNumbers.push(i);
                                }
                            } else {
                                if (page <= 4) {
                                    for (let i = 1; i <= 5; i++) pageNumbers.push(i);
                                    pageNumbers.push('...');
                                    pageNumbers.push(totalPages);
                                } else if (page >= totalPages - 3) {
                                    pageNumbers.push(1);
                                    pageNumbers.push('...');
                                    for (let i = totalPages - 4; i <= totalPages; i++) pageNumbers.push(i);
                                } else {
                                    pageNumbers.push(1);
                                    pageNumbers.push('...');
                                    pageNumbers.push(page - 1);
                                    pageNumbers.push(page);
                                    pageNumbers.push(page + 1);
                                    pageNumbers.push('...');
                                    pageNumbers.push(totalPages);
                                }
                            }

                            return pageNumbers.map((pageNum, index) => (
                                <button
                                    key={index}
                                    onClick={() => typeof pageNum === 'number' ? handlePageChange(pageNum) : null}
                                    disabled={pageNum === '...'}
                                    style={{
                                        padding: '8px 12px',
                                        cursor: pageNum === '...' ? 'default' : 'pointer',
                                        background: page === pageNum ? '#ff385c' : 'white',
                                        color: page === pageNum ? 'white' : 'black',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontWeight: page === pageNum ? 'bold' : 'normal',
                                        minWidth: '40px'
                                    }}
                                >
                                    {pageNum}
                                </button>
                            ));
                        })()}

                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages}
                            style={{
                                padding: '8px 16px',
                                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                                opacity: page === totalPages ? 0.5 : 1,
                                border: '1px solid #ddd',
                                background: 'white',
                                borderRadius: '4px'
                            }}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </main>
    );
}
