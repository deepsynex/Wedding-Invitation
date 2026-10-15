/**
 * Single-Page Screen Router & Navigation Controller
 */

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
  '5': 'screen-rsvp-form'
};

export function showScreen(screenKey, updateHistory = true) {
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

// Make showScreen globally accessible for inline onclick handlers and direct triggers
if (typeof window !== 'undefined') {
  window.showScreen = showScreen;
}

export function initNavigation() {
  // Listen for elements with data-nav-target or .rsvp-pocket-btn
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

  // Handle browser back/forward buttons
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

  // Check initial query parameter or hash on load
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
