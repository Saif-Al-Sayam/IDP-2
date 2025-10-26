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

// Post new work
if ($_POST['action'] == 'post_work') {
    $database = new Database();
    $db = $database->getConnection();
    
    $employer_id = $_POST['employer_id'] ?? '';
    $title = $_POST['title'] ?? '';
    $category = $_POST['category'] ?? '';
    $description = $_POST['description'] ?? '';
    $division = $_POST['division'] ?? '';
    $district = $_POST['district'] ?? '';
    $post_code = $_POST['post_code'] ?? '';
    $area = $_POST['area'] ?? '';
    $budget = $_POST['budget'] ?? '';
    $duration = $_POST['duration'] ?? '';
    $urgency = $_POST['urgency'] ?? 'medium';
    
    // Validate required fields
    if (empty($title) || empty($category) || empty($description) || empty($division) || 
        empty($district) || empty($post_code) || empty($area) || empty($budget)) {
        sendResponse(false, "All required fields must be filled");
    }
    
    try {
        // Get employer name
        $employerQuery = "SELECT full_name FROM users WHERE id = ?";
        $employerStmt = $db->prepare($employerQuery);
        $employerStmt->execute([$employer_id]);
        $employer = $employerStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$employer) {
            sendResponse(false, "Employer not found");
            return;
        }
        
        $query = "INSERT INTO work_posts (employer_id, employer_name, title, category, description, division, district, post_code, area, budget, duration, urgency) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        $stmt->execute([$employer_id, $employer['full_name'], $title, $category, $description, $division, $district, $post_code, $area, $budget, $duration, $urgency]);
        
        sendResponse(true, "Work posted successfully");
    } catch (Exception $e) {
        sendResponse(false, "Failed to post work: " . $e->getMessage());
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
    
    // Validate required fields
    if (empty($work_id) || empty($worker_id) || empty($proposal)) {
        sendResponse(false, "All required fields must be filled");
    }
    
    try {
        // Check if already applied
        $checkQuery = "SELECT id FROM applications WHERE work_id = ? AND worker_id = ?";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->execute([$work_id, $worker_id]);
        
        if ($checkStmt->fetch()) {
            sendResponse(false, "You have already applied for this work");
            return;
        }
        
        // Get worker name
        $workerQuery = "SELECT full_name FROM users WHERE id = ?";
        $workerStmt = $db->prepare($workerQuery);
        $workerStmt->execute([$worker_id]);
        $worker = $workerStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$worker) {
            sendResponse(false, "Worker not found");
            return;
        }
        
        $query = "INSERT INTO applications (work_id, worker_id, worker_name, proposal, bid_amount) 
                  VALUES (?, ?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        $stmt->execute([$work_id, $worker_id, $worker['full_name'], $proposal, $bid_amount]);
        
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
    
    // Validate required fields
    if (empty($user_id) || empty($full_name) || empty($phone) || empty($division) || 
        empty($district) || empty($post_code) || empty($area)) {
        sendResponse(false, "All required fields must be filled");
    }
    
    try {
        $query = "UPDATE users SET full_name = ?, phone = ?, division = ?, district = ?, post_code = ?, area = ?, bio = ?, skills = ? 
                  WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$full_name, $phone, $division, $district, $post_code, $area, $bio, $skills, $user_id]);
        
        // Get updated user data
        $query = "SELECT id, full_name, email, user_type, phone, division, district, post_code, area, bio, skills, created_at FROM users WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        sendResponse(true, "Profile updated successfully", $user);
    } catch (Exception $e) {
        sendResponse(false, "Profile update failed: " . $e->getMessage());
    }
}

// Get user applications
if ($_GET['action'] == 'get_user_applications') {
    $database = new Database();
    $db = $database->getConnection();
    
    $user_id = $_GET['user_id'] ?? '';
    
    try {
        $query = "SELECT a.*, wp.title as work_title, wp.employer_name, wp.budget 
                  FROM applications a 
                  JOIN work_posts wp ON a.work_id = wp.id 
                  WHERE a.worker_id = ? 
                  ORDER BY a.applied_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute([$user_id]);
        $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendResponse(true, "Applications retrieved", $applications);
    } catch (Exception $e) {
        sendResponse(false, "Failed to retrieve applications: " . $e->getMessage());
    }
}

// Get user's work posts (for employers)
if ($_GET['action'] == 'get_user_work_posts') {
    $database = new Database();
    $db = $database->getConnection();
    
    $user_id = $_GET['user_id'] ?? '';
    
    try {
        $query = "SELECT * FROM work_posts WHERE employer_id = ? ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute([$user_id]);
        $work_posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendResponse(true, "Work posts retrieved", $work_posts);
    } catch (Exception $e) {
        sendResponse(false, "Failed to retrieve work posts: " . $e->getMessage());
    }
}

// Default response for unknown actions
sendResponse(false, "Invalid action specified");
?>