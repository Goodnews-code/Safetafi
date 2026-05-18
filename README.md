# SAFETAFI Transport & Logistics

<div align="center">
  <h3>Moving Nigeria Reliably & Safely</h3>
  <p>A modern web application for Nigeria's Premier Logistics Network.</p>
</div>

---

## Overview

SAFETAFI is a Next.js web application for a Nigerian transport and logistics company. Customers can book logistics services and pay securely online through multiple payment gateways. All transactions are recorded in real-time in a synchronized ledger.

## Key Features

- **Multi-Gateway Payments:** Support for both Paystack and Monnify.
  - **Dynamic Inactive Location Filtering:** The checkout portal dynamically parses and filters out any pickup points disabled by the admin in real-time, preventing unauthorized bookings.
  - **Active Selection Correction:** If a customer's previously selected location becomes disabled during their session, the checkout selection seamlessly auto-resets to the first active pickup point.
- **Improved Hydration Resilience:** Safe and warning-free SSR rendering optimized against common browser extension injects (like Grammarly) on the primary body wrapper.
- **Dynamic Trip Control:** Admins can toggle payment accessibility and set trip dates in real-time.
- **Enhanced Admin Dashboard:** 
  - Real-time transaction monitoring.
  - Dynamic date-based filtering.
  - Reactive statistics (Revenue, Volume, Avg. Size) that update based on selected filters.
  - CSV export for reporting.

## Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase
- **Payments:** Paystack & Monnify
- **Styling:** Tailwind CSS v4
- **Deployment:** Netlify

## Getting Started

### Prerequisites
Node.js and npm installed on your machine.

### Installation

```bash
git clone https://github.com/Goodnews-code/Safetafi.git
cd Safetafi
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory with the following:

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# Monnify
NEXT_PUBLIC_MONNIFY_API_KEY=your_monnify_api_key
MONNIFY_SECRET_KEY=your_monnify_secret_key
NEXT_PUBLIC_MONNIFY_CONTRACT_CODE=your_monnify_contract_code

# Configuration
NEXT_PUBLIC_PAYMENT_GATEWAY=paystack # or 'monnify'
DASHBOARD_PASSCODE=your_admin_passcode
NEXT_PUBLIC_BUSINESS_EMAIL=your_business_email
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## License

This project is tailored for SAFETAFI Transport & Logistics. All rights reserved.
