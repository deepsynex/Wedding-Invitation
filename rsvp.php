<?php
/**
 * ==============================================================================
 * Mary & Raja Wedding Invitation - PHP AJAX RSVP Controller
 * ==============================================================================
 * 
 * Handles AJAX requests to read and write guest RSVP responses directly
 * to Book1.csv on disk. Supports:
 * - GET: Returns all records from Book1.csv in JSON format.
 * - POST: Creates or updates an RSVP response directly in Book1.csv and returns JSON.
 */

// Turn off deprecation notices in output to ensure clean JSON responses
error_reporting(E_ALL & ~E_DEPRECATED);
ini_set('display_errors', '0');

// Enable CORS and JSON response headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$csvFile = __DIR__ . DIRECTORY_SEPARATOR . 'Book1.csv';

$csvHeaders = [
    'Sr. NO.',
    'Guest name ',
    'Total attendee',
    'Attendee 1',
    'Attendee 2',
    'Attendee 3',
    'Attendee 4',
    'Attendee 5',
    'Attendee 6',
    'Attendee 7',
    'Attendee 8',
    'Attendee 9',
    'Attendee 10'
];

/**
 * Read all records from Book1.csv
 */
function readCsvRecords($filePath) {
    if (!file_exists($filePath)) {
        return [];
    }

    $records = [];
    if (($handle = fopen($filePath, 'r')) !== false) {
        $header = fgetcsv($handle, 0, ',', '"', "\\"); // Read header row
        $rowNum = 1;

        while (($data = fgetcsv($handle, 0, ',', '"', "\\")) !== false) {
            if (empty($data) || (count($data) === 1 && trim($data[0]) === '')) {
                continue;
            }

            $srNo = isset($data[0]) && is_numeric(trim($data[0])) ? (int)trim($data[0]) : $rowNum;
            $guestName = isset($data[1]) ? trim($data[1]) : '';
            $totalAttendee = isset($data[2]) && is_numeric(trim($data[2])) ? (int)trim($data[2]) : ($guestName ? 1 : 0);

            $attendees = [];
            for ($i = 3; $i < 13; $i++) {
                if (isset($data[$i]) && trim($data[$i]) !== '') {
                    $attendees[] = trim($data[$i]);
                }
            }

            // Determine attendance and plus-one
            $attendance = $totalAttendee > 0 ? 'attending' : 'regrets';
            $bringingGuest = count($attendees) > 0 ? 'yes' : 'no';

            $records[] = [
                'srNo' => $srNo,
                'guestName' => $guestName,
                'totalAttendee' => $totalAttendee,
                'attendees' => $attendees,
                'attendance' => $attendance,
                'bringingGuest' => $bringingGuest,
                'guestCount' => count($attendees)
            ];

            $rowNum++;
        }
        fclose($handle);
    }

    return $records;
}

/**
 * Write records back to Book1.csv with sequential numbering and exact formatting
 */
function writeCsvRecords($filePath, $records, $headers) {
    // 1. Direct write method (fastest, most reliable across Windows and Linux)
    $handle = @fopen($filePath, 'w');
    if ($handle) {
        @flock($handle, LOCK_EX);
        fputcsv($handle, $headers, ',', '"', "\\");

        foreach ($records as $index => $rec) {
            $srNo = $index + 1;
            $guestName = isset($rec['guestName']) ? trim($rec['guestName']) : '';
            $attendance = isset($rec['attendance']) ? $rec['attendance'] : 'attending';
            $attendees = isset($rec['attendees']) && is_array($rec['attendees']) ? $rec['attendees'] : [];

            if ($attendance === 'attending') {
                $totalAttendee = 1 + count($attendees);
            } else {
                $totalAttendee = 0;
            }

            $row = [
                $srNo,
                $guestName,
                $totalAttendee
            ];

            for ($i = 0; $i < 10; $i++) {
                $row[] = isset($attendees[$i]) ? trim($attendees[$i]) : '';
            }

            fputcsv($handle, $row, ',', '"', "\\");
        }

        @flock($handle, LOCK_UN);
        fclose($handle);
        return true;
    }

    // 2. Temp file fallback
    $tempFile = $filePath . '.tmp';
    $handle = @fopen($tempFile, 'w');
    if (!$handle) {
        return false;
    }

    fputcsv($handle, $headers, ',', '"', "\\");
    foreach ($records as $index => $rec) {
        $srNo = $index + 1;
        $guestName = isset($rec['guestName']) ? trim($rec['guestName']) : '';
        $attendance = isset($rec['attendance']) ? $rec['attendance'] : 'attending';
        $attendees = isset($rec['attendees']) && is_array($rec['attendees']) ? $rec['attendees'] : [];

        if ($attendance === 'attending') {
            $totalAttendee = 1 + count($attendees);
        } else {
            $totalAttendee = 0;
        }

        $row = [
            $srNo,
            $guestName,
            $totalAttendee
        ];

        for ($i = 0; $i < 10; $i++) {
            $row[] = isset($attendees[$i]) ? trim($attendees[$i]) : '';
        }

        fputcsv($handle, $row, ',', '"', "\\");
    }
    fclose($handle);

    if (@copy($tempFile, $filePath)) {
        @unlink($tempFile);
        return true;
    }

    return false;
}

// --------------------------------------------------------------------------
// 1. GET Request: Read Book1.csv and return JSON list
// --------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $records = readCsvRecords($csvFile);
    echo json_encode([
        'success' => true,
        'count' => count($records),
        'records' => $records
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// --------------------------------------------------------------------------
// 2. POST Request: Create or Update an RSVP entry in Book1.csv
// --------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Read raw JSON input (php://input for web servers, php://stdin for CLI/bridges) or fallback to $_POST form-encoded
    $rawInput = file_get_contents('php://input');
    if (empty($rawInput)) {
        $rawInput = @file_get_contents('php://stdin');
    }
    $input = json_decode($rawInput, true);

    if (!is_array($input) || empty($input)) {
        $input = $_POST;
    }

    // Extract input values
    $guestName = isset($input['guestName']) ? trim($input['guestName']) : '';
    $attendance = isset($input['attendance']) ? trim($input['attendance']) : 'attending';
    $bringingGuest = isset($input['bringingGuest']) ? trim($input['bringingGuest']) : 'no';
    $editingSrNo = isset($input['editingSrNo']) && is_numeric($input['editingSrNo']) ? (int)$input['editingSrNo'] : null;

    // Handle attendees list
    $attendees = [];
    if (isset($input['attendees'])) {
        if (is_array($input['attendees'])) {
            foreach ($input['attendees'] as $att) {
                if (trim($att) !== '') {
                    $attendees[] = trim($att);
                }
            }
        } elseif (is_string($input['attendees'])) {
            $decoded = json_decode($input['attendees'], true);
            if (is_array($decoded)) {
                foreach ($decoded as $att) {
                    if (trim($att) !== '') {
                        $attendees[] = trim($att);
                    }
                }
            } else {
                // Comma separated
                $parts = explode(',', $input['attendees']);
                foreach ($parts as $p) {
                    if (trim($p) !== '') {
                        $attendees[] = trim($p);
                    }
                }
            }
        }
    }

    // Validation
    if ($guestName === '') {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Please provide your full name.'
        ]);
        exit;
    }

    // Calculate total attendees
    $totalAttendee = ($attendance === 'attending')
        ? (1 + count($attendees))
        : 0;

    // Read current records
    $records = readCsvRecords($csvFile);

    // Look for existing record by editingSrNo or by name (case-insensitive)
    $targetIndex = -1;
    if ($editingSrNo !== null && $editingSrNo > 0) {
        foreach ($records as $idx => $r) {
            if ((int)$r['srNo'] === (int)$editingSrNo) {
                $targetIndex = $idx;
                break;
            }
        }
    }

    // If no matching editingSrNo, look for existing record by guest name
    if ($targetIndex === -1 && $guestName !== '') {
        $searchName = trim(mb_strtolower($guestName, 'UTF-8'));
        foreach ($records as $idx => $r) {
            if (trim(mb_strtolower($r['guestName'], 'UTF-8')) === $searchName) {
                $targetIndex = $idx;
                break;
            }
        }
    }

    $savedRecord = null;

    if ($targetIndex !== -1) {
        // Update existing record
        $records[$targetIndex]['guestName'] = $guestName;
        $records[$targetIndex]['attendance'] = $attendance;
        $records[$targetIndex]['bringingGuest'] = $bringingGuest;
        $records[$targetIndex]['totalAttendee'] = $totalAttendee;
        $records[$targetIndex]['attendees'] = $attendees;
        $records[$targetIndex]['guestCount'] = count($attendees);
        $records[$targetIndex]['updatedAt'] = date('c');

        $savedRecord = $records[$targetIndex];
    } else {
        // Create new record
        $nextSrNo = count($records) > 0 ? (max(array_column($records, 'srNo')) + 1) : 1;

        $newRecord = [
            'srNo' => $nextSrNo,
            'guestName' => $guestName,
            'attendance' => $attendance,
            'bringingGuest' => $bringingGuest,
            'totalAttendee' => $totalAttendee,
            'attendees' => $attendees,
            'guestCount' => count($attendees),
            'submittedAt' => date('c')
        ];

        $records[] = $newRecord;
        $savedRecord = $newRecord;
    }

    // Save to Book1.csv
    $written = writeCsvRecords($csvFile, $records, $csvHeaders);

    if (!$written) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to write records to Book1.csv.'
        ]);
        exit;
    }

    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'RSVP successfully saved to Book1.csv',
        'record' => $savedRecord,
        'records' => $records
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// Method not allowed
http_response_code(405);
echo json_encode([
    'success' => false,
    'message' => 'Method not allowed. Use GET or POST.'
]);
