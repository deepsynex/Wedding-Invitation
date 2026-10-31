<?php
/**
 * ==============================================================================
 * Mary & Raja Wedding Invitation - PHP AJAX RSVP Controller
 * ==============================================================================
 *
 * Reads and writes guest RSVP responses directly in "Wedding-List-Complete.xlsx"
 * (worksheet "Sheet1"). The header row is located automatically (currently B2):
 *   Name | Phone Number | Total Number in Party | Party Member 2..6
 *
 * - GET:  Returns all rows from the sheet in JSON format.
 * - POST: Updates the guest's existing row and returns JSON. Only guests already
 *         on the list can respond; unknown names are rejected, never appended.
 *
 * Only the touched row is rewritten; every other row, the header and the
 * workbook styling are left exactly as they are in the file.
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

$xlsxFile = __DIR__ . DIRECTORY_SEPARATOR . 'Wedding-List-Complete.xlsx';

// Maximum number of people in one party (the guest + Party Member 2..6)
const MAX_PARTY_SIZE = 6;
// Worksheet holding the RSVP list (falls back to the first sheet if renamed)
const RSVP_SHEET_NAME = 'Sheet1';
const XLSX_NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const XLSX_REL_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

$xlsxHeaders = ['Name', 'Phone Number', 'Total Number in Party'];
for ($i = 2; $i <= MAX_PARTY_SIZE; $i++) {
    $xlsxHeaders[] = 'Party Member ' . $i;
}

if (!class_exists('ZipArchive')) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'PHP zip extension is required to read the guest list.']);
    exit;
}

/**
 * 0-based column index -> Excel column letters (0 => A, 13 => N)
 */
function xlsxColumnLetter($index) {
    $letters = '';
    $index++;
    while ($index > 0) {
        $mod = ($index - 1) % 26;
        $letters = chr(65 + $mod) . $letters;
        $index = intdiv($index - 1, 26);
    }
    return $letters;
}

/**
 * Excel cell reference ("C12") -> 0-based column index
 */
function xlsxColumnIndex($cellRef) {
    $letters = preg_replace('/[^A-Z]/', '', strtoupper($cellRef));
    $index = 0;
    for ($i = 0; $i < strlen($letters); $i++) {
        $index = $index * 26 + (ord($letters[$i]) - 64);
    }
    return $index - 1;
}

/**
 * Locate the RSVP worksheet's XML path inside the workbook
 */
function xlsxSheetPath(ZipArchive $zip) {
    $default = 'xl/worksheets/sheet1.xml';
    $workbookXml = $zip->getFromName('xl/workbook.xml');
    $relsXml = $zip->getFromName('xl/_rels/workbook.xml.rels');
    if ($workbookXml === false || $relsXml === false) {
        return $default;
    }

    $workbook = new DOMDocument();
    $rels = new DOMDocument();
    if (!@$workbook->loadXML($workbookXml) || !@$rels->loadXML($relsXml)) {
        return $default;
    }

    $sheets = $workbook->getElementsByTagNameNS(XLSX_NS, 'sheet');
    $sheet = $sheets->item(0);
    foreach ($sheets as $candidate) {
        if (strcasecmp($candidate->getAttribute('name'), RSVP_SHEET_NAME) === 0) {
            $sheet = $candidate;
            break;
        }
    }
    if (!$sheet) {
        return $default;
    }
    $relId = $sheet->getAttributeNS(XLSX_REL_NS, 'id');

    foreach ($rels->getElementsByTagName('Relationship') as $rel) {
        if ($rel->getAttribute('Id') === $relId) {
            $target = $rel->getAttribute('Target');
            return strpos($target, '/') === 0 ? ltrim($target, '/') : 'xl/' . $target;
        }
    }
    return $default;
}

/**
 * Read the shared strings table
 */
function xlsxSharedStrings(ZipArchive $zip) {
    $xml = $zip->getFromName('xl/sharedStrings.xml');
    if ($xml === false) {
        return [];
    }
    $doc = new DOMDocument();
    if (!@$doc->loadXML($xml)) {
        return [];
    }

    $strings = [];
    foreach ($doc->getElementsByTagNameNS(XLSX_NS, 'si') as $si) {
        $text = '';
        foreach ($si->getElementsByTagNameNS(XLSX_NS, 't') as $t) {
            // Skip phonetic (ruby) text runs
            if ($t->parentNode->localName === 'rPh') {
                continue;
            }
            $text .= $t->textContent;
        }
        $strings[] = $text;
    }
    return $strings;
}

/**
 * Get a cell's display value as a string
 */
function xlsxCellValue(DOMElement $cell, array $sharedStrings) {
    $type = $cell->getAttribute('t');

    if ($type === 'inlineStr') {
        $text = '';
        foreach ($cell->getElementsByTagNameNS(XLSX_NS, 't') as $t) {
            $text .= $t->textContent;
        }
        return $text;
    }

    $v = $cell->getElementsByTagNameNS(XLSX_NS, 'v')->item(0);
    if (!$v) {
        return '';
    }
    $value = $v->textContent;

    if ($type === 's') {
        return isset($sharedStrings[(int)$value]) ? $sharedStrings[(int)$value] : '';
    }

    // Numbers stored in scientific notation (e.g. long phone numbers)
    if ($type === '' && is_numeric($value) && stripos($value, 'e') !== false) {
        return sprintf('%.0f', (float)$value);
    }
    return $value;
}

/**
 * Load the first worksheet as a DOM plus a [rowNumber => [colIndex => value]] map
 */
function xlsxLoadSheet(ZipArchive $zip) {
    $sheetPath = xlsxSheetPath($zip);
    $sheetXml = $zip->getFromName($sheetPath);
    if ($sheetXml === false) {
        return null;
    }

    $doc = new DOMDocument();
    $doc->preserveWhiteSpace = true;
    if (!@$doc->loadXML($sheetXml)) {
        return null;
    }

    $sharedStrings = xlsxSharedStrings($zip);
    $rows = [];
    $rowElements = [];
    $sheetData = $doc->getElementsByTagNameNS(XLSX_NS, 'sheetData')->item(0);

    if ($sheetData) {
        $rowCounter = 0;
        foreach ($sheetData->getElementsByTagNameNS(XLSX_NS, 'row') as $rowEl) {
            $rowNum = $rowEl->hasAttribute('r') ? (int)$rowEl->getAttribute('r') : $rowCounter + 1;
            $rowCounter = $rowNum;

            $values = [];
            $colCounter = 0;
            foreach ($rowEl->getElementsByTagNameNS(XLSX_NS, 'c') as $cell) {
                $col = $cell->hasAttribute('r') ? xlsxColumnIndex($cell->getAttribute('r')) : $colCounter;
                $colCounter = $col + 1;
                $values[$col] = xlsxCellValue($cell, $sharedStrings);
            }

            $rows[$rowNum] = $values;
            $rowElements[$rowNum] = $rowEl;
        }
    }

    // Find the header row: the first row with a "Name" cell followed by "Phone Number"
    $headerRow = 1;
    $startCol = 0;
    foreach ($rows as $rowNum => $values) {
        foreach ($values as $col => $value) {
            if (strcasecmp(trim($value), 'Name') === 0
                && isset($values[$col + 1]) && strcasecmp(trim($values[$col + 1]), 'Phone Number') === 0) {
                $headerRow = $rowNum;
                $startCol = $col;
                break 2;
            }
        }
    }

    return [
        'path' => $sheetPath,
        'doc' => $doc,
        'headerRow' => $headerRow,
        'startCol' => $startCol,
        'sheetData' => $sheetData,
        'rows' => $rows,
        'rowElements' => $rowElements
    ];
}

/**
 * Convert a sheet row into an RSVP record (srNo = position below the header row).
 * $values is keyed by column offset from the "Name" column.
 */
function xlsxRowToRecord($srNo, array $values) {
    // Strip stray / non-breaking spaces some names carry in the sheet
    $guestName = isset($values[0]) ? trim(preg_replace('/[\s\x{00A0}]+/u', ' ', $values[0])) : '';
    $phone = isset($values[1]) ? trim($values[1]) : '';
    $totalRaw = isset($values[2]) ? trim($values[2]) : '';

    $attendees = [];
    for ($i = 3; $i < 2 + MAX_PARTY_SIZE; $i++) {
        if (isset($values[$i]) && trim($values[$i]) !== '') {
            $attendees[] = trim($values[$i]);
        }
    }

    $totalAttendee = is_numeric($totalRaw)
        ? (int)$totalRaw
        : ($guestName !== '' ? 1 + count($attendees) : 0);

    return [
        'srNo' => $srNo,
        'guestName' => $guestName,
        'phone' => $phone,
        'totalAttendee' => $totalAttendee,
        'attendees' => $attendees,
        'attendance' => $totalAttendee > 0 ? 'attending' : 'regrets',
        'bringingGuest' => count($attendees) > 0 ? 'yes' : 'no',
        'guestCount' => count($attendees)
    ];
}

/**
 * Re-key a raw sheet row so index 0 is the "Name" column
 */
function xlsxRowOffsetValues(array $values, $startCol) {
    $out = [];
    foreach ($values as $col => $value) {
        if ($col >= $startCol) {
            $out[$col - $startCol] = $value;
        }
    }
    return $out;
}

/**
 * Read all guest records from the workbook (rows below the header row)
 */
function readXlsxRecords($filePath) {
    if (!file_exists($filePath)) {
        return [];
    }

    $zip = new ZipArchive();
    if ($zip->open($filePath) !== true) {
        return [];
    }
    $sheet = xlsxLoadSheet($zip);
    $zip->close();

    if (!$sheet) {
        return [];
    }

    $records = [];
    foreach ($sheet['rows'] as $rowNum => $values) {
        if ($rowNum <= $sheet['headerRow']) {
            continue;
        }
        $record = xlsxRowToRecord($rowNum - $sheet['headerRow'], xlsxRowOffsetValues($values, $sheet['startCol']));
        if ($record['guestName'] === '') {
            continue;
        }
        $records[] = $record;
    }
    return $records;
}

/**
 * Create a blank workbook containing only the header row
 */
function createBlankXlsx($filePath, array $headers) {
    $headerCells = '';
    foreach ($headers as $i => $h) {
        $headerCells .= '<c r="' . xlsxColumnLetter($i) . '1" t="inlineStr" s="1"><is><t>'
            . htmlspecialchars($h, ENT_XML1) . '</t></is></c>';
    }
    $lastCol = xlsxColumnLetter(count($headers) - 1);

    $files = [
        '[Content_Types].xml' => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            . '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            . '<Default Extension="xml" ContentType="application/xml"/>'
            . '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            . '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            . '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            . '</Types>',
        '_rels/.rels' => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            . '</Relationships>',
        'xl/workbook.xml' => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<workbook xmlns="' . XLSX_NS . '" xmlns:r="' . XLSX_REL_NS . '">'
            . '<sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>',
        'xl/_rels/workbook.xml.rels' => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
            . '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
            . '</Relationships>',
        'xl/styles.xml' => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<styleSheet xmlns="' . XLSX_NS . '">'
            . '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>'
            . '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>'
            . '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
            . '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
            . '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
            . '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>'
            . '</styleSheet>',
        'xl/worksheets/sheet1.xml' => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<worksheet xmlns="' . XLSX_NS . '" xmlns:r="' . XLSX_REL_NS . '">'
            . '<dimension ref="A1:' . $lastCol . '1"/>'
            . '<sheetData><row r="1">' . $headerCells . '</row></sheetData></worksheet>'
    ];

    $zip = new ZipArchive();
    if ($zip->open($filePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
        return false;
    }
    foreach ($files as $name => $content) {
        $zip->addFromString($name, $content);
    }
    return $zip->close();
}

/**
 * Write one guest row into the RSVP sheet. $srNo = null appends a new row.
 * $values is keyed by offset from the "Name" column. Cells outside the RSVP
 * columns are left untouched. Returns the srNo written, or false on failure.
 */
function saveXlsxRow($filePath, $srNo, array $values) {
    // Work on a temp copy so a failed write never corrupts the real file
    $tempFile = $filePath . '.tmp';
    if (!@copy($filePath, $tempFile)) {
        return false;
    }

    $zip = new ZipArchive();
    if ($zip->open($tempFile) !== true) {
        @unlink($tempFile);
        return false;
    }

    $sheet = xlsxLoadSheet($zip);
    if (!$sheet || !$sheet['sheetData']) {
        $zip->close();
        @unlink($tempFile);
        return false;
    }

    $doc = $sheet['doc'];
    $headerRow = $sheet['headerRow'];
    $startCol = $sheet['startCol'];
    $endCol = $startCol + 2 + MAX_PARTY_SIZE; // exclusive
    $maxRow = count($sheet['rows']) > 0 ? max(array_keys($sheet['rows'])) : $headerRow;
    $rowNum = $srNo !== null ? $headerRow + $srNo : null;

    if ($rowNum === null || !isset($sheet['rowElements'][$rowNum])) {
        // Append after the last row, reusing the last data row's cell styles
        $templateRow = $maxRow > $headerRow ? $sheet['rowElements'][$maxRow] : null;
        $rowNum = max($maxRow, $headerRow) + 1;
        $rowEl = $doc->createElementNS(XLSX_NS, 'row');
        $rowEl->setAttribute('r', (string)$rowNum);
        $sheet['sheetData']->appendChild($rowEl);
    } else {
        $templateRow = $sheet['rowElements'][$rowNum];
        $rowEl = $templateRow;
    }

    // Remember per-column styles, and keep any cells outside the RSVP columns
    $styles = [];
    $cells = [];
    if ($templateRow) {
        foreach ($templateRow->getElementsByTagNameNS(XLSX_NS, 'c') as $cell) {
            if (!$cell->hasAttribute('r')) {
                continue;
            }
            $col = xlsxColumnIndex($cell->getAttribute('r'));
            if ($cell->hasAttribute('s')) {
                $styles[$col] = $cell->getAttribute('s');
            }
            if ($templateRow === $rowEl && ($col < $startCol || $col >= $endCol)) {
                $cells[$col] = $cell;
            }
        }
    }

    foreach ($values as $offset => $value) {
        if ($value === '' || $value === null) {
            continue;
        }
        $col = $startCol + $offset;
        $cell = $doc->createElementNS(XLSX_NS, 'c');
        $cell->setAttribute('r', xlsxColumnLetter($col) . $rowNum);
        if (isset($styles[$col])) {
            $cell->setAttribute('s', $styles[$col]);
        }

        if (is_int($value)) {
            $cell->appendChild($doc->createElementNS(XLSX_NS, 'v', (string)$value));
        } else {
            // Text (phone numbers included, so leading "+" / "0" are kept)
            $cell->setAttribute('t', 'inlineStr');
            $is = $doc->createElementNS(XLSX_NS, 'is');
            $t = $doc->createElementNS(XLSX_NS, 't');
            $t->setAttribute('xml:space', 'preserve');
            $t->appendChild($doc->createTextNode((string)$value));
            $is->appendChild($t);
            $cell->appendChild($is);
        }
        $cells[$col] = $cell;
    }

    // Rebuild the row with cells in column order (required by Excel)
    while ($rowEl->firstChild) {
        $rowEl->removeChild($rowEl->firstChild);
    }
    $rowEl->removeAttribute('spans');
    ksort($cells);
    foreach ($cells as $cell) {
        $rowEl->appendChild($cell);
    }

    // Keep the sheet's used-range hint in sync
    $dimension = $doc->getElementsByTagNameNS(XLSX_NS, 'dimension')->item(0);
    if ($dimension && $rowNum > $maxRow) {
        $dimension->setAttribute('ref', preg_replace('/\d+$/', (string)$rowNum, $dimension->getAttribute('ref')));
    }

    $zip->addFromString($sheet['path'], $doc->saveXML());
    if (!$zip->close()) {
        @unlink($tempFile);
        return false;
    }

    if (!@rename($tempFile, $filePath)) {
        @unlink($tempFile);
        return false;
    }
    return $rowNum - $headerRow;
}

/**
 * Normalize a name for matching: case-insensitive, and stray / non-breaking /
 * repeated spaces (common in Excel cells) are ignored
 */
function normalizeName($name) {
    return mb_strtolower(trim(preg_replace('/[\s\x{00A0}]+/u', ' ', (string)$name)), 'UTF-8');
}

/**
 * Records for the public listing: phone numbers are never sent to the browser
 */
function publicRecords(array $records) {
    return array_map(function ($r) {
        unset($r['phone']);
        return $r;
    }, $records);
}

// --------------------------------------------------------------------------
// 1. GET Request: Read the guest list and return JSON
// --------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $records = readXlsxRecords($xlsxFile);

    // ?name=<exact guest name>: return only that guest's phone, so the full
    // phone list is never exposed but a known guest still sees their number
    if (isset($_GET['name'])) {
        $searchName = normalizeName($_GET['name']);
        $phone = '';
        foreach ($records as $r) {
            if ($searchName !== '' && normalizeName($r['guestName']) === $searchName) {
                $phone = $r['phone'];
                break;
            }
        }
        echo json_encode(['success' => true, 'phone' => $phone], JSON_UNESCAPED_UNICODE);
        exit;
    }

    echo json_encode([
        'success' => true,
        'count' => count($records),
        'records' => publicRecords($records)
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// --------------------------------------------------------------------------
// 2. POST Request: Create or Update an RSVP row in the guest list
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
    $phone = isset($input['phone']) ? trim($input['phone']) : '';
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

    if ($phone === '' || !preg_match('/^\+?[0-9\s\-()]{7,20}$/', $phone)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Please provide a valid phone number.'
        ]);
        exit;
    }

    if ($attendance !== 'attending') {
        $attendees = [];
    }

    if (count($attendees) > MAX_PARTY_SIZE - 1) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'A maximum of ' . MAX_PARTY_SIZE . ' guests (including you) is allowed per RSVP.'
        ]);
        exit;
    }

    // Calculate total attendees
    $totalAttendee = ($attendance === 'attending')
        ? (1 + count($attendees))
        : 0;

    // Serialize all writers so simultaneous RSVPs can't overwrite each other
    $lockHandle = @fopen($xlsxFile . '.lock', 'c');
    if ($lockHandle) {
        flock($lockHandle, LOCK_EX);
    }

    if (!file_exists($xlsxFile) && !createBlankXlsx($xlsxFile, $xlsxHeaders)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to create the guest list workbook.']);
        exit;
    }

    // Read current records
    $records = readXlsxRecords($xlsxFile);

    // Find the guest's row by name (case-insensitive); editingSrNo only picks
    // between rows that carry the same name
    $targetIndex = -1;
    $searchName = normalizeName($guestName);
    foreach ($records as $idx => $r) {
        if (normalizeName($r['guestName']) !== $searchName) {
            continue;
        }
        if ($targetIndex === -1 || ($editingSrNo !== null && (int)$r['srNo'] === $editingSrNo)) {
            $targetIndex = $idx;
        }
    }

    // Only guests already on the list may RSVP: never append new rows
    if ($targetIndex === -1) {
        if ($lockHandle) {
            flock($lockHandle, LOCK_UN);
            fclose($lockHandle);
        }
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Please double-check your spelling and make sure your full name is entered correctly.'
        ]);
        exit;
    }

    // Keep the name exactly as written in the sheet
    $guestName = $records[$targetIndex]['guestName'];

    // Build the row: Name, Phone Number, Total Number in Party, Party Member 2..6
    $rowValues = [$guestName, $phone, $totalAttendee];
    for ($i = 0; $i < MAX_PARTY_SIZE - 1; $i++) {
        $rowValues[] = isset($attendees[$i]) ? $attendees[$i] : '';
    }

    $targetSrNo = $records[$targetIndex]['srNo'];
    $writtenSrNo = saveXlsxRow($xlsxFile, $targetSrNo, $rowValues);

    if ($lockHandle) {
        flock($lockHandle, LOCK_UN);
        fclose($lockHandle);
    }

    if ($writtenSrNo === false) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to save your RSVP to the guest list.'
        ]);
        exit;
    }

    $savedRecord = xlsxRowToRecord($writtenSrNo, $rowValues);

    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'RSVP successfully saved',
        'record' => $savedRecord,
        'records' => publicRecords(readXlsxRecords($xlsxFile))
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// Method not allowed
http_response_code(405);
echo json_encode([
    'success' => false,
    'message' => 'Method not allowed. Use GET or POST.'
]);
