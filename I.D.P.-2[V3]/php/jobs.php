<?php
include 'config.php';

session_start();

if ($_POST['action'] == 'post_job') {
    if (!isset($_SESSION['user_id']) || $_SESSION['account_type'] != 'employer') {
        sendResponse(false, "Unauthorized access");
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    $query = "INSERT INTO jobs (employer_id, title, company, type, location, salary, experience, description, requirements, benefits, created_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
    
    $stmt = $db->prepare($query);
    $success = $stmt->execute([
        $_SESSION['user_id'],
        $_POST['title'],
        $_POST['company'],
        $_POST['type'],
        $_POST['location'],
        $_POST['salary'],
        $_POST['experience'],
        $_POST['description'],
        $_POST['requirements'],
        $_POST['benefits']
    ]);
    
    if ($success) {
        sendResponse(true, "Job posted successfully", ['job_id' => $db->lastInsertId()]);
    } else {
        sendResponse(false, "Failed to post job");
    }
}

if ($_GET['action'] == 'get_jobs') {
    $database = new Database();
    $db = $database->getConnection();
    
    $search = $_GET['search'] ?? '';
    $location = $_GET['location'] ?? '';
    $type = $_GET['type'] ?? '';
    
    $query = "SELECT j.*, u.full_name as employer_name 
              FROM jobs j 
              JOIN users u ON j.employer_id = u.id 
              WHERE j.status = 'active'";
    
    $params = [];
    
    if (!empty($search)) {
        $query .= " AND (j.title LIKE ? OR j.company LIKE ? OR j.description LIKE ?)";
        $searchTerm = "%$search%";
        $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm]);
    }
    
    if (!empty($location)) {
        $query .= " AND j.location LIKE ?";
        $params[] = "%$location%";
    }
    
    if (!empty($type)) {
        $query .= " AND j.type = ?";
        $params[] = $type;
    }
    
    $query .= " ORDER BY j.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendResponse(true, "Jobs retrieved", $jobs);
}

if ($_POST['action'] == 'apply_job') {
    if (!isset($_SESSION['user_id']) || $_SESSION['account_type'] != 'job_seeker') {
        sendResponse(false, "Unauthorized access");
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if already applied
    $checkQuery = "SELECT id FROM applications WHERE job_id = ? AND user_id = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$_POST['job_id'], $_SESSION['user_id']]);
    
    if ($checkStmt->rowCount() > 0) {
        sendResponse(false, "You have already applied for this job");
    }
    
    $query = "INSERT INTO applications (job_id, user_id, applied_at) VALUES (?, ?, NOW())";
    $stmt = $db->prepare($query);
    $success = $stmt->execute([$_POST['job_id'], $_SESSION['user_id']]);
    
    if ($success) {
        sendResponse(true, "Application submitted successfully");
    } else {
        sendResponse(false, "Failed to submit application");
    }
}
?>