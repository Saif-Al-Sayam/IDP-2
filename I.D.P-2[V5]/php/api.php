<?php
include 'config.php';

session_start();

header('Content-Type: application/json');

// Get all work posts for Bangladesh
if ($_GET['action'] == 'get_work_posts') {
    $database = new Database();
    $db = $database->getConnection();
    
    $category = $_GET['category'] ?? '';
    $division = $_GET['division'] ?? '';
    $district = $_GET['district'] ?? '';
    $area = $_GET['area'] ?? '';
    $keyword = $_GET['keyword'] ?? '';
    
    try {
        $query = "SELECT wp.*, u.full_name as employer_name 
                  FROM work_posts wp 
                  JOIN users u ON wp.employer_id = u.id 
                  WHERE wp.status = 'open'";
        
        $params = [];
        
        if (!empty($category)) {
            $query .= " AND wp.category = ?";
            $params[] = $category;
        }
        
        if (!empty($division)) {
            $query .= " AND wp.division = ?";
            $params[] = $division;
        }
        
        if (!empty($district)) {
            $query .= " AND wp.district LIKE ?";
            $params[] = "%$district%";
        }
        
        if (!empty($area)) {
            $query .= " AND wp.area LIKE ?";
            $params[] = "%$area%";
        }
        
        if (!empty($keyword)) {
            $query .= " AND (wp.title LIKE ? OR wp.description LIKE ?)";
            $keywordParam = "%$keyword%";
            $params[] = $keywordParam;
            $params[] = $keywordParam;
        }
        
        $query .= " ORDER BY wp.created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $work_posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendResponse(true, "Work posts retrieved", $work_posts);
    } catch (Exception $e) {
        sendResponse(false, "Failed to retrieve work posts: " . $e->getMessage());
    }
}

// Apply for work
if ($_POST['action'] == 'apply_work') {
    $database = new Database();
    $db = $database->getConnection();
    
    $work_id = $_POST['work_id'] ?? '';
    $worker_id = $_POST['worker_id'] ?? '';
    $proposal = $_POST['proposal'] ?? '';
    $bid_amount = $_POST['bid_amount'] ?? null;
    
    try {
        // Check if already applied
        $checkQuery = "SELECT id FROM applications WHERE work_id = ? AND worker_id = ?";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->execute([$work_id, $worker_id]);
        
        if ($checkStmt->fetch()) {
            sendResponse(false, "You have already applied for this work");
            return;
        }
        
        $query = "INSERT INTO applications (work_id, worker_id, proposal, bid_amount) 
                  VALUES (?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        $stmt->execute([$work_id, $worker_id, $proposal, $bid_amount]);
        
        sendResponse(true, "Application submitted successfully");
    } catch (Exception $e) {
        sendResponse(false, "Application failed: " . $e->getMessage());
    }
}

// Update profile for Bangladesh
if ($_POST['action'] == 'update_profile') {
    $database = new Database();
    $db = $database->getConnection();
    
    $user_id = $_POST['user_id'] ?? '';
    $full_name = $_POST['full_name'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $division = $_POST['division'] ?? '';
    $district = $_POST['district'] ?? '';
    $post_code = $_POST['post_code'] ?? '';
    $area = $_POST['area'] ?? '';
    $bio = $_POST['bio'] ?? '';
    $skills = $_POST['skills'] ?? '';
    
    try {
        $query = "UPDATE users SET full_name = ?, phone = ?, division = ?, district = ?, post_code = ?, area = ?, bio = ?, skills = ? 
                  WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$full_name, $phone, $division, $district, $post_code, $area, $bio, $skills, $user_id]);
        
        sendResponse(true, "Profile updated successfully");
    } catch (Exception $e) {
        sendResponse(false, "Profile update failed: " . $e->getMessage());
    }
}

// Other API functions remain the same as previous...
// Get user applications, get messages, send message, etc.
?>