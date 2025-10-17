<?php
include 'config.php';

session_start();

if ($_POST['action'] == 'signup') {
    $database = new Database();
    $db = $database->getConnection();
    
    $full_name = $_POST['full_name'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $account_type = $_POST['account_type'];
    
    // Check if email already exists
    $query = "SELECT id FROM users WHERE email = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$email]);
    
    if ($stmt->rowCount() > 0) {
        sendResponse(false, "Email already registered");
    }
    
    // Insert new user
    $query = "INSERT INTO users (full_name, email, password, account_type, created_at) 
              VALUES (?, ?, ?, ?, NOW())";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([$full_name, $email, $password, $account_type])) {
        $_SESSION['user_id'] = $db->lastInsertId();
        $_SESSION['user_email'] = $email;
        $_SESSION['user_name'] = $full_name;
        $_SESSION['account_type'] = $account_type;
        
        sendResponse(true, "Account created successfully", [
            'user_id' => $_SESSION['user_id'],
            'full_name' => $full_name,
            'email' => $email,
            'account_type' => $account_type
        ]);
    } else {
        sendResponse(false, "Registration failed");
    }
}

if ($_POST['action'] == 'login') {
    $database = new Database();
    $db = $database->getConnection();
    
    $email = $_POST['email'];
    $password = $_POST['password'];
    
    $query = "SELECT * FROM users WHERE email = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_name'] = $user['full_name'];
        $_SESSION['account_type'] = $user['account_type'];
        
        sendResponse(true, "Login successful", [
            'user_id' => $user['id'],
            'full_name' => $user['full_name'],
            'email' => $user['email'],
            'account_type' => $user['account_type']
        ]);
    } else {
        sendResponse(false, "Invalid email or password");
    }
}

if ($_POST['action'] == 'logout') {
    session_destroy();
    sendResponse(true, "Logged out successfully");
}
?>