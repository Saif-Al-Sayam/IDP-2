<?php
include 'config.php';

session_start();

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
    $urgency = $_POST['urgency'] ?? '';
    
    try {
        $query = "INSERT INTO work_posts (employer_id, title, category, description, division, district, post_code, area, budget, duration, urgency) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        $stmt->execute([$employer_id, $title, $category, $description, $division, $district, $post_code, $area, $budget, $duration, $urgency]);
        
        sendResponse(true, "Work posted successfully");
    } catch (Exception $e) {
        sendResponse(false, "Failed to post work: " . $e->getMessage());
    }
}
?>