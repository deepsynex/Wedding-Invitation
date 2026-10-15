/**
 * Interactive RSVP Form Controller & Local Persistence
 */

export function initRSVP() {
  const form = document.getElementById('rsvpForm');
  const plusOneRadios = document.querySelectorAll('input[name="bringingGuest"]');
  const guestNameField = document.getElementById('guestNameField');
  const guestNameInput = document.getElementById('plusOneName');
  const confirmationCard = document.getElementById('rsvpConfirmation');
  const submitBtn = document.getElementById('rsvpSubmitBtn');

  if (!form) return;

  // Visual selection highlighting on radio cards
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

  // Conditional reveal of plus-one guest name field
  plusOneRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'yes' && radio.checked) {
        guestNameField.classList.add('visible');
        guestNameInput.setAttribute('required', 'true');
      } else {
        guestNameField.classList.remove('visible');
        guestNameInput.removeAttribute('required');
        guestNameInput.value = '';
      }
    });
  });

  // Handle Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const submission = {
      name: formData.get('guestName') ? formData.get('guestName').trim() : '',
      attendance: formData.get('attendance'),
      bringingGuest: formData.get('bringingGuest'),
      plusOneName: formData.get('plusOneName') ? formData.get('plusOneName').trim() : '',
      submittedAt: new Date().toISOString()
    };

    // Client-side validation check
    if (!submission.name) {
      alert('Please enter your full name.');
      return;
    }
    if (!submission.attendance) {
      alert('Please let us know if you will be joining us.');
      return;
    }

    // Button loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Recording your response...';

    // Simulate seamless network latency / webhook storage
    setTimeout(() => {
      // Save locally
      try {
        const existing = JSON.parse(localStorage.getItem('wedding_rsvp_mary_raja') || '[]');
        existing.push(submission);
        localStorage.setItem('wedding_rsvp_mary_raja', JSON.stringify(existing));
      } catch (err) {
        console.warn('Storage error:', err);
      }

      // Display Confirmation Card
      form.style.display = 'none';
      if (confirmationCard) {
        confirmationCard.classList.add('active');

        // Populate summary details
        const summaryEl = document.getElementById('confirmationSummary');
        if (summaryEl) {
          const attendanceText = submission.attendance === 'attending' 
            ? 'Attending with joy' 
            : 'Sending warm wishes from afar';
          const guestText = submission.bringingGuest === 'yes' && submission.plusOneName
            ? `<br><strong>Guest:</strong> ${submission.plusOneName}`
            : '';

          summaryEl.innerHTML = `
            <strong>Guest:</strong> ${submission.name}<br>
            <strong>Status:</strong> ${attendanceText}
            ${guestText}
          `;
        }
      }

      // Scroll smoothly to top of confirmation
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  });

  // Allow resetting / submitting another response
  const resetBtn = document.getElementById('rsvpResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      allRadioInputs.forEach(r => {
        const card = r.closest('.radio-card');
        if (card) card.classList.remove('selected');
      });
      guestNameField.classList.remove('visible');
      guestNameInput.removeAttribute('required');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit RSVP';
      confirmationCard.classList.remove('active');
      form.style.display = 'block';
    });
  }
}
