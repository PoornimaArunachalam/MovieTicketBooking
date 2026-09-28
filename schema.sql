-- Movie Ticket Booking System MySQL Database Schema & Seed Data
-- Import this file into MySQL Workbench or execute via mysql CLI

CREATE DATABASE IF NOT EXISTS movie_booking_db;
USE movie_booking_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Movies Table
CREATE TABLE IF NOT EXISTS movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    genre VARCHAR(100),
    language VARCHAR(50),
    duration_mins INT,
    rating VARCHAR(10) DEFAULT 'UA',
    poster_url TEXT,
    banner_url TEXT,
    release_date DATE,
    avg_rating DECIMAL(2,1) DEFAULT 4.5,
    status ENUM('now_showing', 'coming_soon') DEFAULT 'now_showing',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Theatres Table
CREATE TABLE IF NOT EXISTS theatres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    facilities VARCHAR(255) DEFAULT '4K Dolby Atmos, Food Court, Parking',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Screens Table
CREATE TABLE IF NOT EXISTS screens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    theatre_id INT NOT NULL,
    screen_name VARCHAR(50) NOT NULL,
    total_seats INT DEFAULT 60,
    FOREIGN KEY (theatre_id) REFERENCES theatres(id) ON DELETE CASCADE
);

-- 5. Shows Table
CREATE TABLE IF NOT EXISTS shows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    theatre_id INT NOT NULL,
    screen_id INT NOT NULL,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    price_regular DECIMAL(10,2) DEFAULT 200.00,
    price_vip DECIMAL(10,2) DEFAULT 350.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (theatre_id) REFERENCES theatres(id) ON DELETE CASCADE,
    FOREIGN KEY (screen_id) REFERENCES screens(id) ON DELETE CASCADE
);

-- 6. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_code VARCHAR(20) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    show_id INT NOT NULL,
    seats TEXT NOT NULL, -- comma separated seat numbers e.g. "A1,A2"
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    final_amount DECIMAL(10,2) NOT NULL,
    coupon_code VARCHAR(50),
    payment_status ENUM('pending', 'completed', 'cancelled') DEFAULT 'completed',
    booking_status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
    qr_code_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE
);

-- 7. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    user_id INT NOT NULL,
    user_name VARCHAR(100),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent INT NOT NULL,
    max_discount DECIMAL(10,2) DEFAULT 100.00,
    min_amount DECIMAL(10,2) DEFAULT 300.00,
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- SEED DATA INSERTS
-- ============================================

-- Users (Default Password for demo users: "password123")
INSERT INTO users (name, email, phone, password, role) VALUES
('System Admin', 'admin@cinepulse.com', '9876543210', 'admin123', 'admin'),
('John Doe', 'john@example.com', '9876543211', 'user123', 'user'),
('Sarah Connor', 'sarah@example.com', '9876543212', 'user123', 'user')
ON DUPLICATE KEY UPDATE id=id;

-- Movies (8 films)
INSERT INTO movies (id, title, description, genre, language, duration_mins, rating, poster_url, banner_url, release_date, avg_rating, status) VALUES
(1, 'Leo (Bloody Sweet)', 'Parthi, a mild-mannered cafe owner in Himachal Pradesh, becomes a local hero after thwarting an armed robbery. Dangerous gangsters arrive claiming he is Leo Das — a long-lost criminal mastermind.', 'Action', 'Tamil', 164, 'UA', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200', '2023-10-19', 4.8, 'now_showing'),
(2, 'GOAT - The Greatest Of All Time', 'Gandhi, an elite operative of the Special Anti-Terrorist Squad, is called back for a critical mission that entangles his past and present against an unstoppable threat.', 'Action', 'Tamil', 179, 'UA', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200', '2024-09-05', 4.7, 'now_showing'),
(3, 'Amaran', 'The heroic true story of Major Mukund Varadarajan, posthumously awarded the Ashok Chakra for exceptional courage during counter-terrorism operations in Kashmir.', 'Action/Drama', 'Tamil', 169, 'UA', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200', '2024-10-31', 4.9, 'now_showing'),
(4, 'Jailer', 'A retired prison warden embarks on a relentless quest to dismantle a powerful criminal syndicate after his police officer son mysteriously vanishes while investigating idol smugglers.', 'Action', 'Tamil', 168, 'UA', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200', '2023-08-10', 4.6, 'now_showing'),
(5, 'Vettaiyan', 'A fierce top cop relentlessly hunts down a serial killer who preys on children, only to discover the killer has a shocking justification that challenges the entire justice system.', 'Action/Thriller', 'Tamil', 170, 'UA', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200', '2024-10-10', 4.7, 'now_showing'),
(6, 'Thangalaan', 'A tribal leader guides a British-led gold expedition deep into the Kolar mountains, but the discovery comes at a devastating cost to his people and way of life.', 'Historical/Drama', 'Tamil', 158, 'UA', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200', '2024-08-15', 4.5, 'now_showing'),
(7, 'Kanguva', 'A warrior in 1697 struggles to save his people from a dark supernatural force; centuries later, a modern shadow hunter uncovers a link to his ancient battle.', 'Fantasy/Action', 'Tamil', 154, 'UA', 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=800', 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=1200', '2024-11-14', 4.4, 'coming_soon'),
(8, 'Coolie', 'A legendary gold smuggler who operates by his own code of honour is pushed to the edge when a devastating betrayal sparks an epic and brutal showdown.', 'Action', 'Tamil', 160, 'UA', 'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=800', 'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=1200', '2025-05-01', 4.9, 'coming_soon')
ON DUPLICATE KEY UPDATE
  title=VALUES(title), description=VALUES(description), genre=VALUES(genre),
  language=VALUES(language), duration_mins=VALUES(duration_mins), rating=VALUES(rating),
  poster_url=VALUES(poster_url), banner_url=VALUES(banner_url),
  release_date=VALUES(release_date), avg_rating=VALUES(avg_rating), status=VALUES(status);

-- Theatres (Rajapalayam & Virudhunagar District, Tamil Nadu)
INSERT INTO theatres (id, name, city, location, facilities) VALUES
(1, 'Sri Valli Cinemas',         'Rajapalayam', 'Gandhi Road, Near Bus Stand, Rajapalayam - 626117',      'Dolby Digital, AC, Parking, Snack Bar'),
(2, 'Rajam Theatre',             'Rajapalayam', 'W.P. Sivapuram Road, Meenakshipuram, Rajapalayam',       'Stereo Sound, AC, Family Balcony, Parking'),
(3, 'Murugan Cinemas',           'Rajapalayam', 'Collectorate Road, Sundaram Nagar, Rajapalayam - 626117','Digital Projection, AC, Snack Counter'),
(4, 'Sri Lakshmi Theatres',      'Srivilliputhur', 'South Car Street, Srivilliputhur - 626125',           'Dolby Atmos, AC, Parking, Food Court'),
(5, 'Vijaya Cinemas',            'Virudhunagar', 'Muthiahpuram Road, Virudhunagar - 626001',              'Digital Projection, AC, Balcony, Snack Bar'),
(6, 'CinePulse Multiplex',       'Virudhunagar', 'Bypass Road, Kamaraj Nagar, Virudhunagar - 626002',     'Dolby Atmos, 4K Laser, AC, Food Court, Parking'),
(7, 'Anand Cinema',              'Aruppukottai', 'Anna Salai, Aruppukottai, Virudhunagar Dist - 626101',  'Stereo AC, Family Seating, Snack Bar'),
(8, 'Kamarajar Talkies',         'Sivakasi',     'Raja Street, Sivakasi, Virudhunagar Dist - 626123',     'Digital Sound, AC, Parking')
ON DUPLICATE KEY UPDATE
  name=VALUES(name), city=VALUES(city), location=VALUES(location), facilities=VALUES(facilities);

-- Screens
INSERT INTO screens (id, theatre_id, screen_name, total_seats) VALUES
(1,  1, 'Screen 1',        80),
(2,  1, 'Screen 2',        60),
(3,  2, 'Screen 1',        70),
(4,  3, 'Screen 1',        60),
(5,  4, 'Screen 1',        90),
(6,  4, 'Screen 2 (Dolby)',70),
(7,  5, 'Screen 1',        80),
(8,  6, 'Screen 1 (4K)',   100),
(9,  6, 'Screen 2',        80),
(10, 7, 'Screen 1',        60),
(11, 8, 'Screen 1',        70)
ON DUPLICATE KEY UPDATE
  theatre_id=VALUES(theatre_id), screen_name=VALUES(screen_name), total_seats=VALUES(total_seats);

-- Shows (Today – all 8 films across Rajapalayam & Virudhunagar theatres)
INSERT INTO shows (id, movie_id, theatre_id, screen_id, show_date, show_time, price_regular, price_vip) VALUES
-- Leo  @ Sri Valli Cinemas, Rajapalayam
(1,  1, 1,  1, CURRENT_DATE(), '09:30:00', 120.00, 200.00),
(2,  1, 1,  1, CURRENT_DATE(), '14:00:00', 130.00, 220.00),
(3,  1, 1,  1, CURRENT_DATE(), '19:00:00', 150.00, 250.00),
-- GOAT @ Rajam Theatre, Rajapalayam
(4,  2, 2,  3, CURRENT_DATE(), '10:00:00', 110.00, 180.00),
(5,  2, 2,  3, CURRENT_DATE(), '14:30:00', 120.00, 200.00),
(6,  2, 2,  3, CURRENT_DATE(), '18:30:00', 140.00, 230.00),
-- Amaran @ Murugan Cinemas, Rajapalayam
(7,  3, 3,  4, CURRENT_DATE(), '10:30:00', 110.00, 190.00),
(8,  3, 3,  4, CURRENT_DATE(), '15:00:00', 120.00, 200.00),
(9,  3, 3,  4, CURRENT_DATE(), '19:30:00', 150.00, 240.00),
-- Jailer @ Sri Lakshmi Theatres, Srivilliputhur
(10, 4, 4,  5, CURRENT_DATE(), '09:00:00', 130.00, 210.00),
(11, 4, 4,  5, CURRENT_DATE(), '13:30:00', 130.00, 210.00),
(12, 4, 4,  5, CURRENT_DATE(), '18:00:00', 160.00, 260.00),
-- Vettaiyan @ Vijaya Cinemas, Virudhunagar
(13, 5, 5,  7, CURRENT_DATE(), '10:00:00', 120.00, 200.00),
(14, 5, 5,  7, CURRENT_DATE(), '14:00:00', 130.00, 210.00),
(15, 5, 5,  7, CURRENT_DATE(), '18:30:00', 150.00, 250.00),
-- Thangalaan @ CinePulse Multiplex, Virudhunagar
(16, 6, 6,  8, CURRENT_DATE(), '10:30:00', 140.00, 230.00),
(17, 6, 6,  8, CURRENT_DATE(), '14:30:00', 150.00, 250.00),
(18, 6, 6,  8, CURRENT_DATE(), '19:00:00', 170.00, 280.00),
-- Leo (double run) @ CinePulse Multiplex Screen 2, Virudhunagar
(19, 1, 6,  9, CURRENT_DATE(), '11:00:00', 140.00, 230.00),
(20, 1, 6,  9, CURRENT_DATE(), '20:00:00', 160.00, 260.00),
-- Amaran @ Anand Cinema, Aruppukottai
(21, 3, 7, 10, CURRENT_DATE(), '10:00:00', 110.00, 180.00),
(22, 3, 7, 10, CURRENT_DATE(), '15:30:00', 110.00, 180.00),
(23, 3, 7, 10, CURRENT_DATE(), '19:30:00', 130.00, 210.00),
-- GOAT @ Kamarajar Talkies, Sivakasi
(24, 2, 8, 11, CURRENT_DATE(), '10:00:00', 100.00, 170.00),
(25, 2, 8, 11, CURRENT_DATE(), '14:00:00', 110.00, 180.00),
(26, 2, 8, 11, CURRENT_DATE(), '18:30:00', 130.00, 200.00)
ON DUPLICATE KEY UPDATE
  movie_id=VALUES(movie_id), theatre_id=VALUES(theatre_id), screen_id=VALUES(screen_id),
  show_date=VALUES(show_date), show_time=VALUES(show_time),
  price_regular=VALUES(price_regular), price_vip=VALUES(price_vip);

-- Coupons
INSERT INTO coupons (code, discount_percent, max_discount, min_amount, description, is_active) VALUES
('WELCOME50', 20, 100.00, 200.00, 'Get 20% off up to ₹100 on your first booking!', TRUE),
('CINE200', 25, 200.00, 500.00, 'Flat 25% off up to ₹200 on premium movie experiences!', TRUE),
('WEEKENDVIP', 30, 300.00, 800.00, '30% off for VIP recline seats on weekends!', TRUE)
ON DUPLICATE KEY UPDATE code=code;

-- Reviews
INSERT INTO reviews (movie_id, user_id, user_name, rating, comment) VALUES
(1, 2, 'John Doe', 5, 'Mind-blowing visual effects! The IMAX sound design is unmatched.'),
(1, 3, 'Sarah Connor', 4, 'Great storyline and thrilling action sequences. Highly recommended!'),
(2, 2, 'John Doe', 5, 'Visually stunning fantasy epic with amazing lore.')
ON DUPLICATE KEY UPDATE id=id;
