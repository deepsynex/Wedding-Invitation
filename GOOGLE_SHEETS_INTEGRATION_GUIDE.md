# Google Sheets Integration Guide
**Mary & Raja Wedding Invitation RSVP**

This document explains step-by-step how to connect your RSVP system to a live **Google Sheet** whenever you are ready.

---

## Architecture Overview

When a guest submits the RSVP form, their response can be automatically saved to a live Google Sheet in real time. 

The easiest and 100% free way to do this (without needing Google Cloud credentials, billing, or OAuth tokens) is using a **Google Apps Script Web App**.

```
[ Guest RSVP Form ] 
        │
        ▼ (AJAX POST)
   [ rsvp.php ] ───► Saves locally to [ Book1.csv ]
        │
        ▼ (Background Webhook POST)
[ Google Apps Script Web App ]
        │
        ▼
 [ Live Google Sheet ]
```

---

## Step 1: Create Your Google Sheet

1. Open your browser and go to: [https://sheets.new](https://sheets.new)
2. Rename the spreadsheet at the top left, for example: `Wedding RSVP Responses`.
3. In row `1` (Header row), set the column titles as follows:

| Column | Header Name | Description |
| :--- | :--- | :--- |
| **A** | `Sr. NO.` | Sequential guest response number |
| **B** | `Guest Name` | Primary guest full name |
| **C** | `Attendance` | Attending or Regrets |
| **D** | `Total Attendees` | Number of attending guests (1 + additional guests) |
| **E** | `Bringing Guest` | Yes or No |
| **F** | `Attendee Names` | Comma-separated list of additional guest names |
| **G** | `Submitted At` | Date and timestamp of submission |

---

## Step 2: Add the Google Apps Script

1. In your Google Sheet, click **Extensions** in the top menu &rarr; **Apps Script**.
2. Erase any default code in the editor (`function myFunction() { ... }`).
3. Paste the following complete, production-ready script:

```javascript
/**
 * Google Apps Script Webhook for Wedding Invitation RSVP
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Prevent concurrent write collisions

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Format additional attendees list
    var attendeesList = "-";
    if (data.attendees && Array.isArray(data.attendees) && data.attendees.length > 0) {
      attendeesList = data.attendees.join(", ");
    }

    // Determine row number
    var nextSrNo = data.srNo ? data.srNo : (sheet.getLastRow());

    // Append new row to Google Sheet
    sheet.appendRow([
      nextSrNo,
      data.guestName || "",
      data.attendance || "attending",
      data.totalAttendee !== undefined ? data.totalAttendee : 1,
      data.bringingGuest || "no",
      attendeesList,
      new Date().toLocaleString()
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: "RSVP recorded" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "Google Apps Script Webhook is active" }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Click the **Save** icon (diskette icon) or press `Ctrl + S`.

---

## Step 3: Deploy as a Web App

1. At the top right of the Apps Script window, click the blue **Deploy** button &rarr; select **New deployment**.
2. Click the gear icon (**Select type**) &rarr; choose **Web app**.
3. Fill in the deployment settings:
   - **Description:** `Wedding RSVP Webhook`
   - **Execute as:** `Me (your-email@gmail.com)`
   - **Who has access:** `Anyone` *(Crucial: allows the website to post RSVPs without requiring guests to sign into a Google account)*
4. Click **Deploy**.
5. Google will ask you to **Authorize access**:
   - Choose your Google account.
   - Click **Advanced** &rarr; click **Go to Untitled project (unsafe)**.
   - Click **Allow**.
6. Copy the generated **Web App URL** (it will look like):
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```

---

## Step 4: Connecting the Web App to Your Project

You have two simple ways to connect this URL to your codebase whenever you want:

### Method A: Connect in `rsvp.php` (Recommended — Saves to both CSV & Google Sheet)

When connected in `rsvp.php`, every submission is automatically saved to your local `Book1.csv` AND synced to Google Sheets in the background.

1. Open `rsvp.php`.
2. Near the top (around line 30), add your URL:
   ```php
   $googleSheetWebhookUrl = 'https://script.google.com/macros/s/YOUR_DEPLOYED_URL_HERE/exec';
   ```
3. Near line 300 (right before `echo json_encode(...)`), add:
   ```php
   if (!empty($googleSheetWebhookUrl) && $savedRecord) {
       forwardToGoogleSheet($googleSheetWebhookUrl, $savedRecord);
   }
   ```
4. At the bottom of `rsvp.php`, add the helper function:
   ```php
   function forwardToGoogleSheet($webhookUrl, $record) {
       try {
           $payload = json_encode($record, JSON_UNESCAPED_UNICODE);
           $context = stream_context_create([
               'http' => [
                   'method'  => 'POST',
                   'header'  => "Content-Type: application/json\r\nAccept: application/json\r\n",
                   'content' => $payload,
                   'timeout' => 4,
                   'ignore_errors' => true
               ]
           ]);
           @file_get_contents($webhookUrl, false, $context);
       } catch (\Throwable $e) {
           // Silently continue so guest submission is never interrupted
       }
   }
   ```

---

### Method B: Connect Directly in `app.js` (Frontend / Client-Side)

If you ever host on a static web host without PHP, you can send data directly from `app.js`:

1. Open `app.js`.
2. In the `submitRsvpToPhp(payload)` function, add a fetch call to your Google Apps Script URL:
   ```javascript
   fetch('https://script.google.com/macros/s/YOUR_DEPLOYED_URL_HERE/exec', {
     method: 'POST',
     mode: 'no-cors', // Google Apps Script redirects require no-cors mode
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(payload)
   }).catch(err => console.warn('Google Sheet sync notice:', err));
   ```

---

## Troubleshooting & Verification

- **Testing the webhook:** Paste your Web App URL into your web browser address bar. It should return:
  `{"status":"Google Apps Script Webhook is active"}`
- **Permissions Error (401 or 403):** Ensure that in the Apps Script deployment settings, **Who has access** is set to **Anyone**.
- **Sheet not updating:** If you make changes to the Google Apps Script code, you must create a **New deployment** (or update the existing version) in Apps Script so the URL points to the updated code.
