-- Insert first user (Sayam - employer)
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

-- Insert second user (Saif - worker)
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