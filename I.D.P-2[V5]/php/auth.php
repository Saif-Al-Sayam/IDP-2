<?php
include 'config.php';

session_start();

if ($_POST['action'] == 'signup') {
    $database = new Database();
    $db = $database->getConnection();
    
    $full_name = $_POST['full_name'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $user_type = $_POST['user_type'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $division = $_POST['division'] ?? '';
    $district = $_POST['district'] ?? '';
    $post_code = $_POST['post_code'] ?? '';
    $area = $_POST['area'] ?? '';
    
    // Validate required fields
    if (empty($full_name) || empty($email) || empty($password) || empty($user_type)) {
        sendResponse(false, "All fields are required");
    }
    
    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    try {
        $query = "INSERT INTO users (full_name, email, password, user_type, phone, division, district, post_code, area) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        $stmt->execute([$full_name, $email, $hashed_password, $user_type, $phone, $division, $district, $post_code, $area]);
        
        $user_id = $db->lastInsertId();
        
        // Get created user
        $query = "SELECT id, full_name, email, user_type, phone, division, district, post_code, area FROM users WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        sendResponse(true, "Account created successfully", $user);
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
            sendResponse(false, "Email already exists");
        } else {
            sendResponse(false, "Registration failed: " . $e->getMessage());
        }
    }
}

if ($_POST['action'] == 'login') {
    $database = new Database();
    $db = $database->getConnection();
    
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    try {
        $query = "SELECT * FROM users WHERE email = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && password_verify($password, $user['password'])) {
            // Remove password from response
            unset($user['password']);
            
            sendResponse(true, "Login successful", $user);
        } else {
            sendResponse(false, "Invalid email or password");
        }
    } catch (Exception $e) {
        sendResponse(false, "Login failed: " . $e->getMessage());
    }
}
?>