/**
 * Live Countdown Engine to the Wedding Ceremony in Dubai (GST / UTC+4)
 * Target Date: January 16, 2027, 3:00 PM GST
 */

const WEDDING_TIMESTAMP = new Date('2027-01-16T15:00:00+04:00').getTime();

export function initCountdown() {
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
