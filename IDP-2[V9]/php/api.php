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

// Get applications for employer's work posts
if ($_GET['action'] == 'get_employer_applications') {
    $database = new Database();
    $db = $database->getConnection();
    
    $employer_id = $_GET['employer_id'] ?? '';
    
    try {
        $query = "SELECT a.*, wp.title as work_title, wp.budget as work_budget, 
                         u.phone as worker_phone, u.division as worker_division, 
                         u.district as worker_district, u.area as worker_area,
                         u.bio as worker_bio, u.skills as worker_skills
                  FROM applications a 
                  JOIN work_posts wp ON a.work_id = wp.id 
                  JOIN users u ON a.worker_id = u.id
                  WHERE wp.employer_id = ? 
                  ORDER BY a.applied_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute([$employer_id]);
        $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendResponse(true, "Applications retrieved", $applications);
    } catch (Exception $e) {
        sendResponse(false, "Failed to retrieve applications: " . $e->getMessage());
    }
}

// Update application status (accept/reject) and assign worker
if ($_POST['action'] == 'update_application_status') {
    $database = new Database();
    $db = $database->getConnection();
    
    $application_id = $_POST['application_id'] ?? '';
    $status = $_POST['status'] ?? '';
    $employer_id = $_POST['employer_id'] ?? '';
    
    // Validate inputs
    if (empty($application_id) || empty($status) || empty($employer_id)) {
        sendResponse(false, "Missing required parameters");
    }
    
    if (!in_array($status, ['accepted', 'rejected'])) {
        sendResponse(false, "Invalid status");
    }
    
    try {
        // Verify that the employer owns this work post and get application details
        $verifyQuery = "SELECT a.*, wp.id as work_id, wp.title, a.worker_id, a.worker_name
                       FROM work_posts wp 
                       JOIN applications a ON wp.id = a.work_id 
                       WHERE a.id = ? AND wp.employer_id = ?";
        $verifyStmt = $db->prepare($verifyQuery);
        $verifyStmt->execute([$application_id, $employer_id]);
        $application = $verifyStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$application) {
            sendResponse(false, "Application not found or access denied");
            return;
        }
        
        // Update application status
        $updateQuery = "UPDATE applications SET status = ? WHERE id = ?";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->execute([$status, $application_id]);
        
        // If accepting an application, assign the worker to the work post
        if ($status === 'accepted') {
            // Reject all other applications for the same work
            $rejectOthersQuery = "UPDATE applications SET status = 'rejected' 
                                 WHERE work_id = ? AND id != ? AND status = 'pending'";
            $rejectOthersStmt = $db->prepare($rejectOthersQuery);
            $rejectOthersStmt->execute([$application['work_id'], $application_id]);
            
            // Update work post status to assigned and set assigned worker
            $updateWorkQuery = "UPDATE work_posts SET status = 'assigned', assigned_worker_id = ? WHERE id = ?";
            $updateWorkStmt = $db->prepare($updateWorkQuery);
            $updateWorkStmt->execute([$application['worker_id'], $application['work_id']]);
            
            sendResponse(true, "Application accepted and worker assigned successfully");
        } else {
            sendResponse(true, "Application rejected successfully");
        }
    } catch (Exception $e) {
        sendResponse(false, "Failed to update application status: " . $e->getMessage());
    }
}

// Get user conversations
if ($_GET['action'] == 'get_conversations') {
    $database = new Database();
    $db = $database->getConnection();
    
    $user_id = $_GET['user_id'] ?? '';
    
    try {
        $query = "SELECT 
                    u.id as other_user_id,
                    u.full_name as other_user_name,
                    u.phone as other_user_phone,
                    m.message as last_message,
                    m.sent_at as last_message_time,
                    SUM(CASE WHEN m.to_user_id = ? AND m.is_read = 0 THEN 1 ELSE 0 END) as unread_count
                  FROM messages m
                  JOIN users u ON (u.id = m.from_user_id OR u.id = m.to_user_id) AND u.id != ?
                  WHERE (m.from_user_id = ? OR m.to_user_id = ?)
                  AND m.id IN (
                      SELECT MAX(id) FROM messages 
                      WHERE from_user_id = ? OR to_user_id = ? 
                      GROUP BY conversation_id
                  )
                  GROUP BY u.id
                  ORDER BY m.sent_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute([$user_id, $user_id, $user_id, $user_id, $user_id, $user_id]);
        $conversations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendResponse(true, "Conversations retrieved", $conversations);
    } catch (Exception $e) {
        sendResponse(false, "Failed to retrieve conversations: " . $e->getMessage());
    }
}

// Get messages for a conversation
if ($_GET['action'] == 'get_messages') {
    $database = new Database();
    $db = $database->getConnection();
    
    $user_id = $_GET['user_id'] ?? '';
    $other_user_id = $_GET['other_user_id'] ?? '';
    
    try {
        // Mark messages as read
        $updateQuery = "UPDATE messages SET is_read = 1 
                       WHERE from_user_id = ? AND to_user_id = ? AND is_read = 0";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->execute([$other_user_id, $user_id]);
        
        // Get messages
        $query = "SELECT m.*, u.full_name as from_user_name 
                  FROM messages m 
                  JOIN users u ON m.from_user_id = u.id 
                  WHERE (m.from_user_id = ? AND m.to_user_id = ?) 
                     OR (m.from_user_id = ? AND m.to_user_id = ?)
                  ORDER BY m.sent_at ASC";
        
        $stmt = $db->prepare($query);
        $stmt->execute([$user_id, $other_user_id, $other_user_id, $user_id]);
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendResponse(true, "Messages retrieved", $messages);
    } catch (Exception $e) {
        sendResponse(false, "Failed to retrieve messages: " . $e->getMessage());
    }
}

// Send message
if ($_POST['action'] == 'send_message') {
    $database = new Database();
    $db = $database->getConnection();
    
    $from_user_id = $_POST['from_user_id'] ?? '';
    $to_user_id = $_POST['to_user_id'] ?? '';
    $message = $_POST['message'] ?? '';
    
    // Validate required fields
    if (empty($from_user_id) || empty($to_user_id) || empty($message)) {
        sendResponse(false, "All fields are required");
    }
    
    try {
        $conversation_id = [$from_user_id, $to_user_id];
        sort($conversation_id);
        $conversation_id = implode('_', $conversation_id);
        
        $query = "INSERT INTO messages (conversation_id, from_user_id, to_user_id, message) 
                  VALUES (?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        $stmt->execute([$conversation_id, $from_user_id, $to_user_id, $message]);
        
        $message_id = $db->lastInsertId();
        
        // Get the created message with user info
        $query = "SELECT m.*, u.full_name as from_user_name 
                  FROM messages m 
                  JOIN users u ON m.from_user_id = u.id 
                  WHERE m.id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$message_id]);
        $new_message = $stmt->fetch(PDO::FETCH_ASSOC);
        
        sendResponse(true, "Message sent successfully", $new_message);
    } catch (Exception $e) {
        sendResponse(false, "Failed to send message: " . $e->getMessage());
    }
}

// Search users for messaging
if ($_GET['action'] == 'search_users') {
    $database = new Database();
    $db = $database->getConnection();
    
    $search_term = $_GET['search_term'] ?? '';
    $current_user_id = $_GET['current_user_id'] ?? '';
    
    try {
        $query = "SELECT id, full_name, email, phone, user_type, division, district, area 
                  FROM users 
                  WHERE (full_name LIKE ? OR email LIKE ?) 
                  AND id != ? 
                  ORDER BY full_name ASC 
                  LIMIT 20";
        
        $search_param = "%$search_term%";
        $stmt = $db->prepare($query);
        $stmt->execute([$search_param, $search_param, $current_user_id]);
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendResponse(true, "Users retrieved", $users);
    } catch (Exception $e) {
        sendResponse(false, "Failed to search users: " . $e->getMessage());
    }
}

// Get recent contacts
if ($_GET['action'] == 'get_recent_contacts') {
    $database = new Database();
    $db = $database->getConnection();
    
    $user_id = $_GET['user_id'] ?? '';
    
    try {
        $query = "SELECT DISTINCT u.id, u.full_name, u.email, u.user_type
                  FROM messages m
                  JOIN users u ON (u.id = m.from_user_id OR u.id = m.to_user_id) AND u.id != ?
                  WHERE m.from_user_id = ? OR m.to_user_id = ?
                  ORDER BY m.sent_at DESC
                  LIMIT 10";
        
        $stmt = $db->prepare($query);
        $stmt->execute([$user_id, $user_id, $user_id]);
        $contacts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendResponse(true, "Recent contacts retrieved", $contacts);
    } catch (Exception $e) {
        sendResponse(false, "Failed to retrieve recent contacts: " . $e->getMessage());
    }
}

// Mark work as completed
if ($_POST['action'] == 'complete_work') {
    $database = new Database();
    $db = $database->getConnection();
    
    $work_id = $_POST['work_id'] ?? '';
    $user_id = $_POST['user_id'] ?? '';
    $user_type = $_POST['user_type'] ?? '';
    
    try {
        // Verify user has permission to complete this work
        $verifyQuery = "SELECT * FROM work_posts WHERE id = ? AND (employer_id = ? OR assigned_worker_id = ?)";
        $verifyStmt = $db->prepare($verifyQuery);
        $verifyStmt->execute([$work_id, $user_id, $user_id]);
        $work = $verifyStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$work) {
            sendResponse(false, "Work not found or access denied");
            return;
        }
        
        if ($work['status'] !== 'assigned') {
            sendResponse(false, "Work must be in assigned status to complete");
            return;
        }
        
        // Update work status to completed
        $updateQuery = "UPDATE work_posts SET status = 'completed', completed_at = NOW() WHERE id = ?";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->execute([$work_id]);
        
        sendResponse(true, "Work marked as completed successfully");
    } catch (Exception $e) {
        sendResponse(false, "Failed to complete work: " . $e->getMessage());
    }
}

// Submit review and rating
if ($_POST['action'] == 'submit_review') {
    $database = new Database();
    $db = $database->getConnection();
    
    $work_id = $_POST['work_id'] ?? '';
    $from_user_id = $_POST['from_user_id'] ?? '';
    $to_user_id = $_POST['to_user_id'] ?? '';
    $rating = $_POST['rating'] ?? '';
    $comment = $_POST['comment'] ?? '';
    
    // Validate inputs
    if (empty($work_id) || empty($from_user_id) || empty($to_user_id) || empty($rating)) {
        sendResponse(false, "All required fields must be filled");
    }
    
    if ($rating < 1 || $rating > 5) {
        sendResponse(false, "Rating must be between 1 and 5");
    }
    
    try {
        // Verify the work exists and is completed
        $verifyQuery = "SELECT * FROM work_posts WHERE id = ? AND status = 'completed'";
        $verifyStmt = $db->prepare($verifyQuery);
        $verifyStmt->execute([$work_id]);
        $work = $verifyStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$work) {
            sendResponse(false, "Completed work not found");
            return;
        }
        
        // Verify users are involved in this work
        if (($from_user_id != $work['employer_id'] && $from_user_id != $work['assigned_worker_id']) || 
            ($to_user_id != $work['employer_id'] && $to_user_id != $work['assigned_worker_id'])) {
            sendResponse(false, "Users must be involved in this work");
            return;
        }
        
        // Check if review already exists
        $checkQuery = "SELECT id FROM reviews WHERE work_id = ? AND from_user_id = ? AND to_user_id = ?";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->execute([$work_id, $from_user_id, $to_user_id]);
        
        if ($checkStmt->fetch()) {
            sendResponse(false, "You have already reviewed this user for this work");
            return;
        }
        
        // Insert review
        $insertQuery = "INSERT INTO reviews (work_id, from_user_id, to_user_id, rating, comment) 
                        VALUES (?, ?, ?, ?, ?)";
        $insertStmt = $db->prepare($insertQuery);
        $insertStmt->execute([$work_id, $from_user_id, $to_user_id, $rating, $comment]);
        
        // Update user's average rating
        $updateRatingQuery = "UPDATE users 
                             SET average_rating = (
                                 SELECT AVG(rating) FROM reviews WHERE to_user_id = ?
                             ),
                             total_reviews = (
                                 SELECT COUNT(*) FROM reviews WHERE to_user_id = ?
                             )
                             WHERE id = ?";
        $updateStmt = $db->prepare($updateRatingQuery);
        $updateStmt->execute([$to_user_id, $to_user_id, $to_user_id]);
        
        sendResponse(true, "Review submitted successfully");
    } catch (Exception $e) {
        sendResponse(false, "Failed to submit review: " . $e->getMessage());
    }
}

// Get completed work for review
if ($_GET['action'] == 'get_completed_work') {
    $database = new Database();
    $db = $database->getConnection();
    
    $user_id = $_GET['user_id'] ?? '';
    
    try {
        $query = "SELECT wp.*, 
                         u_employer.full_name as employer_name,
                         u_worker.full_name as worker_name,
                         u_worker.id as worker_id,
                         u_employer.id as employer_id
                  FROM work_posts wp
                  LEFT JOIN users u_employer ON wp.employer_id = u_employer.id
                  LEFT JOIN users u_worker ON wp.assigned_worker_id = u_worker.id
                  WHERE wp.status = 'completed'
                  AND (wp.employer_id = ? OR wp.assigned_worker_id = ?)
                  AND wp.id NOT IN (
                      SELECT work_id FROM reviews WHERE from_user_id = ?
                  )
                  ORDER BY wp.completed_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute([$user_id, $user_id, $user_id]);
        $completed_work = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendResponse(true, "Completed work retrieved", $completed_work);
    } catch (Exception $e) {
        sendResponse(false, "Failed to retrieve completed work: " . $e->getMessage());
    }
}

// Get user reviews
if ($_GET['action'] == 'get_user_reviews') {
    $database = new Database();
    $db = $database->getConnection();
    
    $user_id = $_GET['user_id'] ?? '';
    
    try {
        $query = "SELECT r.*, 
                         u_from.full_name as from_user_name,
                         wp.title as work_title
                  FROM reviews r
                  JOIN users u_from ON r.from_user_id = u_from.id
                  JOIN work_posts wp ON r.work_id = wp.id
                  WHERE r.to_user_id = ?
                  ORDER BY r.created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute([$user_id]);
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendResponse(true, "Reviews retrieved", $reviews);
    } catch (Exception $e) {
        sendResponse(false, "Failed to retrieve reviews: " . $e->getMessage());
    }
}

// Default response for unknown actions
sendResponse(false, "Invalid action specified");
?>