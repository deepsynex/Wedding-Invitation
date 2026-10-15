/**
 * ==========================================================================
 * Mary & Raja Wedding Invitation - All-in-One Master JavaScript Controller
 * ==========================================================================
 * 
 * Includes:
 * 1. Book1.csv Direct CRUD Controller (Pure CSV, zero localStorage)
 * 2. Single-Page Navigation & Route Controller
 * 3. 3D Envelope Unseal & GSAP Animation Engine
 * 4. Live Ceremony Countdown Clock (Dubai GST / UTC+4)
 * 5. Accessible FAQ Accordions
 * 6. Interactive RSVP Form with Silent Auto-Fill & Dynamic Attendees
 * 7. 3D Antigravity Spatial Motion & Mouse Parallax
 */

// ==========================================================================
// 1. Book1.csv Direct CRUD Controller (Pure CSV, zero localStorage)
// ==========================================================================

let records = [];

/**
 * Concatenates first and last name into a single full name string.
 */
function concatName(firstName, lastName) {
  const f = (firstName || '').trim();
  const l = (lastName || '').trim();
  if (f && l) return `${f} ${l}`;
  return f || l || '';
}

/**
 * Splits a full name string into firstName and lastName parts.
 */
function splitName(fullName) {
  if (!fullName) return { firstName: '', lastName: '' };
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || ''
  };
}

/**
 * Parse raw CSV text lines into structured records.
 */
function parseCsvText(content) {
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return [];

  const parsed = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cells = parseCsvLine(line);
    if (!cells || cells.length === 0) continue;

    const srNo = parseInt(cells[0], 10) || i;
    const guestName = (cells[1] || '').trim();
    const totalAttendee = parseInt(cells[2], 10) || (guestName ? 1 : 0);

    const attendees = [];
    for (let c = 3; c < 13; c++) {
      if (cells[c] && cells[c].trim().length > 0) {
        attendees.push(cells[c].trim());
      }
    }

    const { firstName, lastName } = splitName(guestName);

    parsed.push({
      srNo,
      guestName,
      firstName,
      lastName,
      totalAttendee,
      attendees,
      attendance: totalAttendee > 0 ? 'attending' : 'regrets',
      bringingGuest: attendees.length > 0 ? 'yes' : 'no',
      guestCount: attendees.length
    });
  }
  return parsed;
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Load records directly from Book1.csv on disk via backend API or static CSV file.
 */
async function loadRecordsFromCsv() {
  const endpoints = [
    '/api/rsvps',
    'http://127.0.0.1:3000/api/rsvps',
    `Book1.csv?t=${Date.now()}`
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep);
      if (res.ok) {
        if (ep.endsWith('.csv') || ep.includes('Book1.csv')) {
          const text = await res.text();
          const list = parseCsvText(text);
          if (list && list.length > 0) {
            records = list;
            return records;
          }
        } else {
          const json = await res.json();
          if (json && Array.isArray(json.records) && json.records.length > 0) {
            records = json.records;
            return records;
          }
        }
      }
    } catch {
      // Try next endpoint
    }
  }

  return records;
}

function getStoredRecords() {
  return records;
}

/**
 * Save records directly to Book1.csv on disk via backend API.
 */
async function saveRecords(updatedRecords) {
  records = updatedRecords;

  const endpoints = [
    '/api/rsvps/sync',
    'http://127.0.0.1:3000/api/rsvps/sync'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: updatedRecords })
      });
      if (res.ok) {
        return true;
      }
    } catch {
      // Try next
    }
  }

  return false;
}

async function createGuest(data) {
  let guestName = (data.guestName || '').trim();
  if (!guestName && (data.firstName || data.lastName)) {
    guestName = concatName(data.firstName, data.lastName);
  }

  const { firstName, lastName } = splitName(guestName);
  const attendance = data.attendance || 'attending';
  const bringingGuest = data.bringingGuest || 'no';
  const attendees = Array.isArray(data.attendees) ? data.attendees : [];

  const totalAttendee = attendance === 'attending'
    ? (1 + attendees.length)
    : 0;

  const nextSrNo = records.length > 0 
    ? Math.max(...records.map(r => Number(r.srNo) || 0)) + 1 
    : 1;

  const newRecord = {
    srNo: nextSrNo,
    guestName,
    firstName,
    lastName,
    totalAttendee,
    attendees,
    attendance,
    bringingGuest,
    guestCount: attendees.length,
    submittedAt: new Date().toISOString()
  };

  records.push(newRecord);
  await saveRecords(records);
  return newRecord;
}

function getGuestBySrNo(srNo) {
  return records.find(r => Number(r.srNo) === Number(srNo)) || null;
}

async function updateGuest(srNo, data) {
  const targetIndex = records.findIndex(r => Number(r.srNo) === Number(srNo));
  if (targetIndex === -1) return null;

  let guestName = (data.guestName !== undefined ? data.guestName : records[targetIndex].guestName || '').trim();
  if (!guestName && (data.firstName || data.lastName)) {
    guestName = concatName(data.firstName, data.lastName);
  }

  const { firstName, lastName } = splitName(guestName);
  const attendance = data.attendance !== undefined ? data.attendance : records[targetIndex].attendance;
  const bringingGuest = data.bringingGuest !== undefined ? data.bringingGuest : records[targetIndex].bringingGuest;
  const attendees = data.attendees !== undefined ? data.attendees : (records[targetIndex].attendees || []);

  const totalAttendee = attendance === 'attending'
    ? (1 + attendees.length)
    : 0;

  const updatedRecord = {
    ...records[targetIndex],
    guestName,
    firstName,
    lastName,
    totalAttendee,
    attendees,
    attendance,
    bringingGuest,
    guestCount: attendees.length,
    updatedAt: new Date().toISOString()
  };

  records[targetIndex] = updatedRecord;
  await saveRecords(records);
  return updatedRecord;
}

async function deleteGuest(srNo) {
  const initialLength = records.length;
  records = records.filter(r => Number(r.srNo) !== Number(srNo));

  if (records.length === initialLength) {
    return false;
  }

  records.forEach((r, idx) => {
    r.srNo = idx + 1;
  });

  await saveRecords(records);
  return true;
}

// Initial load directly from Book1.csv
loadRecordsFromCsv();

// Expose on window for direct access
if (typeof window !== 'undefined') {
  window.WeddingCRUD = {
    getAll: getStoredRecords,
    getById: getGuestBySrNo,
    create: createGuest,
    update: updateGuest,
    delete: deleteGuest,
    loadFromCsv: loadRecordsFromCsv,
    saveToCsv: saveRecords,
    concatName,
    splitName
  };
}


// ==========================================================================
// 2. Single-Page Navigation & Route Controller
// ==========================================================================

const SCREENS = {
  envelope: 'screen-envelope',
  '1': 'screen-envelope',
  invitation: 'screen-main',
  '2': 'screen-main',
  details: 'screen-details',
  '3': 'screen-details',
  'rsvp-prompt': 'screen-rsvp-prompt',
  '4': 'screen-rsvp-prompt',
  'rsvp-form': 'screen-rsvp-form',
  rsvp: 'screen-rsvp-form',
  crud: 'screen-rsvp-form',
  '6': 'screen-rsvp-form',
  admin: 'screen-rsvp-form'
};

function showScreen(screenKey, updateHistory = true) {
  const targetId = SCREENS[screenKey] || screenKey;
  const screens = document.querySelectorAll('.screen-view');

  screens.forEach(screen => {
    if (screen.id === targetId) {
      screen.classList.add('active');
    } else {
      screen.classList.remove('active');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (updateHistory) {
    const hash = Object.keys(SCREENS).find(k => SCREENS[k] === targetId) || screenKey;
    history.pushState({ screen: hash }, '', `#${hash}`);
  }
}

if (typeof window !== 'undefined') {
  window.showScreen = showScreen;
}

function initNavigation() {
  document.addEventListener('click', (e) => {
    const petalBtn = e.target.closest('.petal-btn');
    if (petalBtn) {
      e.preventDefault();
      showScreen('details');
      return;
    }

    const rsvpBtn = e.target.closest('.rsvp-pocket-btn');
    if (rsvpBtn) {
      e.preventDefault();
      showScreen('rsvp-prompt');
      return;
    }

    const targetEl = e.target.closest('[data-nav-target]');
    if (targetEl) {
      e.preventDefault();
      const targetScreen = targetEl.getAttribute('data-nav-target');
      showScreen(targetScreen);
    }
  });

  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.screen) {
      showScreen(e.state.screen, false);
    } else {
      const hash = window.location.hash.replace('#', '');
      if (SCREENS[hash]) {
        showScreen(hash, false);
      } else {
        showScreen('envelope', false);
      }
    }
  });

  const urlParams = new URLSearchParams(window.location.search);
  const screenParam = urlParams.get('screen');
  const initialHash = window.location.hash.replace('#', '');
  const initialScreen = screenParam || initialHash;

  if (SCREENS[initialScreen]) {
    showScreen(initialScreen, false);
  } else if (!document.querySelector('.screen-view.active')) {
    showScreen('envelope', false);
  }
}


// ==========================================================================
// 3. 3D Envelope Unseal & Opening Animation Engine
// ==========================================================================

function initEnvelope(onOpenedCallback) {
  const envelopeStage = document.getElementById('envelopeStage');
  const waxSeal = document.getElementById('waxSeal');
  const openPrompt = document.getElementById('envelopePrompt');

  if (!envelopeStage) return;

  let isOpening = false;

  function triggerOpen() {
    if (isOpening) return;
    isOpening = true;

    if (typeof gsap !== 'undefined') {
      const tl = gsap.timeline({
        onComplete: () => {
          if (typeof onOpenedCallback === 'function') {
            onOpenedCallback();
          }

          const invitationCard = document.getElementById('invitationCard');
          if (invitationCard) {
            gsap.fromTo(invitationCard,
              { xPercent: -50, x: 0, y: 360, opacity: 1 },
              {
                xPercent: -50,
                x: 0,
                y: 0,
                opacity: 1,
                duration: 1.35,
                ease: 'power2.out',
                delay: 0.25
              }
            );

            gsap.to('.env-layer-photo', {
              opacity: 1,
              duration: 1.1,
              ease: 'power2.out'
            });
          }

          setTimeout(() => {
            gsap.set(['#waxSeal', '.envelope-lily-stem', '.closed-envelope-wrapper'], {
              clearProps: 'all'
            });
            isOpening = false;
          }, 1000);
        }
      });

      tl.to('#waxSeal', {
        scale: 1.3,
        opacity: 0,
        duration: 0.45,
        ease: 'power2.out'
      }, 0);

      tl.to('.envelope-lily-stem', {
        x: 35,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in'
      }, 0.05);

      tl.to('.closed-envelope-wrapper', {
        scale: 1.05,
        opacity: 0,
        duration: 0.65,
        ease: 'power2.inOut'
      }, 0.15);

    } else {
      envelopeStage.classList.add('unsealing');
      setTimeout(() => {
        if (typeof onOpenedCallback === 'function') {
          onOpenedCallback();
        }
        setTimeout(() => {
          envelopeStage.classList.remove('unsealing');
          isOpening = false;
        }, 700);
      }, 750);
    }
  }

  envelopeStage.addEventListener('click', triggerOpen);
  if (waxSeal) {
    waxSeal.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerOpen();
    });
  }
  if (openPrompt) {
    openPrompt.addEventListener('click', triggerOpen);
  }
}


// ==========================================================================
// 4. Live Countdown Engine (Dubai GST / UTC+4)
// ==========================================================================

const WEDDING_TIMESTAMP = new Date('2027-01-16T15:00:00+04:00').getTime();

function initCountdown() {
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const containerEl = document.getElementById('countdown-container');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  function update() {
    const now = Date.now();
    const distance = WEDDING_TIMESTAMP - now;

    if (distance <= 0) {
      if (containerEl) {
        containerEl.innerHTML = '<p class="font-serif" style="font-style:italic; font-size:1.4rem; color:var(--color-gold);">Our celebration has begun! Welcome!</p>';
      }
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}


// ==========================================================================
// 5. Accessible FAQ Accordion Component
// ==========================================================================

function initAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isAlreadyActive = item.classList.contains('active');

      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherBtn = otherItem.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      if (isAlreadyActive) {
        item.classList.remove('active');
        questionBtn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}


// ==========================================================================
// 6. Interactive RSVP Controller with Silent Auto-Fill from Book1.csv
// ==========================================================================

function initRSVP() {
  const form = document.getElementById('rsvpForm');
  if (!form) return;

  const guestNameInput = document.getElementById('guestName');
  const firstNameInput = document.getElementById('guestFirstName');
  const lastNameInput = document.getElementById('guestLastName');
  const editingSrNoInput = document.getElementById('editingSrNo');

  const attendanceRadios = document.querySelectorAll('input[name="attendance"]');
  const bringingGuestRadios = document.querySelectorAll('input[name="bringingGuest"]');
  const guestNameField = document.getElementById('guestNameField');
  const bringingCountInput = document.getElementById('bringingCount');
  const attendeesListTitle = document.getElementById('attendeesListTitle');
  const attendeeInputsList = document.getElementById('attendeeInputsList');
  const submitBtn = document.getElementById('rsvpSubmitBtn');

  const confirmationCard = document.getElementById('rsvpConfirmation');
  const confirmationSummary = document.getElementById('confirmationSummary');
  const resetBtn = document.getElementById('rsvpResetBtn');
  const editCurrentBtn = document.getElementById('rsvpEditCurrentBtn');

  let lastSubmittedSrNo = null;

  // Refresh latest Book1.csv records
  loadRecordsFromCsv();

  // 1. Radio Cards Visual Selection
  const allRadioInputs = form.querySelectorAll('input[type="radio"]');
  allRadioInputs.forEach(radio => {
    radio.addEventListener('change', () => {
      const groupName = radio.name;
      document.querySelectorAll(`input[name="${groupName}"]`).forEach(r => {
        const parentCard = r.closest('.radio-card');
        if (parentCard) {
          if (r.checked) {
            parentCard.classList.add('selected');
          } else {
            parentCard.classList.remove('selected');
          }
        }
      });
    });
  });

  // 2. Attendance change handler: Hide bringing guest if regrets
  attendanceRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const bringingGroup = document.getElementById('bringingGuestGroup');
      if (radio.value === 'regrets' && radio.checked) {
        if (bringingGroup) bringingGroup.style.display = 'none';
        if (guestNameField) guestNameField.classList.remove('visible');
        bringingGuestRadios.forEach(r => {
          r.checked = false;
          r.removeAttribute('required');
          const card = r.closest('.radio-card');
          if (card) card.classList.remove('selected');
        });
        clearAttendeeInputs();
      } else if (radio.value === 'attending' && radio.checked) {
        if (bringingGroup) bringingGroup.style.display = 'block';
        bringingGuestRadios.forEach(r => r.setAttribute('required', 'true'));
      }
    });
  });

  // 3. Conditional Reveal of Guests Count & Dynamic Name Fields
  bringingGuestRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'yes' && radio.checked) {
        if (guestNameField) guestNameField.classList.add('visible');
        if (bringingCountInput) {
          bringingCountInput.setAttribute('required', 'true');
          if (!bringingCountInput.value) {
            bringingCountInput.value = '1';
          }
          renderAttendeeNameInputs(parseInt(bringingCountInput.value, 10) || 1);
        }
      } else {
        if (guestNameField) guestNameField.classList.remove('visible');
        if (bringingCountInput) {
          bringingCountInput.removeAttribute('required');
        }
        clearAttendeeInputs();
      }
    });
  });

  // 4. When number of persons changes: dynamically create attendee textboxes
  if (bringingCountInput) {
    bringingCountInput.addEventListener('input', () => {
      let count = parseInt(bringingCountInput.value, 10);
      if (isNaN(count) || count < 1) {
        clearAttendeeInputs(false);
        return;
      }
      if (count > 10) {
        count = 10;
        bringingCountInput.value = '10';
      }
      renderAttendeeNameInputs(count);
    });
  }

  let currentMatchedSrNo = null;

  // Clear all selections, untick radios, and empty all textboxes
  function clearSelectionAndTextboxes() {
    currentMatchedSrNo = null;
    editingSrNoInput.value = '';
    submitBtn.textContent = 'Submit RSVP';

    // Untick all attendance radios & remove selected highlight
    attendanceRadios.forEach(r => {
      r.checked = false;
      const card = r.closest('.radio-card');
      if (card) card.classList.remove('selected');
    });

    // Untick all bringingGuest radios & remove selected highlight
    bringingGuestRadios.forEach(r => {
      r.checked = false;
      r.removeAttribute('required');
      const card = r.closest('.radio-card');
      if (card) card.classList.remove('selected');
    });

    // Reset bringingGuestGroup display to default
    const bringingGroup = document.getElementById('bringingGuestGroup');
    if (bringingGroup) bringingGroup.style.display = 'block';

    // Empty bringing count textbox
    if (bringingCountInput) {
      bringingCountInput.value = '';
      bringingCountInput.removeAttribute('required');
    }

    // Empty & clear all dynamic attendee name textboxes
    clearAttendeeInputs(true);

    // Hide conditional guests count section
    if (guestNameField) {
      guestNameField.classList.remove('visible');
    }
  }

  // 5. Automatic CSV Name Lookup: Auto-selects checkbox & auto-fills textboxes if name exists in CSV
  if (guestNameInput) {
    const handleNameInput = () => {
      checkAndAutoFillGuest(guestNameInput.value);
    };
    guestNameInput.addEventListener('input', handleNameInput);
    guestNameInput.addEventListener('change', handleNameInput);
    guestNameInput.addEventListener('keyup', handleNameInput);
    guestNameInput.addEventListener('paste', () => setTimeout(handleNameInput, 0));
    guestNameInput.addEventListener('cut', () => setTimeout(handleNameInput, 0));
  }

  function checkAndAutoFillGuest(nameValue) {
    // If name is removed / empty: empty all textboxes and untick all radios
    if (!nameValue || !nameValue.trim()) {
      clearSelectionAndTextboxes();
      return;
    }

    const trimmed = nameValue.trim().toLowerCase();
    const currentRecords = getStoredRecords();
    const match = currentRecords.find(r => (r.guestName || '').trim().toLowerCase() === trimmed);

    if (match) {
      currentMatchedSrNo = match.srNo;
      editingSrNoInput.value = match.srNo;
      submitBtn.textContent = 'Update RSVP';

      const attVal = match.attendance || 'attending';
      const attRadio = form.querySelector(`input[name="attendance"][value="${attVal}"]`);
      if (attRadio) {
        attRadio.checked = true;
        document.querySelectorAll('input[name="attendance"]').forEach(r => {
          const card = r.closest('.radio-card');
          if (card) {
            if (r.checked) card.classList.add('selected');
            else card.classList.remove('selected');
          }
        });
        attRadio.dispatchEvent(new Event('change'));
      }

      const hasAttendees = Array.isArray(match.attendees) && match.attendees.length > 0;
      const bringVal = match.bringingGuest || (hasAttendees ? 'yes' : 'no');
      const bringRadio = form.querySelector(`input[name="bringingGuest"][value="${bringVal}"]`);
      if (bringRadio) {
        bringRadio.checked = true;
        document.querySelectorAll('input[name="bringingGuest"]').forEach(r => {
          const card = r.closest('.radio-card');
          if (card) {
            if (r.checked) card.classList.add('selected');
            else card.classList.remove('selected');
          }
        });
        bringRadio.dispatchEvent(new Event('change'));
      }

      if (bringVal === 'yes') {
        if (guestNameField) guestNameField.classList.add('visible');
        const attendeeCount = (match.attendees && match.attendees.length > 0)
          ? match.attendees.length
          : (match.guestCount || 1);

        if (bringingCountInput) {
          bringingCountInput.value = attendeeCount;
        }
        renderAttendeeNameInputs(attendeeCount, match.attendees || []);
      } else {
        if (guestNameField) guestNameField.classList.remove('visible');
        clearAttendeeInputs();
      }
    } else {
      // If name does not match any CSV record:
      // If the form was previously auto-filled from a matched record, reset it!
      if (currentMatchedSrNo) {
        clearSelectionAndTextboxes();
      } else if (!lastSubmittedSrNo) {
        editingSrNoInput.value = '';
        submitBtn.textContent = 'Submit RSVP';
      }
    }
  }

  function clearAttendeeInputs(clearCount = true) {
    if (clearCount && bringingCountInput) bringingCountInput.value = '';
    if (attendeeInputsList) {
      attendeeInputsList.querySelectorAll('input').forEach(inp => { inp.value = ''; });
      attendeeInputsList.innerHTML = '';
    }
    if (attendeesListTitle) attendeesListTitle.style.display = 'none';
  }

  function renderAttendeeNameInputs(count, presetNames = []) {
    if (!attendeeInputsList) return;

    const currentValues = [];
    const existingInputs = attendeeInputsList.querySelectorAll('.attendee-name-input');
    existingInputs.forEach(inp => currentValues.push(inp.value));

    attendeeInputsList.innerHTML = '';
    if (attendeesListTitle) {
      attendeesListTitle.style.display = count > 0 ? 'block' : 'none';
    }

    for (let i = 1; i <= count; i++) {
      const existingVal = presetNames[i - 1] || currentValues[i - 1] || '';
      const groupEl = document.createElement('div');
      groupEl.className = 'attendee-input-group';
      groupEl.innerHTML = `
        <label class="attendee-group-label" for="attendeeName_${i}">
          <span class="attendee-number-badge">Attendee ${i}</span>
          Guest Full Name: <span class="required-star">*</span>
        </label>
        <input 
          type="text" 
          id="attendeeName_${i}" 
          class="form-input attendee-name-input" 
          data-index="${i}" 
          placeholder="e.g. Guest ${i} Full Name" 
          required 
          autocomplete="off"
          value="${escapeHtml(existingVal)}"
        >
      `;
      attendeeInputsList.appendChild(groupEl);
    }
  }

  // 6. Handle Form Submission (Create or Update directly in Book1.csv)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let guestName = guestNameInput ? guestNameInput.value.trim() : '';
    if (!guestName && firstNameInput && lastNameInput) {
      guestName = concatName(firstNameInput.value, lastNameInput.value);
    }

    const attendanceEl = form.querySelector('input[name="attendance"]:checked');
    const attendance = attendanceEl ? attendanceEl.value : '';
    const bringingRadio = form.querySelector('input[name="bringingGuest"]:checked');
    const bringingGuest = bringingRadio ? bringingRadio.value : 'no';

    if (!guestName) {
      alert('Please enter your name.');
      if (guestNameInput) guestNameInput.focus();
      else if (firstNameInput) firstNameInput.focus();
      return;
    }

    if (!attendance) {
      alert('Please let us know if you will be joining us on our special day.');
      return;
    }

    let bringingCount = 0;
    const attendeeNames = [];

    if (attendance === 'attending' && bringingGuest === 'yes') {
      bringingCount = parseInt(bringingCountInput.value, 10);
      if (isNaN(bringingCount) || bringingCount < 1) {
        alert('Please specify the number of guests you will be bringing with you (at least 1).');
        bringingCountInput.focus();
        return;
      }

      const attendeeInputs = attendeeInputsList.querySelectorAll('.attendee-name-input');
      let missingAttendee = false;
      attendeeInputs.forEach((inp) => {
        const val = inp.value.trim();
        if (!val) {
          missingAttendee = true;
          inp.focus();
        } else {
          attendeeNames.push(val);
        }
      });

      if (missingAttendee) {
        alert('Please provide the full name for all additional attendees.');
        return;
      }
    }

    const editingSrNo = editingSrNoInput.value ? parseInt(editingSrNoInput.value, 10) : null;

    submitBtn.disabled = true;
    submitBtn.textContent = editingSrNo ? 'Updating RSVP...' : 'Submitting RSVP...';

    try {
      let savedRecord = null;

      if (editingSrNo) {
        savedRecord = await updateGuest(editingSrNo, {
          guestName,
          attendance,
          bringingGuest,
          attendees: attendeeNames
        });
      }

      if (!savedRecord) {
        savedRecord = await createGuest({
          guestName,
          attendance,
          bringingGuest,
          attendees: attendeeNames
        });
      }

      lastSubmittedSrNo = savedRecord.srNo;

      form.style.display = 'none';
      if (confirmationCard) confirmationCard.classList.add('active');

      if (confirmationSummary) {
        const statusText = savedRecord.attendance === 'attending'
          ? 'Joyfully Attending'
          : 'Regretfully Unable to Attend';

        let attendeeHtml = '';
        if (savedRecord.attendees && savedRecord.attendees.length > 0) {
          attendeeHtml = `
            <div style="margin-top: 0.6rem;">
              <strong>Additional Attendees (${savedRecord.attendees.length}):</strong>
              <ul style="margin: 0.3rem 0 0 1.2rem; padding: 0;">
                ${savedRecord.attendees.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
              </ul>
            </div>
          `;
        }

        confirmationSummary.innerHTML = `
          <strong>Guest Name:</strong> ${escapeHtml(savedRecord.guestName)}<br>
          <strong>Status:</strong> ${statusText}<br>
          <strong>Total Attendee Count:</strong> ${savedRecord.totalAttendee} ${savedRecord.totalAttendee === 1 ? 'person' : 'persons'}
          ${attendeeHtml}
        `;
      }
    } catch (err) {
      console.error('[RSVP] Save error:', err);
      alert('An error occurred while saving to Book1.csv. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit RSVP';
      if (confirmationCard) {
        window.scrollTo({ top: confirmationCard.offsetTop - 40, behavior: 'smooth' });
      }
    }
  });

  // 7. Reset Form / Submit Another Response
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetFormToBlank();
      if (confirmationCard) confirmationCard.classList.remove('active');
      form.style.display = 'block';
      window.scrollTo({ top: form.offsetTop - 40, behavior: 'smooth' });
    });
  }

  // 8. Edit Current Response from Confirmation Screen
  if (editCurrentBtn) {
    editCurrentBtn.addEventListener('click', () => {
      if (lastSubmittedSrNo) {
        loadRecordForEditing(lastSubmittedSrNo);
      }
    });
  }

  function resetFormToBlank() {
    form.reset();
    if (guestNameInput) guestNameInput.value = '';
    clearSelectionAndTextboxes();
  }

  function loadRecordForEditing(srNo) {
    const currentRecords = getStoredRecords();
    const record = currentRecords.find(r => Number(r.srNo) === Number(srNo));
    if (!record) return;

    currentMatchedSrNo = record.srNo;

    if (confirmationCard) confirmationCard.classList.remove('active');
    form.style.display = 'block';

    editingSrNoInput.value = record.srNo;
    submitBtn.textContent = 'Update RSVP';

    const resolvedName = record.guestName || concatName(record.firstName, record.lastName);
    if (guestNameInput) {
      guestNameInput.value = resolvedName;
    }
    if (firstNameInput && lastNameInput) {
      firstNameInput.value = record.firstName || '';
      lastNameInput.value = record.lastName || '';
    }

    const attRadio = form.querySelector(`input[name="attendance"][value="${record.attendance}"]`);
    if (attRadio) {
      attRadio.checked = true;
      const card = attRadio.closest('.radio-card');
      if (card) card.classList.add('selected');
      attRadio.dispatchEvent(new Event('change'));
    }

    const bringRadio = form.querySelector(`input[name="bringingGuest"][value="${record.bringingGuest || 'no'}"]`);
    if (bringRadio) {
      bringRadio.checked = true;
      const card = bringRadio.closest('.radio-card');
      if (card) card.classList.add('selected');
      bringRadio.dispatchEvent(new Event('change'));
    }

    if (record.bringingGuest === 'yes' && record.attendees && record.attendees.length > 0) {
      if (bringingCountInput) bringingCountInput.value = record.attendees.length;
      renderAttendeeNameInputs(record.attendees.length, record.attendees);
    }

    window.scrollTo({ top: form.offsetTop - 40, behavior: 'smooth' });
    if (guestNameInput) guestNameInput.focus();
    else if (firstNameInput) firstNameInput.focus();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}


// ==========================================================================
// 7. 3D Antigravity Mouse Parallax
// ==========================================================================

function initAntigravityParallax() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ('ontouchstart' in window) return;

  // Parallax configuration hooks
}


// ==========================================================================
// 8. DOMContentLoaded Master Initialization
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Single-Page Navigation & Router
  initNavigation();

  // 2. Initialize 3D Envelope Animation
  initEnvelope(() => {
    showScreen('invitation');
  });

  // 3. Initialize Live Countdown Clock
  initCountdown();

  // 4. Initialize FAQ Accordions
  initAccordion();

  // 5. Initialize Interactive RSVP Form with CSV Engine
  initRSVP();

  // 6. Initialize 3D Antigravity Parallax
  initAntigravityParallax();
});
