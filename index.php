  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Wedding Invitation of Mary &amp; Raja</title>
  <meta name="description" content="Mary Barbar &amp; Raja Tarazi cordially invite you to celebrate their wedding on January 16, 2027 in Dubai, United Arab Emirates.">
  <meta name="robots" content="noindex, nofollow">

  <!-- Favicon & Brand Icons -->
  <link rel="icon" type="image/svg+xml" href="favicon.svg?v=2">
  <link rel="icon" type="image/x-icon" href="favicon.ico?v=2">
  <link rel="icon" type="image/png" sizes="32x32" href="assets/icons/favicon-32x32.png?v=2">
  <link rel="icon" type="image/png" sizes="16x16" href="assets/icons/favicon-16x16.png?v=2">
  <link rel="apple-touch-icon" sizes="180x180" href="assets/icons/apple-touch-icon.png?v=2">
  <meta name="theme-color" content="#fdfaf6">

  <!-- Google Fonts Preconnect & Styles -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=DM+Sans:wght@400..600&family=Pinyon+Script&display=swap" rel="stylesheet">

  <!-- GSAP Animation Engine -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>

  <!-- Master Stylesheet -->
  <link rel="stylesheet" href="style.css?v=<?php echo filemtime(__DIR__ . '/style.css'); ?>">
</head>
<body>

  <!-- =========================================================================
       SCREEN 1: THE ENVELOPE GATE (Cover / Landing - Video Frame 00:00)
       ========================================================================= -->
  <section id="screen-envelope" class="screen-view active envelope-screen" aria-label="Wedding Envelope Gate">
    <div class="envelope-header">
      <p class="envelope-subtitle">THE WEDDING INVITATION OF</p>
      <h1 class="envelope-title">Mary &amp; Raja</h1>
    </div>

    <!-- 3D Interactive Envelope Stage -->
    <div class="envelope-stage" id="envelopeStage" tabindex="0">
      <div class="closed-envelope-wrapper">
        <!-- Master Closed Envelope Artwork -->
        <img src="assets/images/close envalop.webp" alt="Wedding Invitation Envelope" class="closed-envelope-img">

        <!-- Wax Seal Cameo Stamp with Monogram -->
        <div class="wax-seal-target" id="waxSeal" title="Tap to open invitation">
          <img src="assets/images/envlop-stamp.webp" alt="Cameo wax seal stamp" class="wax-seal-img">
          <span class="wax-seal-monogram"><em>M</em><em>R</em></span>
        </div>

        <!-- Calla Lily Stem resting horizontally across envelope bottom -->
        <div class="envelope-lily-stem">
          <img src="assets/images/width_532.webp" alt="Calla lily stem" class="lily-stem-img">
        </div>
      </div>
    </div>

    <!-- Bottom Action Prompt -->
    <div class="envelope-prompt" id="envelopePrompt">
      <span class="envelope-prompt-text font-sans">TAP TO OPEN INVITATION</span>
      <span class="envelope-prompt-icon" aria-hidden="true">&#8964;</span>
    </div>
  </section>


  <!-- =========================================================================
       SCREEN 2: MAIN INVITATION HUB (Video Frames 00:01 - 00:10)
       ========================================================================= -->
  <section id="screen-main" class="screen-view invitation-screen" aria-label="Main Wedding Invitation">
    
    <!-- Top Hero Banner: Full-Bleed Calla Lilies & Opened Envelope with Sliding Card -->
    <header class="hero-banner full-bleed-banner main-page-section">
      <!-- Full-bleed floral calla lilies background -->
      <div class="hero-floral-bg">
        <img src="assets/images/bg.webp" alt="Calla lilies background" class="hero-bg-img">
      </div>

      <!-- Centered Assembly: Back Envelope + Rising Card + Front Pocket -->
      <div class="opened-envelope-assembly" id="openedEnvelopeAssembly">
        <!-- Layer 1: Back of Envelope + Open Lace Flap -->
        <div class="env-layer env-layer-back" role="button" tabindex="0" title="Click to view our story &amp; celebration details" aria-label="Opened envelope back - Click to view story and celebration details">
          <img src="assets/images/open envelop.webp" alt="Opened envelope" class="env-back-img">
        </div>

        <!-- Slot containing Rising Card (clipped at envelope bottom) -->
        <div class="env-card-slot">
          <!-- Layer 3: Formal Invitation Card that slides up -->
          <div class="env-layer env-layer-card" id="invitationCard" role="button" tabindex="0" title="Click to view our story &amp; celebration details">
            <img src="assets/images/card-composite.webp" alt="" class="card-lace-border">
            <div class="card-typography">
              <p class="card-families">TOGETHER <br> WITH THEIR FAMILIES</p>
              <h2 class="card-names">Mary Barbar</h2>
              <span class="card-ampersand">&amp;</span>
              <h2 class="card-names">Raja Tarazi</h2>
              <p class="card-invite">CORDIALLY INVITE YOU<br>TO THEIR WEDDING</p>
              <p class="card-date">JANUARY 16, 2027</p>
              <p class="card-venue">DUBAI, UNITED ARAB EMIRATES</p>
            </div>
          </div>
        </div>

        <!-- Layer 4: Front Pocket of the Envelope with Embossed Monogram -->
        <div class="env-layer env-layer-front">
          <img src="assets/images/envlop front.webp" alt="Envelope pocket" class="env-front-img">
          <div class="env-front-monogram" aria-label="MR"><span class="mono-m">M</span><span class="mono-r">R</span></div>
        </div>
      </div>
    </header>

    <!-- "The next chapter begins" Love Narrative + Live Countdown (Frame 00:05-00:06) -->
    <section class="story-section full-bleed-banner main-page-section" id="story-section" aria-label="Our Story and Celebration Countdown">
      <div class="content-container-narrow story-content">
        <h2 class="story-title">The next chapter begins</h2>
        <div class="story-body">
          <p>With grateful hearts and endless excitement, we invite you to celebrate the beginning of our forever.</p>
          <p>As we gather with our favorite people, we look forward to sharing a day filled with love, laughter, and cherished memories. Your presence is the greatest gift, and it would mean so much to have you by our side as we say &ldquo;I do.&rdquo;</p>
          <p>Thank you for being part of our journey. We can't wait to celebrate this special day with you. Explore the details below.</p>
        </div>
        <div class="story-signoff">
          <span class="with-love">With Love,</span>
          <span class="couple-names">Mary &amp; Raja</span>
        </div>
      </div>

      <div class="countdown-section" id="countdown-container" aria-label="Celebration Countdown">
        <div class="content-container">
          <h3 class="countdown-heading">Our celebration begins in</h3>
          <div class="countdown-grid" role="timer" aria-live="polite">
            <div class="countdown-item">
              <span class="countdown-digits" id="days">--</span>
              <span class="countdown-label">DAYS</span>
            </div>
            <span class="countdown-divider" aria-hidden="true">:</span>
            <div class="countdown-item">
              <span class="countdown-digits" id="hours">--</span>
              <span class="countdown-label">HOURS</span>
            </div>
            <span class="countdown-divider" aria-hidden="true">:</span>
            <div class="countdown-item">
              <span class="countdown-digits" id="minutes">--</span>
              <span class="countdown-label">MINUTES</span>
            </div>
            <span class="countdown-divider" aria-hidden="true">:</span>
            <div class="countdown-item">
              <span class="countdown-digits" id="seconds">--</span>
              <span class="countdown-label">SECONDS</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Gateway Navigation 1: The Details (Painted Flower Petal Badge - Frame 00:07) -->
    <section class="gateway-details-section full-bleed-banner main-page-section" aria-label="Wedding Details Gateway">
      <div class="gateway-details-card" aria-label="Wedding Details Gateway">
        <div class="details-petal-badge" data-nav-target="details" role="button" tabindex="0" onclick="window.showScreen &amp;&amp; window.showScreen('details')" aria-label="View Wedding Details">
          <img src="assets/images/width_800.webp" alt="The Details badge" class="petal-badge-bg">
          <div class="petal-badge-content">
            <h3 class="petal-badge-title">The Details</h3>
            <button type="button" class="petal-btn" data-nav-target="details" onclick="event.stopPropagation(); window.showScreen &amp;&amp; window.showScreen('details');" aria-label="View Wedding Details">VIEW DETAILS</button>
          </div>
          <img src="assets/images/lily-horizontal.webp" alt="Calla lily accent" class="petal-badge-lily">
        </div>
      </div>
    </section>

    <!-- Gateway Navigation 2: Kindly RSVP (Champagne Bokeh Keepsake - Layered DOM Assembly) -->
    <section class="rsvp-banner-section full-bleed-banner main-page-section" id="rsvp-section" aria-label="RSVP Keepsake Banner">
      <div class="rsvp-champagne-backdrop">
        <div class="rsvp-envelope-card" data-nav-target="rsvp-form" onclick="window.showScreen &amp;&amp; window.showScreen('rsvp-form')" role="button" tabindex="0" aria-label="Kindly RSVP - Open response form">
          <!-- Layer 1: Scalloped Open Envelope Back -->
          <img src="assets/images/open envelop.webp" alt="Open envelope" class="rsvp-layer-back" loading="lazy">

          <!-- Layer 2: Black & White Keepsake Couple Photo Card -->
          <div class="rsvp-card-photo-wrap">
            <img src="assets/images/couple-keepsake-card.webp" alt="Mary and Raja keepsake photo" class="rsvp-couple-photo" loading="lazy">
          </div>

          <!-- Layer 3: Envelope Front Pocket with Typography & Action -->
          <div class="rsvp-card-pocket">
            <img src="assets/images/envlop front.webp" alt="Envelope pocket" class="rsvp-pocket-img" loading="lazy">
            <div class="rsvp-pocket-content">
              <span class="rsvp-pocket-script">Kindly Rsvp</span>
              <button type="button" class="rsvp-pocket-btn" data-nav-target="rsvp-form" onclick="event.stopPropagation(); window.showScreen &amp;&amp; window.showScreen('rsvp-form');" aria-label="Respond to RSVP">RESPOND HERE</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Monogram Hearts Footer (Frame 00:09 - 00:10) -->
    <footer class="monogram-footer main-page-section">
      <img src="assets/images/lockets-mr.png?v=2" alt="Monogram Hearts Emblem" class="footer-emblem">
      <h2 class="footer-quote">We can't wait to celebrate with you!</h2>
      <div class="footer-couple">
        <span class="footer-with-love">WITH LOVE</span>
        <span class="footer-names">Mary &amp; Raja</span>
      </div>
      <button type="button" class="footer-back-link" data-nav-target="envelope" onclick="window.showScreen &amp;&amp; window.showScreen('envelope')">&lt; BACK TO ENVELOPE</button>
    </footer>

  </section>


  <!-- =========================================================================
       SCREEN 3: THE EVENT DETAILS (Comprehensive Guide)
       ========================================================================= -->
  <section id="screen-details" class="screen-view details-screen" aria-label="Wedding Event Details">
    <div class="details-content-column">
      
      <!-- Top Navigation -->
      <div class="details-nav-bar">
        <button type="button" class="btn-back details-top-back" data-nav-target="invitation" onclick="window.showScreen &amp;&amp; window.showScreen('invitation')">&lt; GO BACK</button>
      </div>

      <!-- Header -->
      <div class="details-header">
        <h2 class="details-main-title">The Details</h2>
        <p class="details-intro-text">Here are the important details to help you plan and join us on our <br>special day. Explore the details below</p>
      </div>

      <!-- Venues 2-Column Grid -->
      <section class="venues-grid" aria-label="Wedding Venues">
        <!-- Venue 1: Ceremony -->
        <article class="venue-card">
          <img src="assets/icons/icon-church.jpg" alt="Church sketch icon" class="venue-sketch-icon">
          <h3 class="venue-type">CEREMONY</h3>
          <p class="venue-description">Our ceremony begins at 3:00 PM at <br><em>Our Lady of Annunciation</em> <br>Greek Orthodox Church. We kindly ask <br>that you arrive by 2:30 PM.</p>
          <a href="https://maps.app.goo.gl/YhZYKJNTb7ABpJzaA" target="_blank" rel="noopener noreferrer" class="btn btn-outline venue-map-btn">VIEW ON MAP</a>
        </article>

        <!-- Venue 2: Reception -->
        <article class="venue-card">
          <img src="assets/images/icon-champagne.jpg" alt="Champagne flutes sketch icon" class="venue-sketch-icon">
          <h3 class="venue-type">RECEPTION</h3>
          <p class="venue-description">Join us for the reception at 5:00 PM <br>at Address Montgomerie, <br>Dubai, UAE.</p>
          <a href="https://maps.app.goo.gl/jevp35uSRKSRtmSK8" target="_blank" rel="noopener noreferrer" class="btn btn-outline venue-map-btn">VIEW ON MAP</a>
        </article>
      </section>

      <!-- Schedule of Events Timeline -->
      <section class="timeline-section" aria-label="Schedule of Events">
        <h3 class="timeline-title">Schedule of Events</h3>
        <div class="timeline-grid">
          <!-- Event 1 -->
          <div class="timeline-item">
            <img src="assets/images/icon-church.jpg" alt="Church icon" class="timeline-sketch-icon">
            <span class="timeline-time">2:30 PM</span>
            <span class="timeline-label">Guest Arrival</span>
          </div>

          <!-- Event 2 -->
          <div class="timeline-item">
            <img src="assets/images/icon-rings.jpg" alt="Rings icon" class="timeline-sketch-icon">
            <span class="timeline-time">3:00 PM</span>
            <span class="timeline-label">The Ceremony</span>
          </div>

          <!-- Event 3 -->
          <div class="timeline-item">
            <img src="assets/images/icon-cocktail.jpg" alt="Cocktail glasses icon" class="timeline-sketch-icon">
            <span class="timeline-time">5:00 PM</span>
            <span class="timeline-label">Cocktail Hour</span>
          </div>

          <!-- Event 4 -->
          <div class="timeline-item">
            <img src="assets/images/icon-dinner.png" alt="Banquet dinner icon" class="timeline-sketch-icon dinner-event">
            <span class="timeline-time">8:00 PM</span>
            <span class="timeline-label">Dinner</span>
          </div>

          <!-- Event 5 -->
          <div class="timeline-item">
            <img src="assets/images/icon-cake.png" alt="Heart cake icon" class="timeline-sketch-icon">
            <span class="timeline-time">10:00 PM</span>
            <span class="timeline-label">Cake Cutting</span>
          </div>

          <!-- Event 6 -->
          <div class="timeline-item">
            <img src="assets/images/icon-party.jpg" alt="Disco ball icon" class="timeline-sketch-icon">
            <span class="timeline-time">11:30 PM</span>
            <span class="timeline-label">Afterparty</span>
          </div>
        </div>
      </section>

      <!-- Guest Guidelines: Children & Dress Code -->
      <section class="guidelines-section" aria-label="Guest Guidelines">
        <!-- Children Policy -->
        <article class="guideline-block">
          <h4 class="guideline-heading">CHILDREN</h4>
          <p class="guideline-text">While we adore your little ones, our wedding will be an adults-only celebration. <br>We hope you'll enjoy a relaxing evening celebrating with us.</p>
        </article>

        <!-- Dress Code -->
        <article class="guideline-block">
          <h4 class="guideline-heading">DRESS CODE<br><span class="dress-code-subheading">FORMAL GARDEN THEMED ATTIRE</span></h4>
          <div class="dress-code-text-group">
            <p class="dress-code-item"><strong>For Women:</strong> <em>Ladies are invited to wear formal attire. Long gowns, midi dresses, or elegant cocktail dresses are all welcome.</em></p>
            <p class="dress-code-item"><strong>For Men:</strong> <em>Gentlemen are encouraged to wear formal attire. A classic suit or tuxedo is recommended.</em></p>
          </div>
        </article>
      </section>

      <!-- Wedding Registry -->
      <section class="registry-section" aria-label="Wedding Registry">
        <img src="assets/images/icon-gift.jpg" alt="Gift registry sketch" class="registry-sketch-icon">
        <h3 class="registry-title">The Registery</h3>
        <p class="registry-text">Your presence at our wedding is the greatest gift of all. <br> Should you wish to celebrate with a gift, our wedding registry can be found below.</p>
        <div class="registry-bank-details">
          <p class="registry-bank-holder">Raja Tarazi</p>
          <p class="registry-bank-name">Emirates NBD</p>
          <p class="registry-bank-iban">IBAN: AE<span class="registry-bank-iban-number">310260001014872307701</span></p>
        </div>
      </section>

      <!-- Wedding FAQs Section -->
      <section class="faqs-clean-section" aria-label="Frequently Asked Questions">
        <h3 class="faqs-clean-title">Wedding FAQs</h3>
        <div class="faq-clean-item">
          <h4 class="faq-clean-question">• ARE THE CEREMONY &amp; RECEPTION INDOORS OR OUTDOORS?</h4>
          <p class="faq-clean-answer">The ceremony is indoors, at Our Lady of Annunciation. The reception and the party <br>are outdoors, whereas the afterparty moves inside to the glasshouse. Do bring <br>something warm, as January evenings in Dubai can be quite cold.</p>
        </div>
        <div class="faq-clean-item">
          <h4 class="faq-clean-question">• WHAT IS THE PARKING STATUS AT BOTH VENUES?</h4>
          <p class="faq-clean-answer"><strong>Ceremony Location:</strong> Self-parking is available, but spaces are limited. <br> We highly recommend arriving early to ensure you find a spot.</p>
          <p class="faq-clean-answer"><strong>Address Montgomerie:</strong> Both self-parking and valet parking are available.</p>
        </div>
      </section>

    </div>

    <!-- Full-Bleed Callas Photographic Footer Banner -->
    <div class="details-callas-banner full-bleed-banner" aria-label="Details Page Footer">
      <div class="details-callas-content">
        <img src="assets/images/lockets-mr.png?v=2" alt="Monogram Emblem" class="details-callas-emblem">
        <h2 class="details-callas-quote">We can't wait to celebrate with you!</h2>
        <div class="details-callas-couple">
          <span class="details-callas-with-love">WITH LOVE</span>
          <span class="details-callas-names">Mary &amp; Raja</span>
        </div>
        <button type="button" class="details-callas-back-btn" data-nav-target="invitation" onclick="window.showScreen &amp;&amp; window.showScreen('invitation')">&lt; GO BACK</button>
      </div>
    </div>

  </section>


  <!-- =========================================================================
       SCREEN 4: RSVP INVITATION PROMPT CARD (Video Frames 00:15 - 00:20)
       ========================================================================= -->
  <section id="screen-rsvp-prompt" class="screen-view rsvp-prompt-screen" aria-label="RSVP Invitation Prompt">
    <div class="rsvp-prompt-card">
      <h2 class="rsvp-prompt-title">Rsvp</h2>
      <h3 class="rsvp-prompt-subtitle">Your presence would mean the world to us</h3>
      <p class="rsvp-prompt-text">Please let us know if you'll be celebrating with us by submitting your RSVP below. We can't wait to share this unforgettable day with you.</p>
      <div class="rsvp-prompt-deadline">KINDLY RESPOND BY NOVEMBER 30, 2026</div>
      <div class="rsvp-prompt-actions">
        <button type="button" class="btn btn-outline" data-nav-target="rsvp-form" style="padding: 0.9rem 2.2rem;">PLEASE RSVP HERE</button>
        <button type="button" class="btn-back" data-nav-target="invitation">&lt; GO BACK</button>
      </div>
    </div>
  </section>


  <!-- =========================================================================
       SCREEN 5: INTERACTIVE RSVP FORM (Video Frames 00:21 - 00:36)
       ========================================================================= -->
  <section id="screen-rsvp-form" class="screen-view rsvp-form-screen" aria-label="Interactive RSVP Form">
    <div class="site-wrapper">
      
      <!-- Back button -->
      <div class="details-nav-bar" style="padding: 0 1.5rem;">
        <button type="button" class="btn-back" data-nav-target="invitation" onclick="window.showScreen &amp;&amp; window.showScreen('invitation')">&lt; GO BACK</button>
      </div>

      <div class="rsvp-form-container">
        <!-- Header -->
        <div class="rsvp-form-header">
          <img src="assets/images/lockets-mr.png?v=2" alt="Monogram Hearts Emblem" class="rsvp-form-emblem">
          <h2 class="rsvp-form-title">We'd love to celebrate with you.</h2>
          <p class="rsvp-form-subtext">We'd be honored to celebrate this special day with you. Please share your RSVP below.</p>
          <div class="rsvp-form-deadline-badge">KINDLY RESPOND BY NOVEMBER 30, 2026</div>
        </div>

        <!-- RSVP Form Element -->
        <form id="rsvpForm" novalidate onsubmit="return false;">
          <input type="hidden" id="editingSrNo" name="editingSrNo" value="">
          
          <!-- Field 1: Guest Name (Single Textbox) -->
          <div class="form-group">
            <label for="guestName" class="form-label">Your Full Name: <span class="required-star">*</span></label>
            <input type="text" id="guestName" name="guestName" class="form-input" placeholder="Your Full Name *" required autocomplete="off">
            <span class="field-error" id="guestNameError"></span>
          </div>

          <!-- Remaining fields: revealed once the guest has entered their name -->
          <div class="rsvp-form-rest" id="rsvpFormRest">

          <!-- Field 1b: Phone Number -->
          <div class="form-group">
            <label for="guestPhone" class="form-label">Phone Number: <span class="required-star">*</span></label>
            <input type="tel" id="guestPhone" name="guestPhone" class="form-input" placeholder="e.g. +971 50 123 4567" required autocomplete="tel" inputmode="tel" maxlength="20">
            <span class="field-error" id="guestPhoneError"></span>
          </div>

          <!-- Field 2: Attendance (Choice Tiles matching Video 00:23 / 00:30) -->
          <div class="form-group">
            <label class="form-label">Will you be joining us on this special day?</label>
            <div class="radio-cards-group" id="attendanceGroup">
              <label class="radio-card">
                <input type="radio" name="attendance" value="attending" required>
                <span class="radio-indicator"></span>
                <span class="radio-label">Yes, I'd love to!</span>
              </label>
              <label class="radio-card">
                <input type="radio" name="attendance" value="regrets" required>
                <span class="radio-indicator"></span>
                <span class="radio-label">Sorry, I won't be able to attend.</span>
              </label>
            </div>
            <span class="field-error" id="attendanceError"></span>
          </div>

          <!-- Field 3: Plus One Question (Choice Tiles) -->
          <div class="form-group" id="bringingGuestGroup">
            <label class="form-label">Will you be bringing someone to share this moment with you?</label>
            <div class="radio-cards-group">
              <label class="radio-card">
                <input type="radio" name="bringingGuest" value="yes" required>
                <span class="radio-indicator"></span>
                <span class="radio-label">Yes, I'll be bringing someone.</span>
              </label>
              <label class="radio-card">
                <input type="radio" name="bringingGuest" value="no" required>
                <span class="radio-indicator"></span>
                <span class="radio-label">No, I'll be attending alone.</span>
              </label>
            </div>
          </div>

          <!-- Field 4: Conditional Guests Count & Dynamic Names (revealed after ticking Yes) -->
          <div class="form-group guest-name-field" id="guestNameField">
            <div class="guest-name-field-inner">
              
              <!-- Number of Persons to Bring -->
              <div class="sub-form-group">
                <label for="bringingCount" class="form-label">How many guests will you be bringing with you? <span class="required-star">*</span></label>
                <input type="number" id="bringingCount" name="bringingCount" class="form-input" min="1" max="5" placeholder="Number of guests (e.g. 1, 2, 3...)" autocomplete="off">
                <p class="field-hint">Enter the number of guests attending with you (1 to 5). A maximum of 6 people per party, including you.</p>
                <span class="field-error" id="bringingCountError"></span>
              </div>

              <!-- Container for dynamically created Attendee Name textboxes -->
              <div class="attendees-container" id="attendeesContainer">
                <label class="form-label attendees-list-title" id="attendeesListTitle" style="display: none;">Guest Names: <span class="required-star">*</span></label>
                <div class="attendee-inputs-list" id="attendeeInputsList"></div>
              </div>

            </div>
          </div>

          <!-- Solid Black Submit Button -->
          <button type="button" id="rsvpSubmitBtn" class="rsvp-submit-btn">Submit RSVP</button>

          </div>

          <div class="rsvp-form-back-wrap">
            <button type="button" class="btn-back" data-nav-target="invitation" onclick="window.showScreen &amp;&amp; window.showScreen('invitation')">&lt; GO BACK</button>
          </div>
        </form>

        <!-- Confirmation Card State (revealed after submission) -->
        <div class="rsvp-confirmation-card" id="rsvpConfirmation">
          <div class="confirmation-check-icon">&#10003;</div>
          <h3 class="confirmation-title">Thank You!</h3>
          <p class="confirmation-message">We have received your response. It means the world to us to share this celebration with you!</p>
          <div class="confirmation-details-summary" id="confirmationSummary"></div>
          
          <div class="confirmation-actions">
            <button type="button" class="btn btn-outline" id="rsvpResetBtn">SUBMIT ANOTHER RESPONSE</button>
            <button type="button" class="btn btn-outline" id="rsvpEditCurrentBtn">EDIT THIS RESPONSE</button>
          </div>
        </div>

      </div>
    </div>
  </section>


  <!-- Master Application Script -->
  <script src="app.js?v=<?php echo filemtime(__DIR__ . '/app.js'); ?>"></script>
</body>
</html>
