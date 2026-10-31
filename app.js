/**
 * ==========================================================================
 * Mary & Raja Wedding Invitation - All-in-One Master JavaScript Controller
 * ==========================================================================
 * 
 * Includes:
 * 1. Wedding List Complete.xlsx Direct CRUD Controller (zero localStorage)
 * 2. Single-Page Navigation & Route Controller
 * 3. 3D Envelope Unseal & GSAP Animation Engine
 * 4. Live Ceremony Countdown Clock (Dubai GST / UTC+4)
 * 5. Accessible FAQ Accordions
 * 6. Interactive RSVP Form with Silent Auto-Fill & Dynamic Attendees
 * 7. 3D Antigravity Spatial Motion & Mouse Parallax
 */

// ==========================================================================
// 1. Wedding List Complete.xlsx Direct CRUD Controller (zero localStorage)
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

let lastRsvpError = null;

/**
 * Load guest records from "Wedding List Complete.xlsx" via the PHP AJAX endpoint.
 */
async function loadRecordsFromCsv() {
  const endpoints = [
    'rsvp.php',
    'http://127.0.0.1:8000/rsvp.php',
    'http://localhost:8000/rsvp.php'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      if (res.ok) {
        const text = await res.text();
        if (text.trim().startsWith('<?php')) {
          // Uninterpreted PHP script from static server (e.g. VS Code Live Server). Skip to real PHP endpoint.
          continue;
        }
        const json = JSON.parse(text);
        if (json && Array.isArray(json.records)) {
          records = json.records;
          return records;
        }
      }
    } catch {
      // Try next endpoint
    }
  }

  return records;
}

/**
 * Submit RSVP data via PHP AJAX call directly to rsvp.php to save in Wedding List Complete.xlsx.
 */
/**
 * Look up one guest's saved phone number by their exact name.
 */
async function fetchGuestPhone(guestName) {
  const endpoints = [
    'rsvp.php',
    'http://127.0.0.1:8000/rsvp.php',
    'http://localhost:8000/rsvp.php'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${ep}?name=${encodeURIComponent(guestName)}`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      if (res.ok) {
        const text = await res.text();
        if (text.trim().startsWith('<?php')) continue;
        const json = JSON.parse(text);
        return (json && json.phone) || '';
      }
    } catch {
      // Try next endpoint
    }
  }
  return '';
}

async function submitRsvpToPhp(payload) {
  lastRsvpError = null;
  const endpoints = [
    'rsvp.php',
    'http://127.0.0.1:8000/rsvp.php',
    'http://localhost:8000/rsvp.php'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      if (text.trim().startsWith('<?php')) {
        // VS Code Live Server returned raw PHP text instead of executing it. Try real PHP server.
        continue;
      }
      const json = JSON.parse(text);
      if (res.ok && json && json.success) {
        if (Array.isArray(json.records)) {
          records = json.records;
        }
        return json.record || null;
      } else if (json && json.message) {
        lastRsvpError = json.message;
      }
    } catch {
      // Try next endpoint
    }
  }

  return null;
}

function getStoredRecords() {
  return records;
}

/**
 * Save records directly to Wedding List Complete.xlsx on disk via backend API.
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

// Initial load directly from Wedding List Complete.xlsx
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
  main: 'screen-main',
  hero: 'screen-main',
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

const SCREEN_HASHES = {
  'screen-envelope': 'envelope',
  'screen-main': 'invitation',
  'screen-details': 'details',
  'screen-rsvp-prompt': 'rsvp-prompt',
  'screen-rsvp-form': 'rsvp-form'
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

  const mainScreen = document.getElementById('screen-main');
  if (mainScreen) {
    const isMain = targetId === 'screen-main';
    document.body.classList.toggle('main-paging-active', isMain);
    mainScreen.classList.toggle('main-paging', isMain);
  }

  if (targetId === 'screen-envelope') {
    document.dispatchEvent(new Event('envelope:reset'));
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (updateHistory) {
    const hash = SCREEN_HASHES[targetId] || screenKey;
    if (window.location.hash !== `#${hash}`) {
      history.pushState({ screen: hash }, '', `#${hash}`);
    }
  }
}

if (typeof window !== 'undefined') {
  window.showScreen = showScreen;
}

function initNavigation() {
  document.addEventListener('click', (e) => {
    const petalEl = e.target.closest('.details-petal-badge, .petal-btn');
    if (petalEl) {
      e.preventDefault();
      showScreen('details');
      return;
    }

    const rsvpBtn = e.target.closest('.rsvp-pocket-btn, .rsvp-envelope-card');
    if (rsvpBtn) {
      e.preventDefault();
      showScreen('rsvp-form');
      return;
    }

    const targetEl = e.target.closest('[data-nav-target]');
    if (targetEl) {
      e.preventDefault();
      const targetScreen = targetEl.getAttribute('data-nav-target');
      showScreen(targetScreen);
      return;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.classList.contains('details-petal-badge') || activeEl.closest('.details-petal-badge'))) {
        e.preventDefault();
        showScreen('details');
        return;
      }
      if (activeEl && (activeEl.classList.contains('rsvp-envelope-card') || activeEl.closest('.rsvp-envelope-card'))) {
        e.preventDefault();
        showScreen('rsvp-form');
        return;
      }
      if (activeEl && (activeEl.id === 'invitationCard' || activeEl.closest('.env-layer-card, .env-layer-back, .env-layer'))) {
        e.preventDefault();
        const storyEl = document.getElementById('story-section') || document.querySelector('.story-section');
        if (storyEl) {
          storyEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
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

  document.addEventListener('envelope:reset', () => {
    isOpening = false;
    envelopeStage.classList.remove('unsealing');
    if (typeof gsap !== 'undefined') {
      gsap.set(['#waxSeal', '.envelope-lily-stem', '.closed-envelope-wrapper'], { clearProps: 'all' });
    }
  });
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
// 6. Interactive RSVP Controller with Silent Auto-Fill from Wedding List Complete.xlsx
// ==========================================================================

// Maximum 6 people per party: the guest + Party Member 2..6 in the sheet
const MAX_ADDITIONAL_GUESTS = 5;

function initRSVP() {
  const form = document.getElementById('rsvpForm');
  if (!form) return;

  const guestNameInput = document.getElementById('guestName');
  const guestPhoneInput = document.getElementById('guestPhone');
  let phoneAutoFilled = false;
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

  const guestNameError = document.getElementById('guestNameError');
  const guestPhoneError = document.getElementById('guestPhoneError');
  const attendanceGroup = document.getElementById('attendanceGroup');
  const attendanceError = document.getElementById('attendanceError');
  const bringingCountError = document.getElementById('bringingCountError');
  const formRest = document.getElementById('rsvpFormRest');
  let formRestTimer = null;

  // Show the fields after "Your Name" only once a name has been entered
  function setFormRestVisible(show) {
    if (formRest) formRest.classList.toggle('visible', show);
  }

  function showFieldError(errorEl, message, inputEl) {
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.toggle('active', !!message);
    }
    if (inputEl) inputEl.classList.toggle('input-error', !!message);
  }

  function clearFieldError(errorEl, inputEl) {
    showFieldError(errorEl, '', inputEl);
  }

  function clearAllFieldErrors() {
    clearFieldError(guestNameError, guestNameInput);
    clearFieldError(guestPhoneError, guestPhoneInput);
    clearFieldError(attendanceError, attendanceGroup);
    clearFieldError(bringingCountError, bringingCountInput);
    if (attendeeInputsList) {
      attendeeInputsList.querySelectorAll('.attendee-name-input').forEach((inp) => {
        clearFieldError(document.getElementById(`attendeeNameError_${inp.dataset.index}`), inp);
      });
    }
  }

  if (guestNameInput) {
    guestNameInput.addEventListener('input', () => clearFieldError(guestNameError, guestNameInput));
  }
  if (guestPhoneInput) {
    guestPhoneInput.addEventListener('input', () => {
      phoneAutoFilled = false;
      clearFieldError(guestPhoneError, guestPhoneInput);
    });
  }
  attendanceRadios.forEach((radio) => {
    radio.addEventListener('change', () => clearFieldError(attendanceError, attendanceGroup));
  });
  if (bringingCountInput) {
    bringingCountInput.addEventListener('input', () => clearFieldError(bringingCountError, bringingCountInput));
  }
  if (attendeeInputsList) {
    attendeeInputsList.addEventListener('input', (e) => {
      const inp = e.target.closest('.attendee-name-input');
      if (inp) clearFieldError(document.getElementById(`attendeeNameError_${inp.dataset.index}`), inp);
    });
  }

  const confirmationCard = document.getElementById('rsvpConfirmation');
  const confirmationSummary = document.getElementById('confirmationSummary');
  const resetBtn = document.getElementById('rsvpResetBtn');
  const editCurrentBtn = document.getElementById('rsvpEditCurrentBtn');

  let lastSubmittedSrNo = null;

  // Refresh latest Wedding List Complete.xlsx records, then re-check a name typed meanwhile
  loadRecordsFromCsv().then(() => {
    if (guestNameInput && guestNameInput.value.trim()) checkAndAutoFillGuest(guestNameInput.value);
  });

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
      if (count > MAX_ADDITIONAL_GUESTS) {
        count = MAX_ADDITIONAL_GUESTS;
        bringingCountInput.value = String(MAX_ADDITIONAL_GUESTS);
      }
      renderAttendeeNameInputs(count);
    });
  }

  let currentMatchedSrNo = null;
  let phoneLookupSrNo = null;

  // Clear all selections, untick radios, and empty all textboxes
  function clearSelectionAndTextboxes() {
    // Only clear the phone if it was auto-filled from a matched guest row
    if (phoneAutoFilled && guestPhoneInput) guestPhoneInput.value = '';
    phoneAutoFilled = false;
    phoneLookupSrNo = null;
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

    // Tell the guest their name isn't on the list shortly after they stop typing
    guestNameInput.addEventListener('input', () => {
      clearTimeout(formRestTimer);
      if (!guestNameInput.value.trim()) return;
      formRestTimer = setTimeout(showGuestNotFoundError, 700);
    });
    guestNameInput.addEventListener('blur', showGuestNotFoundError);
    guestNameInput.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      if (findGuestRecord(guestNameInput.value)) {
        if (guestPhoneInput) guestPhoneInput.focus();
      } else {
        showGuestNotFoundError();
      }
    });
  }

  // Ignore case and stray / repeated spaces (\s also covers non-breaking spaces)
  function findGuestRecord(nameValue) {
    const normalize = (str) => (str || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const trimmed = normalize(nameValue);
    if (!trimmed) return null;
    return getStoredRecords().find(r => normalize(r.guestName) === trimmed) || null;
  }

  // Only guests already on the list may RSVP: the rest of the form stays hidden
  function showGuestNotFoundError() {
    if (!guestNameInput || !guestNameInput.value.trim() || findGuestRecord(guestNameInput.value)) return;
    showFieldError(guestNameError, 'Please double-check your spelling and make sure your full name is entered correctly.', guestNameInput);
  }

  function checkAndAutoFillGuest(nameValue) {
    // If name is removed / empty: empty all textboxes and untick all radios
    if (!nameValue || !nameValue.trim()) {
      clearSelectionAndTextboxes();
      setFormRestVisible(false);
      return;
    }

    const match = findGuestRecord(nameValue);

    if (match) {
      clearFieldError(guestNameError, guestNameInput);
      setFormRestVisible(true);
      currentMatchedSrNo = match.srNo;
      autoFillPhone(match);
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
      // Name not on the guest list: hide the form, and reset it if it was auto-filled
      setFormRestVisible(false);
      if (currentMatchedSrNo) {
        clearSelectionAndTextboxes();
      }
    }
  }

  // Fill the phone textbox from the sheet when the guest's number is on file
  async function autoFillPhone(match) {
    if (!guestPhoneInput || phoneLookupSrNo === match.srNo) return;
    phoneLookupSrNo = match.srNo;

    const phone = await fetchGuestPhone(match.guestName);
    // Ignore the result if the name changed meanwhile or the guest typed a number
    if (!phone || currentMatchedSrNo !== match.srNo) return;
    if (guestPhoneInput.value.trim() && !phoneAutoFilled) return;

    guestPhoneInput.value = phone;
    phoneAutoFilled = true;
    clearFieldError(guestPhoneError, guestPhoneInput);
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
        <span class="field-error" id="attendeeNameError_${i}"></span>
      `;
      attendeeInputsList.appendChild(groupEl);
    }
  }

  // 6. Handle Form Submission (Create or Update directly in Wedding List Complete.xlsx)
  async function handleRsvpSubmit(e) {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    clearAllFieldErrors();

    let guestName = guestNameInput ? guestNameInput.value.trim() : '';
    if (!guestName && firstNameInput && lastNameInput) {
      guestName = concatName(firstNameInput.value, lastNameInput.value);
    }

    const attendanceEl = form.querySelector('input[name="attendance"]:checked');
    const attendance = attendanceEl ? attendanceEl.value : '';
    const bringingRadio = form.querySelector('input[name="bringingGuest"]:checked');
    const bringingGuest = bringingRadio ? bringingRadio.value : 'no';

    if (!guestName) {
      showFieldError(guestNameError, 'Please enter your name.', guestNameInput);
      if (guestNameInput) guestNameInput.focus();
      else if (firstNameInput) firstNameInput.focus();
      return;
    }

    if (!findGuestRecord(guestName)) {
      setFormRestVisible(false);
      showGuestNotFoundError();
      if (guestNameInput) guestNameInput.focus();
      return;
    }

    const phone = guestPhoneInput ? guestPhoneInput.value.trim() : '';
    if (!phone) {
      showFieldError(guestPhoneError, 'Please enter your phone number.', guestPhoneInput);
      if (guestPhoneInput) guestPhoneInput.focus();
      return;
    }
    if (!/^\+?[0-9\s\-()]{7,20}$/.test(phone)) {
      showFieldError(guestPhoneError, 'Please enter a valid phone number (digits, spaces, + and - only).', guestPhoneInput);
      if (guestPhoneInput) guestPhoneInput.focus();
      return;
    }

    if (!attendance) {
      showFieldError(attendanceError, 'Please let us know if you will be joining us on our special day.', attendanceGroup);
      return;
    }

    let bringingCount = 0;
    const attendeeNames = [];

    if (attendance === 'attending' && bringingGuest === 'yes') {
      bringingCount = parseInt(bringingCountInput.value, 10);
      if (isNaN(bringingCount) || bringingCount < 1) {
        showFieldError(bringingCountError, 'Please specify the number of guests you will be bringing with you (at least 1).', bringingCountInput);
        bringingCountInput.focus();
        return;
      }
      if (bringingCount > MAX_ADDITIONAL_GUESTS) {
        showFieldError(bringingCountError, `You can bring up to ${MAX_ADDITIONAL_GUESTS} guests (maximum 6 people per party, including you).`, bringingCountInput);
        bringingCountInput.focus();
        return;
      }

      const attendeeInputs = attendeeInputsList.querySelectorAll('.attendee-name-input');
      let missingAttendee = false;
      let firstMissingInput = null;
      attendeeInputs.forEach((inp) => {
        const val = inp.value.trim();
        const errEl = document.getElementById(`attendeeNameError_${inp.dataset.index}`);
        if (!val) {
          missingAttendee = true;
          if (!firstMissingInput) firstMissingInput = inp;
          showFieldError(errEl, 'Please provide the full name for this guest.', inp);
        } else {
          attendeeNames.push(val);
        }
      });

      if (missingAttendee) {
        if (firstMissingInput) firstMissingInput.focus();
        return;
      }
    }

    const editingSrNo = editingSrNoInput.value ? parseInt(editingSrNoInput.value, 10) : null;

    submitBtn.disabled = true;
    submitBtn.textContent = editingSrNo ? 'Updating RSVP...' : 'Submitting RSVP...';

    try {
      const payload = {
        editingSrNo,
        guestName,
        phone,
        attendance,
        bringingGuest,
        attendees: attendeeNames
      };

      // 1. Submit RSVP data via PHP AJAX call directly to rsvp.php
      let savedRecord = await submitRsvpToPhp(payload);

      if (!savedRecord) {
        const errorMsg = lastRsvpError || 'Sorry, we could not save your RSVP. Please try again.';
        alert(errorMsg);
        submitBtn.disabled = false;
        submitBtn.textContent = editingSrNo ? 'Update RSVP' : 'Submit RSVP';
        return;
      }

      lastSubmittedSrNo = savedRecord.srNo;

      form.style.display = 'none';
      if (confirmationCard) {
        confirmationCard.classList.add('active');
      }

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
          <strong>Phone Number:</strong> ${escapeHtml(savedRecord.phone)}<br>
          <strong>Status:</strong> ${statusText}<br>
          <strong>Total Attendee Count:</strong> ${savedRecord.totalAttendee} ${savedRecord.totalAttendee === 1 ? 'person' : 'persons'}
          ${attendeeHtml}
        `;
      }
    } catch (err) {
      console.error('[RSVP] Save error:', err);
      alert('An error occurred while saving your RSVP. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit RSVP';
      if (confirmationCard) {
        window.scrollTo({ top: confirmationCard.offsetTop - 40, behavior: 'smooth' });
      }
    }
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', handleRsvpSubmit);
  }
  form.addEventListener('submit', handleRsvpSubmit);

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
    setFormRestVisible(false);
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
    setFormRestVisible(true);
    if (guestPhoneInput && record.phone) {
      guestPhoneInput.value = record.phone;
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

// ==========================================================================
// 7. Main Screen One-at-a-Time Section Paging (swipe on touch, click on desktop)
// ==========================================================================

function initMainSectionPaging() {
  const mainScreen = document.getElementById('screen-main');
  if (!mainScreen) return;

  const sections = Array.from(mainScreen.querySelectorAll(':scope > .main-page-section'));
  if (sections.length < 2) return;

  const NON_ADVANCE_SELECTOR = [
    'button', 'a[href]', 'input', 'select', 'textarea', 'label',
    '[data-nav-target]', '.petal-btn', '.details-petal-badge',
    '.rsvp-pocket-btn', '.rsvp-envelope-card', '.main-page-dot', '.main-page-nav-arrow', '.main-page-dots'
  ].join(', ');
  const SWIPE_THRESHOLD = 50;
  const ANIMATION_LOCK_MS = 700;

  let currentIndex = sections.findIndex((s) => s.classList.contains('section-active'));
  if (currentIndex === -1) {
    currentIndex = 0;
    sections[0].classList.add('section-active');
  }
  let isAnimating = false;

  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'main-page-dots';
  dotsWrap.setAttribute('role', 'navigation');
  dotsWrap.setAttribute('aria-label', 'Section navigation');

  const upArrow = document.createElement('button');
  upArrow.type = 'button';
  upArrow.className = 'main-page-nav-arrow main-page-nav-arrow-up';
  upArrow.setAttribute('aria-label', 'Previous section');
  upArrow.setAttribute('title', 'Previous section');
  upArrow.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  `;
  upArrow.addEventListener('click', (e) => {
    e.stopPropagation();
    goPrev();
  });
  dotsWrap.appendChild(upArrow);

  const dotsList = document.createElement('div');
  dotsList.className = 'main-page-dots-list';
  dotsList.setAttribute('role', 'tablist');
  dotsList.setAttribute('aria-label', 'Section dots');

  sections.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'main-page-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to section ${i + 1} of ${sections.length}`);
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSectionIndex(i);
    });
    dotsList.appendChild(dot);
  });
  dotsWrap.appendChild(dotsList);

  const downArrow = document.createElement('button');
  downArrow.type = 'button';
  downArrow.className = 'main-page-nav-arrow main-page-nav-arrow-down';
  downArrow.setAttribute('aria-label', 'Next section');
  downArrow.setAttribute('title', 'Next section');
  downArrow.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `;
  downArrow.addEventListener('click', (e) => {
    e.stopPropagation();
    goNext();
  });
  dotsWrap.appendChild(downArrow);

  mainScreen.appendChild(dotsWrap);

  function updateDots() {
    dotsWrap.querySelectorAll('.main-page-dot').forEach((dot, i) => {
      const isActive = (i === currentIndex);
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    const isFirst = (currentIndex === 0);
    const isLast = (currentIndex === sections.length - 1);
    upArrow.disabled = isFirst;
    upArrow.classList.toggle('disabled', isFirst);
    upArrow.setAttribute('aria-disabled', isFirst ? 'true' : 'false');
    downArrow.disabled = isLast;
    downArrow.classList.toggle('disabled', isLast);
    downArrow.setAttribute('aria-disabled', isLast ? 'true' : 'false');
  }

  function goToSectionIndex(index) {
    if (isAnimating) return;
    index = Math.max(0, Math.min(sections.length - 1, index));
    if (index === currentIndex) return;

    sections[currentIndex].classList.remove('section-active');
    currentIndex = index;
    const nextSection = sections[currentIndex];
    nextSection.classList.add('section-active');
    nextSection.scrollTop = 0;
    updateDots();

    isAnimating = true;
    window.setTimeout(() => { isAnimating = false; }, ANIMATION_LOCK_MS);
  }

  function goNext() {
    goToSectionIndex(currentIndex + 1);
    const nextSection = sections[Math.min(sections.length - 1, currentIndex + 1)];
    if (nextSection && (!mainScreen.classList.contains('main-paging') || window.getComputedStyle(nextSection).position !== 'absolute')) {
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  function goPrev() { goToSectionIndex(currentIndex - 1); }
  function isMainActive() { return mainScreen.classList.contains('active'); }

  window.goNextSection = function() {
    if (isMainActive()) {
      goNext();
    } else {
      const rsvpSec = document.getElementById('rsvp-section');
      if (rsvpSec) rsvpSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  window.goPrevSection = function() {
    if (isMainActive()) {
      goPrev();
    }
  };

  // Whenever the envelope is (re)opened, the main screen should always
  // restart from the first section instead of resuming wherever it was left.
  document.addEventListener('envelope:reset', () => {
    if (currentIndex === 0) return;
    sections[currentIndex].classList.remove('section-active');
    currentIndex = 0;
    sections[0].classList.add('section-active');
    sections[0].scrollTop = 0;
    updateDots();
  });

  updateDots();

  // Click anywhere on the section (desktop / normal screens) to advance
  mainScreen.addEventListener('click', (e) => {
    if (!isMainActive()) return;
    if (e.target.closest(NON_ADVANCE_SELECTOR)) return;
    goNext();
  });

  // Swipe up/down on touch screens to move between sections
  let touchStartY = null;
  mainScreen.addEventListener('touchstart', (e) => {
    if (!isMainActive() || !e.touches || !e.touches.length) return;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  mainScreen.addEventListener('touchend', (e) => {
    if (!isMainActive() || touchStartY === null) return;
    const touchEndY = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : touchStartY;
    const deltaY = touchStartY - touchEndY;
    touchStartY = null;

    if (Math.abs(deltaY) < SWIPE_THRESHOLD) return;
    if (deltaY > 0) goNext();
    else goPrev();
  }, { passive: true });

  // Arrow keys for keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!isMainActive()) return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      goNext();
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      goPrev();
    }
  });
}

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

  // 7. Initialize One-at-a-Time Section Paging on the Main Screen
  initMainSectionPaging();
});
