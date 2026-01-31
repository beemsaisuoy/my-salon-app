# Salon & Sweet - Beauty Salon & Dessert Cafe

A beautiful, responsive web application for a hybrid Beauty Salon & Dessert Cafe business built with Next.js 14, Tailwind CSS, and React Context API.

![Salon & Sweet](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)

## 🌟 Features

### Customer Front-end
- **Home Page**: Elegant hero section with service previews
- **Salon Booking**: 
  - Service selection (Haircut, Coloring, Spa)
  - Date & time picker with slot conflict validation
  - Customer details form
- **Dessert Shop**:
  - Product grid with category filters
  - Add to cart with quantity adjustment
  - Floating cart sidebar
  - Checkout with payment method selection

### Admin Back-end (`/admin`)
- PIN-protected access (default: `1234`)
- Dashboard with today's statistics
- Booking Manager with status controls
- Order Manager with workflow status updates

### Data Persistence
- React Context API for state management
- LocalStorage sync for data persistence
- Dummy data initialization for demo purposes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone or navigate to the project
cd salon-dessert-cafe

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
salon-dessert-cafe/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles
│   ├── booking/
│   │   └── page.tsx        # Salon booking
│   ├── shop/
│   │   └── page.tsx        # Dessert shop
│   └── admin/
│       └── page.tsx        # Admin dashboard
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   ├── BookingForm.tsx
│   ├── FloatingCart.tsx
│   ├── AdminLogin.tsx
│   └── AdminSidebar.tsx
├── context/
│   └── DataProvider.tsx    # Global state
├── types/
│   └── index.ts            # TypeScript types
└── ...config files
```

## 🎨 Design

- **Theme**: Pastel Pink & Warm Brown
- **Typography**: Playfair Display (headings), Inter (body)
- **Effects**: Glassmorphism, smooth animations
- **Responsive**: Mobile-first design

## 🔐 Admin Access

Navigate to `/admin` and enter PIN: `1234`

## 📦 Deployment to Vercel

1. Push to GitHub
2. Import to Vercel
3. Deploy (no environment variables needed!)

```bash
# Or use Vercel CLI
npx vercel
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: React Context API
- **Language**: TypeScript

## 📄 License

MIT License - feel free to use for your projects!

---

Made with 💕 for beauty lovers and sweet tooths everywhere.
