/**
 * 3D Envelope Unseal & Opening Animation Controller
 * Uses GSAP physics for buttery-smooth unsealing and card emergence
 */

export function initEnvelope(onOpenedCallback) {
  const envelopeStage = document.getElementById('envelopeStage');
  const waxSeal = document.getElementById('waxSeal');
  const openPrompt = document.getElementById('envelopePrompt');

  if (!envelopeStage) return;

  let isOpening = false;

  function triggerOpen() {
    if (isOpening) return;
    isOpening = true;

    // Check if GSAP is available
    if (typeof gsap !== 'undefined') {
      const tl = gsap.timeline({
        onComplete: () => {
          if (typeof onOpenedCallback === 'function') {
            onOpenedCallback();
          }

          // Animate card rising from envelope on Screen 2
          const invitationCard = document.getElementById('invitationCard');
          if (invitationCard) {
            // Glides smoothly upward from tucked position (y: 360) to resting position (y: 0)
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

            // Keep clipped photo liner visible inside envelope cavity matching Image 4
            gsap.to('.env-layer-photo', {
              opacity: 1,
              duration: 1.1,
              ease: 'power2.out'
            });
          }

          // Reset opening flag and restore initial styles after transition
          setTimeout(() => {
            gsap.set(['#waxSeal', '.envelope-lily-stem', '.closed-envelope-wrapper'], {
              clearProps: 'all'
            });
            isOpening = false;
          }, 1000);
        }
      });

      // 1. Wax seal gently pops and dissolves
      tl.to('#waxSeal', {
        scale: 1.3,
        opacity: 0,
        duration: 0.45,
        ease: 'power2.out'
      }, 0);

      // 2. Lily stem glides gracefully aside
      tl.to('.envelope-lily-stem', {
        x: 35,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in'
      }, 0.05);

      // 3. Envelope body expands softly
      tl.to('.closed-envelope-wrapper', {
        scale: 1.05,
        opacity: 0,
        duration: 0.65,
        ease: 'power2.inOut'
      }, 0.15);

    } else {
      // Graceful fallback if GSAP CDN is blocked
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

  // Trigger on click anywhere on envelope, wax seal, or prompt
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
