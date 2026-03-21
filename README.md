# 🚛 SAFETAFI Transport & Logistics

<div align="center">
  <h3>Moving Nigeria Reliably & Safely</h3>
  <p>A modern, high-performance web application for Nigeria's Premier Logistics Network.</p>
</div>

---

## 📖 Overview

**SAFETAFI** is a premium Next.js web application engineered for a modern Nigerian transport and logistics company. It bridges the gap between businesses and markets with end-to-end transport solutions, featuring a sleek, responsive user interface and integrated secure payment flows.

## ✨ Key Features

- **Modern & Premium UI/UX:** Built with Tailwind CSS, featuring glassmorphism elements, smooth micro-animations, and a highly responsive layout.
- **Service Integration:** Detailed service offerings including Road Haulage, Vehicle Sales & Corporate Hire, and Supply Chain management.
- **Integrated Payment Gateway:** Secure payment flows using **Paystack** for seamless booking of logistics services.
- **High Performance:** Leveraging the power of Next.js App Router and React 19 for optimal speed and SEO performance.
- **Mobile-First Design:** 100% optimized for mobile, tablet, and desktop viewing.

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
   Create a `.env.local` file in the root directory and add your Paystack Public Key:
   ```env
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
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
