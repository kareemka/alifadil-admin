# 🛡️ Khayal Alzili Admin Dashboard

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Radix UI](https://img.shields.io/badge/UI-Radix%20UI-39E09B?logo=radix-ui&logoColor=white)](https://www.radix-ui.com/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

The control center for the **Khayal Alzili** platform. This dashboard allows administrators to manage content, monitor analytics, and configure system settings with ease.

---

## ✨ Features

- 📊 **Analytics Overview**: Visual insights using `Recharts` for platform performance.
- 🎬 **Content Management**: Full control over shows, seasons, episodes, and banners.
- 📁 **Media Library**: Manage uploads and asset categorization.
- 👥 **User Management**: Control user roles and permissions.
- 🌓 **Theme Support**: Dark and light mode optimized for long administration sessions.
- ⚡ **Real-time Updates**: Powered by TanStack Query for a seamless experience.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **State Management**: [TanStack Query (React Query)](https://tanstack.com/query)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- The [API Server](../api) must be running for data fetching.

### Installation

1. Navigate to the admin directory:
   ```bash
   cd admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file and add your API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

### Running the Dashboard

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm run start
```
*Note: The admin dashboard defaults to port `3002`.*

---

## 📂 Structure

```text
src/
├── app/            # Next.js App Router (Pages & Layouts)
├── components/     # Reusable UI components (Radix + Tailwind)
├── hooks/          # Custom React hooks (Data fetching, Auth)
├── lib/            # Utility functions & API clients
├── types/          # TypeScript definitions
└── styles/         # Global styles and Tailwind configuration
```

---

## 🤝 Contributing

Please follow the coding standards and ensure all new components are properly typed and tested.

---

**Developed for the Khayal Alzili Admin Team.**
