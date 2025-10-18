<?php
// auth.php - Simple authentication backend
include 'config.php';

session_start();

if ($_POST['action'] == 'signup') {
    $database = new Database();
    $db = $database->getConnection();
    
    $full_name = $_POST['full_name'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $account_type = $_POST['account_type'] ?? '';
    
    // For demo purposes - in real app, hash the password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    try {
        $query = "INSERT INTO users (full_name, email, password, account_type) VALUES (?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        $stmt->execute([$full_name, $email, $hashed_password, $account_type]);
        
        sendResponse(true, "Account created successfully", [
            'id' => $db->lastInsertId(),
            'full_name' => $full_name,
            'email' => $email,
            'account_type' => $account_type
        ]);
    } catch (Exception $e) {
        sendResponse(false, "Registration failed: " . $e->getMessage());
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
            sendResponse(true, "Login successful", [
                'id' => $user['id'],
                'full_name' => $user['full_name'],
                'email' => $user['email'],
                'account_type' => $user['account_type']
            ]);
        } else {
            sendResponse(false, "Invalid email or password");
        }
    } catch (Exception $e) {
        sendResponse(false, "Login failed: " . $e->getMessage());
    }
}
?>