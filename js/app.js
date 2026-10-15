/**
 * Master Application Controller: Mary & Raja Wedding Invitation
 * Features 3D Antigravity spatial motion, GSAP unsealing, countdown & audio
 */

import { initEnvelope } from './envelope.js';
import { initCountdown } from './countdown.js';
import { initNavigation, showScreen } from './navigation.js';
import { initAccordion } from './accordion.js';
import { initRSVP } from './rsvp.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Single-Page Navigation & Router
  initNavigation();

  // 2. Initialize 3D Envelope Animation (navigates to 'invitation' on unseal)
  initEnvelope(() => {
    showScreen('invitation');
  });

  // 3. Initialize Live Countdown Clock
  initCountdown();

  // 4. Initialize FAQ Accordions
  initAccordion();

  // 5. Initialize Interactive RSVP Form
  initRSVP();

  // 6. Initialize 3D Antigravity Mouse Parallax
  initAntigravityParallax();
});

/**
 * 3D Antigravity Mouse Parallax: Delivers tangible spatial depth & floating physics
 */
function initAntigravityParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ('ontouchstart' in window) return;

  const tiltElements = [
    { selector: '#envelopeStage', maxAngle: 8 },
    { selector: '#openedEnvelopeAssembly', maxAngle: 6 },
    { selector: '.gateway-details-card', maxAngle: 8 },
    { selector: '.rsvp-banner-section', maxAngle: 7 }
  ];

  // tiltElements.forEach(({ selector, maxAngle }) => {
  //   const el = document.querySelector(selector);
  //   if (!el) return;

  //   el.addEventListener('mousemove', (e) => {
  //     const rect = el.getBoundingClientRect();
  //     const x = (e.clientX - rect.left) / rect.width - 0.5;
  //     const y = (e.clientY - rect.top) / rect.height - 0.5;

  //     const rotX = -y * maxAngle;
  //     const rotY = x * maxAngle;

  //     if (typeof gsap !== 'undefined') {
  //       gsap.to(el, {
  //         rotateX: rotX,
  //         rotateY: rotY,
  //         duration: 0.4,
  //         ease: 'power1.out',
  //         transformPerspective: 1100
  //       });
  //     } else {
  //       el.style.transform = `perspective(1100px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  //     }
  //   });

  //   el.addEventListener('mouseleave', () => {
  //     if (typeof gsap !== 'undefined') {
  //       gsap.to(el, {
  //         rotateX: 0,
  //         rotateY: 0,
  //         duration: 0.8,
  //         ease: 'power2.out'
  //       });
  //     } else {
  //       el.style.transform = `perspective(1100px) rotateX(0deg) rotateY(0deg)`;
  //     }
  //   });
  // });
}

