-- Create database
CREATE DATABASE IF NOT EXISTS freelance_platform;
USE freelance_platform;

-- Users table for Bangladesh
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('employer', 'worker') NOT NULL,
    phone VARCHAR(20),
    division VARCHAR(50),
    district VARCHAR(50),
    post_code VARCHAR(10),
    area VARCHAR(100),
    profile_picture VARCHAR(255),
    bio TEXT,
    skills TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    total_ratings INT DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Work posts table for Bangladesh
CREATE TABLE IF NOT EXISTS work_posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employer_id INT NOT NULL,
    assigned_worker_id INT NULL,
    employer_name VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    division VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    post_code VARCHAR(10) NOT NULL,
    area VARCHAR(100) NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    duration VARCHAR(50),
    urgency ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('open', 'assigned', 'completed', 'cancelled') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_worker_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    work_id INT NOT NULL,
    worker_id INT NOT NULL,
    worker_name VARCHAR(100) NOT NULL,
    proposal TEXT NOT NULL,
    bid_amount DECIMAL(10,2),
    status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (work_id) REFERENCES work_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    from_user_id INT NOT NULL,
    to_user_id INT NOT NULL,
    work_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (work_id) REFERENCES work_posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review (work_id, from_user_id, to_user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id VARCHAR(100) NOT NULL,
    from_user_id INT NOT NULL,
    to_user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    work_id INT NOT NULL,
    employer_id INT NOT NULL,
    worker_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'held', 'released', 'refunded') DEFAULT 'pending',
    held_at TIMESTAMP NULL,
    released_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (work_id) REFERENCES work_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX idx_applications_work_id ON applications(work_id);
CREATE INDEX idx_applications_worker_id ON applications(worker_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_work_posts_employer_id ON work_posts(employer_id);
CREATE INDEX idx_work_posts_status ON work_posts(status);
CREATE INDEX idx_work_posts_assigned_worker ON work_posts(assigned_worker_id);
CREATE INDEX idx_reviews_to_user_id ON reviews(to_user_id);
CREATE INDEX idx_reviews_work_id ON reviews(work_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_from_user_id ON messages(from_user_id);
CREATE INDEX idx_messages_to_user_id ON messages(to_user_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at);

-- Insert sample users (Sayam and Saif)
INSERT INTO users (full_name, email, password, user_type, phone, division, district, post_code, area) 
VALUES (
    'Sayam', 
    'sayam@gmail.com', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- hashed 'password'
    'employer', 
    '01234', 
    'dhaka', 
    'Dhaka', 
    '1234', 
    'Dania'
);

INSERT INTO users (full_name, email, password, user_type, phone, division, district, post_code, area) 
VALUES (
    'Saif', 
    'saif@gmail.com', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- hashed 'password'
    'worker', 
    '012345', 
    'dhaka', 
    'Dhaka', 
    '1234', 
    'Dania'
);

-- Insert sample work posts
INSERT INTO work_posts (employer_id, employer_name, title, category, description, division, district, post_code, area, budget, duration, urgency) 
VALUES (
    1, 
    'Sayam', 
    'Need help with grocery delivery', 
    'delivery', 
    'I need someone to deliver groceries from local market to my home in Dania. The items are not heavy, just regular groceries for a family of four.', 
    'dhaka', 
    'Dhaka', 
    '1234', 
    'Dania', 
    500.00, 
    '2 hours', 
    'medium'
);

INSERT INTO work_posts (employer_id, employer_name, title, category, description, division, district, post_code, area, budget, duration, urgency) 
VALUES (
    1, 
    'Sayam', 
    'House cleaning required', 
    'cleaning', 
    'Looking for someone to clean my 3-bedroom apartment in Dania. Need sweeping, mopping, and bathroom cleaning. Cleaning materials will be provided.', 
    'dhaka', 
    'Dhaka', 
    '1234', 
    'Dania', 
    800.00, 
    '3 hours', 
    'low'
);

-- Insert sample applications
INSERT INTO applications (work_id, worker_id, worker_name, proposal, bid_amount, status) 
VALUES (
    1, 
    2, 
    'Saif', 
    'I have experience with grocery delivery in the Dania area. I can complete this task within 1 hour. I have my own bicycle for delivery.', 
    450.00, 
    'pending'
);

INSERT INTO applications (work_id, worker_id, worker_name, proposal, bid_amount, status) 
VALUES (
    2, 
    2, 
    'Saif', 
    'I am available for house cleaning and have previous experience. I can bring my own cleaning tools if needed.', 
    750.00, 
    'pending'
);

-- Insert sample messages
INSERT INTO messages (conversation_id, from_user_id, to_user_id, message, is_read) 
VALUES (
    '1_2', 
    1, 
    2, 
    'Hello Saif, I saw your application for the grocery delivery work. Are you available tomorrow?', 
    TRUE
);

INSERT INTO messages (conversation_id, from_user_id, to_user_id, message, is_read) 
VALUES (
    '1_2', 
    2, 
    1, 
    'Yes, I am available tomorrow after 2 PM. What time works for you?', 
    TRUE
);

INSERT INTO messages (conversation_id, from_user_id, to_user_id, message, is_read) 
VALUES (
    '1_2', 
    1, 
    2, 
    '2 PM works perfectly. I will send you the grocery list in the morning.', 
    FALSE
);

-- Display table structure verification
SELECT 'Database setup completed successfully!' as status;

-- Show all tables
SHOW TABLES;

-- Describe each table structure
DESCRIBE users;
DESCRIBE work_posts;
DESCRIBE applications;
DESCRIBE reviews;
DESCRIBE messages;
DESCRIBE payments;

-- Show sample data
SELECT 'Users:' as '';
SELECT id, full_name, email, user_type, phone, division, district, area FROM users;

SELECT 'Work Posts:' as '';
SELECT id, employer_id, title, category, budget, status FROM work_posts;

SELECT 'Applications:' as '';
SELECT id, work_id, worker_id, status, bid_amount FROM applications;

SELECT 'Messages:' as '';
SELECT id, conversation_id, from_user_id, to_user_id, LEFT(message, 50) as message_preview FROM messages;