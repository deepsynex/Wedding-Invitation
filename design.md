# Design Specification: Mary & Raja Wedding Invitation Website

> **Reference Template**: [Canva Design (BW011 Wedding Website Template)](https://www.canva.com/design/DAHVvEDsQfM/Fqcdl-pbdLwktA9nn-_sPw/edit)  
> **Tech Stack**: Vanilla HTML5, CSS3, JavaScript (ES6+) — Zero external runtime frameworks.  
> **Target Couple**: Mary Barbar & Raja Tarazi  
> **Date**: January 16, 2027 | Dubai, United Arab Emirates  

---

## 1. Creative Direction & Vision

The website translates a high-end, tactile stationery suite into an interactive digital experience. It combines romantic fine-art aesthetics with modern web interactions:

- **Sensory Metaphor**: The user begins by holding a physical sealed luxury envelope, breaks or unlatches the wax seal, watches the envelope unfold, and slides into the full invitation suite.
- **Atmosphere**: Warm ivory paper, delicate calla lilies, embossed gold wax seals, vintage lace borders, hand-drawn editorial sketches, and timeless typography.
- **User Journey**:
  1. **The Envelope Reveal (Intro)**: Cinematic, tactile first impression.
  2. **The Main Invitation**: Formal invitation card, welcome message, and live countdown.
  3. **The Event Details**: Two venue locations, 6-stage event timeline, dress code, registry, and FAQs.
  4. **The RSVP Hub**: Seamless, elegant response flow with guest details and confirmation.

---

## 2. Design Tokens & Visual System

### 2.1 Color Palette

```css
:root {
  /* Surface & Background */
  --color-bg-ivory: #fdf9f5;         /* Primary warm alabaster canvas */
  --color-surface-card: #ffffff;     /* Crisp fine-art paper white */
  --color-surface-card-warm: #fcf6ee;/* Warm paper tint */
  --color-surface-tint: #f6efe6;     /* Subtle cream section background */

  /* Typography & Core Accents */
  --color-text-primary: #131313;     /* Rich charcoal / editorial black */
  --color-text-muted: #5a544d;       /* Muted warm slate for secondary copy */
  --color-text-subtle: #8a8278;      /* Fine print and timestamps */

  /* Metallic & Decorative Accents */
  --color-gold-accent: #ad9475;      /* Antique champagne gold */
  --color-gold-hover: #927a5c;       /* Deep gold interaction */
  --color-border-warm: #e9d7c2;      /* Delicate lace & frame border */
  --color-border-subtle: #d0c7be;    /* Card and divider lines */
  --color-wax-seal: #ded4c5;         /* Pearlescent ivory wax seal */
  --color-wax-seal-shadow: #b3a490;  /* 3D bevel and stamp shadow */

  /* Shadows & Depth */
  --shadow-envelope: 0 20px 45px rgba(28, 22, 14, 0.12);
  --shadow-card: 0 10px 30px rgba(19, 19, 19, 0.05);
  --shadow-wax: 0 8px 18px rgba(120, 105, 85, 0.25);
  --shadow-button-hover: 0 6px 20px rgba(19, 19, 19, 0.15);
}
```

### 2.2 Typography Scale & Hierarchy

Three harmonious font families are used to reproduce the Canva design:

| Role | Font Family | Google Fonts Equivalent | Weight / Style | Primary Uses |
| :--- | :--- | :--- | :--- | :--- |
| **Flourished Script** | *newiconscript-regular* | `Pinyon Script`, `cursive` | 400 Regular | Couple Names, Section Titles ("The Details", "Schedule of Events", "Rsvp") |
| **Editorial Serif** | *Cormorant Garamond* | `Cormorant Garamond`, `serif` | 300 Light, 400 Italic, 600 SemiBold | Formal invitation wording, headings, story narrative, FAQs |
| **Modern Sans-Serif** | *Montserrat* | `Montserrat`, `sans-serif` | 300 Light, 400 Regular, 600 SemiBold | Uppercase metadata, button labels, countdown digits, times |

```css
/* Typography Tokens */
--font-script: 'Pinyon Script', cursive;
--font-serif: 'Cormorant Garamond', Georgia, serif;
--font-sans: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;

/* Font Sizes & Spacing */
--text-hero-script: clamp(2.5rem, 6vw, 4.2rem);
--text-section-script: clamp(2.0rem, 4.5vw, 3.2rem);
--text-heading-serif: clamp(1.25rem, 2.5vw, 1.75rem);
--text-body-serif: clamp(1rem, 1.8vw, 1.15rem);
--text-button-sans: 0.75rem;
--text-meta-sans: 0.7rem;

--letter-spacing-wide: 0.2em;
--letter-spacing-medium: 0.12em;
```

---

## 3. Screen-by-Screen Architecture & Layout

The project faithfully implements all 5 pages identified in the Canva original (`BW011WeddingWebsiteTemplate`):

```
┌─────────────────────────────────────────────────────────────┐
│ Screen 1: The Envelope Gate (Cover / Tap to Open)           │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Tap wax seal / envelope)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Screen 2: Main Invitation Hub                               │
│ - Formal Wedding Card & Floral Backdrop                     │
│ - "The Next Chapter Begins" Love Story                      │
│ - Live Celebration Countdown Clock                          │
│ - Visual Portal Cards: "The Details" & "Kindly RSVP"        │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
    (Click "View Details")            (Click "Respond Here")
               ▼                               ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│ Screen 3: The Details View  │ │ Screen 4: RSVP Intro Card   │
│ - Ceremony & Reception Info │ │ - "Your presence would mean │
│ - Schedule of Events (Icons)│ │    the world to us"         │
│ - Children & Dress Code     │ │ - "Kindly respond by..."    │
│ - Wedding Registry CTA      │ └──────────────┬──────────────┘
│ - Wedding FAQs (Accordions) │                │ (Click "Please RSVP")
│ - Back to Main Hub          │                ▼
└─────────────────────────────┘ ┌─────────────────────────────┐
                                │ Screen 5: Interactive Form  │
                                │ - Name & Attendance         │
                                │ - Plus-One Selection        │
                                │ - Instant Confirmation View │
                                └─────────────────────────────┘
```

---

### Screen 1: The Envelope Gate (Cover / Landing)

#### Visual Elements
- **Background**: Soft ivory linen `#fdf9f5` with delicate atmospheric lighting.
- **Top Header**:
  - `THE WEDDING INVITATION OF` (`Montserrat`, uppercase, letter-spacing: 0.22em, font-size: 0.85rem).
  - `Mary & Raja` (`Pinyon Script`, font-size: 3.5rem, color: `#131313`).
- **Interactive Envelope Component**:
  - 3D CSS textured envelope container with delicate lace scallop edge on the triangle flap.
  - Pearlescent cream wax seal stamped with oval filigree border and entwined monogram initials `M R`.
  - Botanical accent: Fresh white calla lilies resting gracefully along the bottom edge of the envelope.
- **Bottom Call to Action**:
  - `TAP TO OPEN INVITATION` (`Montserrat`, uppercase, letter-spacing: 0.25em, font-size: 0.8rem, pulsating glow).

#### Interactive Behavior
- Clicking either the wax seal or the envelope triggers an unsealing sound/visual sequence:
  1. Wax seal gently breaks and fades into position.
  2. The triangular flap rotates upwards via CSS `rotateX(-180deg)`.
  3. The formal card slides smoothly upward from the envelope pocket.
  4. The page transitions seamlessly into Screen 2 (Main Invitation).

---

### Screen 2: Main Invitation Hub

#### Visual Elements
1. **Hero Invitation Display**:
   - Card emerging from calla lily blossoms:
     - `TOGETHER WITH THEIR FAMILIES` (`Montserrat`, uppercase, 0.75rem, letter-spacing: 0.15em)
     - `Mary Barbar & Raja Tarazi` (`Pinyon Script`, 2.6rem)
     - `CORDIALLY INVITE YOU TO THEIR WEDDING` (`Cormorant Garamond`, italic, 1.1rem)
     - `JANUARY 16, 2027` (`Montserrat`, 0.85rem, bold, letter-spacing: 0.18em)
     - `DUBAI, UNITED ARAB EMIRATES` (`Montserrat`, 0.75rem, letter-spacing: 0.15em)
2. **"The Next Chapter Begins" Narrative**:
   - Section heading in flourished script: `The next chapter begins`
   - Editorial story text in `Cormorant Garamond` (italic):
     > *"With grateful hearts and endless excitement, we invite you to celebrate the beginning of our journey..."*  
     > *"As we gather with our favorite people, we look forward to sharing a day filled with love, laughter, and cherished memories. Your presence is the greatest gift, and it would mean the world to have you by our side as we say 'I do!'"*  
     > *"Thank you for being part of our journey. We can't wait to celebrate this special day with you. Explore the details below."*  
     > **With Love, Mary & Raja**
3. **Live Celebration Countdown**:
   - Subtitle: `Our celebration begins in` (`Pinyon Script`, 2.2rem)
   - 4-Box Digital Clock:
     - Digits: `117` : `22` : `38` : `50` (`Montserrat`, font-weight: 500, letter-spacing: 0.08em, 2.2rem)
     - Labels: `DAYS` · `HOURS` · `MINUTES` · `SECONDS` (`Montserrat`, 0.65rem, letter-spacing: 0.2em)
   - Synchronized live in JavaScript to January 16, 2027 15:00:00 GMT+4 (Dubai Time).
4. **Navigation Gateway Cards**:
   - **Gateway A — The Details Card**:
     - Contoured painted parchment flower petal badge.
     - Title: `The Details` (`Pinyon Script`, 2.2rem).
     - Action button: `VIEW DETAILS` (`Montserrat`, border pill/outline, hover gold fill).
     - Accent: Single stem calla lily illustration.
   - **Gateway B — Kindly RSVP Card**:
     - Ivory envelope keepsake with black-and-white couple photograph peeking out, set on champagne glassware bokeh background.
     - Title: `Kindly Rsvp` (`Pinyon Script`, 2.2rem).
     - Action button: `RESPOND HERE` / `RSVP ONLINE` (`Montserrat`, border pill, hover gold fill).
5. **Footer**:
   - Custom line engraving: Two intertwined hearts tied with a delicate ribbon bow.
   - Text: `We can't wait to celebrate with you!` (`Pinyon Script`, 1.6rem)
   - Signature: `WITH LOVE, Mary & Raja` (`Montserrat`, uppercase, 0.75rem, letter-spacing: 0.2em)
   - Anchor button: `^ BACK TO ENVELOPE` (Smooth scroll back to envelope screen).

---

### Screen 3: The Event Details (Comprehensive Guide)

#### Visual Elements
1. **Header Navigation**:
   - `< GO BACK` button at top left (`Montserrat`, 0.75rem, letter-spacing: 0.15em).
2. **Page Title**:
   - `The Details` (`Pinyon Script`, 3.2rem).
   - Subtitle: *"Here are the important details to help you plan and join us on our special day. Explore the details below"* (`Cormorant Garamond`, italic, 1.05rem).
3. **Venues Grid (2-Column Desktop / 1-Column Mobile)**:
   - **Ceremony Card**:
     - Line art icon: Vintage Church illustration.
     - Title: `CEREMONY` (`Montserrat`, bold, 0.9rem, letter-spacing: 0.18em).
     - Description: *"Our ceremony begins at 3:00 PM at Our Lady of Annunciation Greek Orthodox Church. We kindly ask that you arrive by 2:30 PM."*
     - Button: `VIEW ON MAP` (Outlined pill button linking to Google Maps query).
   - **Reception Card**:
     - Line art icon: Clinking Champagne Flutes illustration.
     - Title: `RECEPTION` (`Montserrat`, bold, 0.9rem, letter-spacing: 0.18em).
     - Description: *"Join us for the reception at 6:00 PM at Address Montgomerie, Dubai, UAE."*
     - Button: `VIEW ON MAP` (Outlined pill button linking to Google Maps query).
4. **Schedule of Events Timeline**:
   - Section Title: `Schedule of Events` (`Pinyon Script`, 2.6rem).
   - Visual 6-point timeline with minimalist line icons:
     - **2:30 PM** — Guest Arrival *(Church icon)*
     - **3:00 PM** — The Ceremony *(Intertwined rings icon)*
     - **6:00 PM** — Cocktail Hour *(Champagne flutes icon)*
     - **8:00 PM** — Dinner *(Dining table banquet icon)*
     - **10:00 PM** — Cake Cutting *(Wedding cake icon)*
     - **12:00 AM** — Afterparty *(Mirror disco ball icon)*
5. **Guest Guidelines Section**:
   - **Children Policy**:
     - Title: `CHILDREN` (`Montserrat`, 0.8rem, letter-spacing: 0.2em).
     - Text: *"While we adore your little ones, our wedding will be an adults-only celebration. We hope you will enjoy a relaxing evening celebrating with us."*
   - **Dress Code**:
     - Title: `DRESS CODE: FORMAL GARDEN THEMED ATTIRE` (`Montserrat`, 0.85rem, letter-spacing: 0.18em).
     - Text: *"For Women: Ladies are invited to wear formal attire in our chosen color palette. Long gowns, midi dresses, or elegant cocktail dresses are all welcome."*
     - Text: *"For Men: Gentlemen are encouraged to wear formal attire that complements our color palette. A classic suit or tuxedo is recommended."*
6. **Wedding Registry Section**:
   - Icon: Line art gift box with ribbon.
   - Title: `The Registry` (`Pinyon Script`, 2.4rem).
   - Text: *"Your presence at our wedding is the greatest gift of all. Should you wish to celebrate with a gift, our wedding registry can be found below."*
   - Button: `WEDDING REGISTRY` (`Montserrat`, outlined, 0.75rem, letter-spacing: 0.18em).
7. **Wedding FAQs Accordion**:
   - Section Title: `Wedding FAQs` (`Pinyon Script`, 2.4rem).
   - Accordion Item 1: `✦ ARE THE CEREMONY & RECEPTION INDOORS OR OUTDOORS?`
     - Answer: *"The ceremony is indoors, at Our Lady of Annunciation. The reception and the party are outdoors, whereas the afterparty moves inside to the glasshouse. Do bring something warm, as January evenings in Dubai can be quite cold."*
   - Accordion Item 2: `✦ WHAT IS THE PARKING STATUS AT BOTH VENUES?`
     - Answer: *"Both self-parking and valet parking are available at Address Montgomerie. While self-parking is also available at the ceremony location, spaces are limited. We highly recommend arriving early to ensure you find a spot."*
8. **Footer**:
   - Calla lily backdrop, intertwined hearts emblem, and `^ GO BACK` navigation.

---

### Screen 4: RSVP Invitation Prompt Card

#### Visual Elements
- Centered luxury stationery card:
  - Header: `Rsvp` (`Pinyon Script`, 3.0rem)
  - Subheading: `Your presence would mean the world to us` (`Pinyon Script`, 2.0rem)
  - Message: *"Please let us know if you'll be celebrating with us by submitting your RSVP below. We can't wait to share this unforgettable day with you."* (`Cormorant Garamond`, italic, 1.05rem)
  - Deadline Notice: `KINDLY RESPOND BY DECEMBER 13, 2026` (`Montserrat`, bold, 0.8rem, letter-spacing: 0.18em)
  - Call to Action: `PLEASE RSVP HERE` (`Montserrat`, outlined button, uppercase)
  - Return Link: `^ GO BACK`

---

### Screen 5: Interactive RSVP Form

#### Visual Elements & Form Architecture
- Top ornament: Line art intertwined hearts with ribbon bow.
- Heading: `We'd love to celebrate with you` (`Pinyon Script`, 2.4rem).
- Subtitle: *"We're excited to celebrate this special day with you. Please share your RSVP below."*
- Deadline: `KINDLY RESPOND BY DECEMBER 13, 2026`.
- **Form Fields**:
  1. **Full Name** (`text` input, required, placeholder: "e.g. Eleanor Vance").
  2. **Attendance Question**:
     - Prompt: *"Will you be joining us on this special day?"*
     - Radio Option A: `Yes, I'd love to!`
     - Radio Option B: `Sorry, I won't be able to attend.`
  3. **Plus-One Question**:
     - Prompt: *"Will you be bringing someone to share this moment with you?"*
     - Radio Option A: `Yes, I'll be bringing someone.`
     - Radio Option B: `No, I'll be attending alone.`
  4. **Guest Name Input** (Conditional field: smoothly animates into view if Plus-One Option A is selected):
     - Prompt: *"If you are bringing a guest, please tell us their name:"*
     - Input: Text field.
  5. **Submit Button**:
     - `SUBMIT RSVP` (Solid charcoal background `#131313`, white text, gold border on hover, subtle letter-spacing: 0.15em).
  6. **Interactive State Transitions**:
     - *Loading State*: Button shows delicate spinner / pulsing text ("Submitting...").
     - *Success Confirmation Card*: Card flips or dissolves into a heartfelt thank-you card ("Thank you, [Name]! We have recorded your RSVP. We cannot wait to celebrate with you!").

---

## 4. Animation & Interaction Specifications

### 4.1 The 3D Envelope Opening Physics
```
Initial State:
- Envelope body: position relative, perspective: 1000px
- Triangle flap: transform-origin: top center, rotateX(0deg), z-index: 5
- Wax seal: absolute center of flap tip, z-index: 6
- Invitation card inside: transform: translateY(0), z-index: 2

Trigger: Click wax seal / "TAP TO OPEN"
Sequence:
0ms   : Wax seal scales slightly (1.05) with gold shimmer, then fades out / detaches.
200ms : Flap begins rotating backwards: transform: rotateX(-180deg) (cubic-bezier(0.4, 0, 0.2, 1)).
500ms : Flap z-index drops behind card (z-index: 1).
600ms : Invitation card begins sliding upward: transform: translateY(-70%).
900ms : Screen 1 softly blurs/fades out, Screen 2 cross-fades into focus with scroll unlocked.
```

### 4.2 Scroll & Navigation Choreography
- **View Switching**: The app will support both smooth intra-page anchor scrolling and dedicated sub-view modal/screens for "The Details" and "RSVP" to replicate Canva's exact screen-by-screen presentation.
- **Scroll Reveals**: Sections use CSS classes triggered by lightweight JavaScript `IntersectionObserver` for gentle fade-up (`opacity: 0, translateY(20px)` to `opacity: 1, translateY(0)` with 600ms duration).
- **FAQ Accordion Mechanics**: Smooth height transition via CSS `grid-template-rows: 0fr` to `grid-template-rows: 1fr` for stutter-free fluid expansion without fixed height constraints.

---

## 5. Technical Constraints & Design Principles

1. **Pure Vanilla Standards**:
   - Zero framework dependencies (no React, Vue, jQuery, or Bootstrap).
   - Only native CSS3 custom properties, CSS Grid, Flexbox, and ES6 JavaScript.
2. **Lightning-Fast Performance**:
   - SVG vector assets for all line icons (rings, church, flutes, cake, gift, etc.).
   - Optimized WebP/PNG images for background textures and calla lilies.
   - Core Web Vitals targeted: LCP < 1.0s, CLS = 0, FID < 50ms.
3. **Mobile-First Responsive Fidelity**:
   - Designed to look like a high-end luxury invitation on iPhone/Android mobile displays (which represent 90%+ of wedding invitation traffic).
   - Scales gracefully to tablet and desktop monitors with appropriate max-width bounds (envelope max-width: 520px; content container max-width: 760px).
4. **Accessible Semantics**:
   - Screen-reader accessible form labels.
   - Appropriate ARIA attributes (`aria-expanded`, `aria-controls`, `role="region"`) on FAQs.
   - Respects `prefers-reduced-motion` user preferences.
