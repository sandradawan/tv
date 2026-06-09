<?php
/**
 * api-stats.php — Imperialvilla Property Development Limited
 * Read-Only Stats API | Configured for Hostinger Production Database
 *
 * Tables used:
 *   - users             → total staff
 *   - clients           → total registered clients
 *   - agents            → total agents
 *   - pending_approvals → clients awaiting approval
 *
 * This file ONLY reads data. It does NOT modify, insert,
 * update, or delete any records. Safe to deploy on Hostinger.
 */

// ─── 1. CORS & SECURITY HEADERS ───────────────────────────────────────────────
// ⚠️  Replace '*' with your exact Vercel URL before going live:
//     e.g. 'https://imperialvilla-dashboard.vercel.app'
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit();
}

// ─── 2. DATABASE CONFIGURATION ────────────────────────────────────────────────
// ⚠️  Fill these in from your Hostinger hPanel → Databases → MySQL Databases
define('DB_HOST',    'localhost');          // Always 'localhost' on Hostinger shared
define('DB_PORT',    '3306');
define('DB_NAME',    'your_database_name'); // e.g. u123456789_ipvl
define('DB_USER',    'your_db_username');   // e.g. u123456789_api
define('DB_PASS',    'your_db_password');   // Your database password
define('DB_CHARSET', 'utf8mb4');

// ─── 3. CONNECT ───────────────────────────────────────────────────────────────
$dsn = sprintf(
    'mysql:host=%s;port=%s;dbname=%s;charset=%s',
    DB_HOST, DB_PORT, DB_NAME, DB_CHARSET
);

$pdoOptions = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
];

try {
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $pdoOptions);
} catch (PDOException $e) {
    http_response_code(503);
    echo json_encode([
        'success'   => false,
        'error'     => 'Database connection failed. Please try again later.',
        'timestamp' => date('c'),
        // Uncomment ONLY for local debugging — never leave this on in production:
        // 'debug' => $e->getMessage(),
    ]);
    exit();
}

// ─── 4. READ-ONLY QUERIES ─────────────────────────────────────────────────────
try {

    // Total staff — from `users` table
    $stmtStaff = $pdo->query("SELECT COUNT(*) FROM `users`");
    $totalStaff = (int) $stmtStaff->fetchColumn();

    // Total clients — from `clients` table
    $stmtClients = $pdo->query("SELECT COUNT(*) FROM `clients`");
    $totalClients = (int) $stmtClients->fetchColumn();

    // Total agents — from `agents` table
    $stmtAgents = $pdo->query("SELECT COUNT(*) FROM `agents`");
    $totalAgents = (int) $stmtAgents->fetchColumn();

    // Pending approvals — from `pending_approvals` table
    $stmtPending = $pdo->query("SELECT COUNT(*) FROM `pending_approvals`");
    $pendingApprovals = (int) $stmtPending->fetchColumn();

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success'   => false,
        'error'     => 'Query error. Please check your database configuration.',
        'timestamp' => date('c'),
        // 'debug'  => $e->getMessage(), // Uncomment for local debugging only
    ]);
    exit();
}

// ─── 5. SUCCESS RESPONSE ──────────────────────────────────────────────────────
http_response_code(200);
echo json_encode([
    'success'   => true,
    'timestamp' => date('c'),
    'data'      => [
        'total_staff'      => $totalStaff,       // from: users table
        'total_clients'    => $totalClients,     // from: clients table
        'total_agents'     => $totalAgents,      // from: agents table
        'pending_approvals'=> $pendingApprovals, // from: pending_approvals table
    ],
], JSON_PRETTY_PRINT);
