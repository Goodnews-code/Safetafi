# 🚛 SAFETAFI Transport & Logistics

<div align="center">
  <h3>Moving Nigeria Reliably & Safely</h3>
  <p>A modern, high-performance web application for Nigeria's Premier Logistics Network.</p>
</div>

---

## 🌐 Live Demo

| | |
|---|---|
| **🔗 Site URL** | [https://safetafi.netlify.app/](https://safetafi.netlify.app/) |
| **🔐 Admin Password** | `12345678` |

### 🗺️ How to Access the Admin Dashboard
1. Visit the live site and **scroll to the very bottom** of the page (the Footer section).
2. Look for the small **🔑 "Admin"** link in the footer — click it.
3. You'll be taken to the admin login page at `/admin`.
4. Enter the password `12345678` to access the **Transaction Ledger & Dashboard**.

---

## 📖 Overview

**SAFETAFI** is a premium Next.js web application engineered for a modern Nigerian transport and logistics company. It bridges the gap between businesses and markets with end-to-end transport solutions, featuring a sleek, responsive user interface and integrated secure payment flows.

## ✨ Key Features

- **Modern & Premium UI/UX:** Built with Tailwind CSS, featuring glassmorphism elements, smooth micro-animations, and a highly responsive layout.
- **Service Integration:** Detailed service offerings including Road Haulage, Vehicle Sales & Corporate Hire, and Supply Chain management.
- **Integrated Payment Gateway:** Secure payment flows using **Paystack** for seamless booking of logistics services.
- **High Performance:** Leveraging the power of Next.js App Router and React 19 for optimal speed and SEO performance.
- **Mobile-First Design:** 100% optimized for mobile, tablet, and desktop viewing.

## ⚙️ Backend Architecture & API

SAFETAFI utilizes a robust backend powered by Next.js Serverless API routes and Supabase:
- **Webhook Handlers:** Dedicated `/api/paystack/webhook` and `/api/monnify/webhook` routes to capture asynchronous payment verifications securely from both gateways.
- **Database Synchronization:** Secure, server-side data insertion ensures that all approved transactions are accurately recorded into Supabase in real-time, preventing data loss if a user drops connection.
- **Dynamic Application State:** A dedicated `app_settings` database table enables global application configuration without requiring a redeployment.

## 🎛️ Admin Controls & The Toggle System

The application features a secure `/admin` dashboard that acts as the command center for the logistics network. 

Using the **Trip Control** and **Pricing** panels, administrators can:
- **Toggle Payments (On/Off):** Instantly pause or resume payment processing globally. When payments are disabled, the checkout portal seamlessly switches to a dynamic "We'll Be Right Back" state to prevent bookings.
- **Dynamic Payment Gateway:** Switch the active payment provider seamlessly between **Paystack** and **Monnify**. The checkout portal instantly adapts to use the selected SDK without requiring code redeployments or environment variable changes.
- **Schedule Upcoming Trips:** Set the exact target date for the next transport service. This dynamically updates the user-facing booking portal to reflect the precise upcoming schedule.
- **Pricing Management:** Update base transport fares across all available routes and destinations dynamically.

## 🛠️ Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Payments:** [Paystack](https://paystack.com/) (`react-paystack`)
- **Fonts:** Public Sans, Material Symbols

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and npm (or yarn/pnpm) installed on your local machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Goodnews-code/Safetafi.git
   ```

2. Navigate directly into the project directory:
   ```bash
   cd Safetafi
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
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
   NEXT_PUBLIC_PAYMENT_GATEWAY=paystack
   DASHBOARD_PASSCODE=your_admin_passcode
   NEXT_PUBLIC_BUSINESS_EMAIL=your_business_email
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application running.

## 📂 Project Structure

```text
/src
 ├── /app              # Next.js App Router pages and layouts
 ├── /components       # Reusable UI components (Navbar, Hero, PaymentModal, etc.)
 ├── /lib              # Utility functions and constants
/public                # Static assets (images, icons)
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Goodnews-code/Safetafi/issues).

## 📄 License

This project application is tailored for SAFETAFI Transport & Logistics.
