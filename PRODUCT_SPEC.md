# Nail Tech Booking Platform — Product Spec

Based on appraisal of the inspo site (Fresha/Squarespace-style booking widget) plus new features: calendar sync, per-service inspo galleries, a working waitlist, and accounts for both customer and vendor.

---

## 0. Brand Identity — E.star SleekNails

The client's actual logo and palette should replace all generic placeholder styling referenced elsewhere in this doc.

**Logo**
- Wordmark: "E.star SleekNails" set in an elegant, high-contrast serif display font.
- Icon: a single coral/orange nail with a gold sparkle beside it, integrated directly into the wordmark.

**Color palette (pull directly from the logo)**
| Role | Color | Approx. hex |
|---|---|---|
| Background / surface | Blush pink | `#F8D9CE` |
| Primary text / logo ink | Black | `#1A1414` |
| Accent / CTA | Coral-orange | `#E8572A` |
| Secondary accent | Gold | `#F0B94D` |

---

## 1. Site Map / Information Architecture

```
PUBLIC (no login required)
├── Home (immersive video/slideshow hero — see 1.5)
├── Services (list)
│   └── Service detail
├── About
├── Policy & Terms
├── Contact
├── Booking flow (3 steps)
├── Booking confirmation
├── Sign in / Create account
└── Waitlist confirmation

CUSTOMER ACCOUNT
├── My bookings
├── Booking detail
├── My waitlist entries
├── Saved inspo / favorites
├── Profile & contact info
└── Notification preferences

VENDOR DASHBOARD
├── Calendar
├── Bookings
├── Waitlist manager
├── Services
├── Clients
├── Payments
├── Policy & Terms editor
├── Business hours / availability
├── Calendar sync settings
└── Profile / storefront settings
```

---

## 1.5 Landing Page Hero — Immersive Video/Slideshow

- Full-viewport looping background video (or auto-advancing slideshow).
- Overlay: overline text, wordmark, tagline, "Book Now" CTA.
- 15–30 sec loop, muted by default.
- Fallbacks for reduced motion and slow connections.

## 1.6 Navigation

- **Primary nav:** Logo — Home, Services, About, Contact — Sign in — Book now. Sticky, glassmorphism on scroll, pill shape on desktop, collapses to hamburger menu on mobile.
- **Footer:** Policy & Terms, Hours, socials, contact details.

## 1.7 Home Page — Full Section-by-Section Breakdown

1. **Nav bar** — Sticky on scroll with background fade/blur.
2. **Hero** — Video/slideshow background with dark gradient scrim.
3. **Tagline / intro strip** — Centered, generous whitespace.
4. **Service category grid** — 3x2 grid (2x3 mobile). Links to pre-filtered booking flow.
5. **Trust / social proof** — 4-6 Instagram photos or testimonials.
6. **Hours / location teaser** — "Open now" + directions link.
7. **Footer** — Present on all pages.

---

## 2. Core User Flows

### 2.1 Customer booking flow
1. Select service(s) (steppers only for quantity-based items).
2. Select date & time (slot hold).
3. Waitlist if fully booked.
4. Enter details (agree to Policy & Terms).
5. Payment (Paystack/Flutterwave).
6. Confirmation.

### 2.7 Bookings UI: slide-in drawer
- Slide-in sidebar drawer (cart pattern) for "my bookings" accessible via nav.
- Compact cards for upcoming bookings.

---

## 3. Feature List by Priority

### Must-have (v1)
- Landing page hero
- Service list with gallery
- 3-step booking flow
- Policy & Terms page
- Payment gateway integration
- Vendor dashboard
- Customer confirmation page
- Email confirmations

### High-value (v1.5)
- Waitlist
- Customer accounts
- Customer photo upload
- Calendar sync (push)

### Nice-to-have (v2)
- Two-way calendar sync
- Client CRM notes
- Loyalty tracking
- Multiple staff
- In-app chat
