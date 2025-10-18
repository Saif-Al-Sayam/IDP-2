<?php
// jobs.php - Job posting backend
include 'config.php';

session_start();

if ($_POST['action'] == 'post_job') {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get current user from session or request
    $user_id = $_SESSION['user_id'] ?? $_POST['user_id'] ?? null;
    
    if (!$user_id) {
        sendResponse(false, "User not authenticated");
    }
    
    $title = $_POST['title'] ?? '';
    $company = $_POST['company'] ?? '';
    $type = $_POST['type'] ?? '';
    $location = $_POST['location'] ?? '';
    $salary = $_POST['salary'] ?? '';
    $description = $_POST['description'] ?? '';
    
    try {
        $query = "INSERT INTO jobs (employer_id, title, company, type, location, salary, description) 
                  VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        $stmt->execute([$user_id, $title, $company, $type, $location, $salary, $description]);
        
        sendResponse(true, "Job posted successfully", [
            'id' => $db->lastInsertId(),
            'title' => $title,
            'company' => $company,
            'type' => $type,
            'location' => $location,
            'salary' => $salary,
            'description' => $description
        ]);
    } catch (Exception $e) {
        sendResponse(false, "Job posting failed: " . $e->getMessage());
    }
}

// Get jobs for display
if ($_GET['action'] == 'get_jobs') {
    $database = new Database();
    $db = $database->getConnection();
    
    try {
        $query = "SELECT * FROM jobs ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendResponse(true, "Jobs retrieved", $jobs);
    } catch (Exception $e) {
        sendResponse(false, "Failed to retrieve jobs: " . $e->getMessage());
    }
}
?>