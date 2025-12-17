-- Users (Guests)
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hosts
CREATE TABLE IF NOT EXISTS Hosts (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    url TEXT,
    since DATE,
    location VARCHAR(255),
    about TEXT,
    response_time VARCHAR(100),
    response_rate VARCHAR(50),
    is_superhost BOOLEAN,
    thumbnail_url TEXT,
    picture_url TEXT,
    listings_count INT,
    total_listings_count INT,
    identity_verified BOOLEAN
);

-- Listings
CREATE TABLE IF NOT EXISTS Listings (
    id INT PRIMARY KEY,
    listing_url TEXT,
    name VARCHAR(255),
    description TEXT,
    neighborhood_overview TEXT,
    picture_url TEXT,
    host_id INT,
    neighbourhood VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    property_type VARCHAR(100),
    room_type VARCHAR(100),
    accommodates INT,
    bathrooms_text VARCHAR(100),
    bedrooms INT,
    beds INT,
    price DECIMAL(10, 2),
    minimum_nights INT,
    maximum_nights INT,
    number_of_reviews INT,
    review_scores_rating DECIMAL(3, 2),
    review_scores_accuracy DECIMAL(3, 2),
    review_scores_cleanliness DECIMAL(3, 2),
    review_scores_checkin DECIMAL(3, 2),
    review_scores_communication DECIMAL(3, 2),
    review_scores_location DECIMAL(3, 2),
    review_scores_value DECIMAL(3, 2),
    FOREIGN KEY (host_id) REFERENCES Hosts(id)
);

-- Amenities
CREATE TABLE IF NOT EXISTS Amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE
);

-- Listings_Amenities
CREATE TABLE IF NOT EXISTS Listings_Amenities (
    listing_id INT,
    amenity_id INT,
    PRIMARY KEY (listing_id, amenity_id),
    FOREIGN KEY (listing_id) REFERENCES Listings(id),
    FOREIGN KEY (amenity_id) REFERENCES Amenities(id)
);

-- Listing_Photos
CREATE TABLE IF NOT EXISTS Listing_Photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT,
    photo_url TEXT,
    FOREIGN KEY (listing_id) REFERENCES Listings(id)
);

-- Bookings
CREATE TABLE IF NOT EXISTS Bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT,
    guest_id INT,
    start_date DATE,
    end_date DATE,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    total_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES Listings(id),
    FOREIGN KEY (guest_id) REFERENCES Users(id)
);

-- Reviews
CREATE TABLE IF NOT EXISTS Reviews (
    id BIGINT PRIMARY KEY,
    listing_id INT,
    date DATE,
    reviewer_id INT,
    reviewer_name VARCHAR(255),
    comments TEXT,
    FOREIGN KEY (listing_id) REFERENCES Listings(id)
);
