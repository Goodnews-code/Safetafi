# SAFETAFI Transport & Logistics

<div align="center">
  <h3>Moving Nigeria Reliably & Safely</h3>
  <p>A modern web application for Nigeria's Premier Logistics Network.</p>
</div>

---

## Overview

SAFETAFI is a Next.js web application for a Nigerian transport and logistics company. Customers can book logistics services and pay securely online. All transactions are recorded in real-time.

## Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase
- **Payments:** Paystack
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
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
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
