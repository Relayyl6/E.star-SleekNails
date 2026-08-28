# E.star SleekNails 💅

> **The official booking platform and storefront for E.star SleekNails.** 
> Specializing in flawless, long-lasting acrylic, hardgel, and BIAB sets.

This platform features an interactive service menu, automated PDF invoicing and receipts, guest-session cart synchronization, and a secure admin dashboard for waitlist and booking management. 

## Features

- **Guest-Session Cart Synchronization:** Bookings made by unauthenticated guests are automatically persisted in a local session cart. If the user later signs up, their bookings seamlessly synchronize and permanently attach to their authenticated account.
- **Automated Invoicing & Receipts:** Client-side PDF generation automatically creates downloadable "PAYMENT REQUEST" invoices (for pending bookings) and "OFFICIAL RECEIPTS" (for confirmed, paid bookings).
- **Secure Role-Based Access Control (RBAC):** Next.js App Router API endpoints are secured using `firebase-admin` and HTTP-only session cookies. Sensitive endpoints like full database fetching, updating booking statuses, modifying waitlists, and altering storefront settings are strictly locked to Admin accounts. 
- **Timezone-Safe Dates:** All appointments are rigorously parsed and stored without UTC shifts, ensuring bookings created in West Africa Time (WAT) remain perfectly accurate across all international clients and server runtimes.
- **Automated Email Notifications:** Integration with Resend provides automated confirmations and waitlist notifications directly to the client's inbox.

## Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Database & Auth:** Firebase Firestore & Firebase Auth (Client + Admin SDKs)
- **Styling:** Tailwind CSS
- **Emails:** Resend API
- **Icons:** Heroicons

## Getting Started

1. Clone the repository.
2. Install dependencies: `npm install`
3. Configure your `.env.local` with Firebase and Resend API keys.
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
