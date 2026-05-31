# 🚗 BengkelAI

> **An AI-Powered Smart Assistant for MSME Auto Repair Shops in Indonesia.**

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Anthropic Claude](https://img.shields.io/badge/AI-Claude_3.5_Sonnet-8A2BE2?style=flat&logo=anthropic)](https://anthropic.com/)

**Live Demo:** [Visit BengkelAI](https://[LINK_VERCEL_AKANG])

## 📖 Overview

BengkelAI is a mobile-first web application designed to help mechanics and owners of MSME (UMKM) auto repair shops. It leverages Generative AI (Anthropic Claude 3.5 Sonnet) to analyze vehicle complaints, generate customer-friendly explanations, create professional WhatsApp billing messages, and manage service history seamlessly.

## ✨ Key Features

- **🤖 AI Diagnostics (Tanya Kerusakan):** Input vehicle symptoms and get instant AI analysis, including root causes, recommended actions, and cost estimates.
- **💬 Smart WhatsApp Generator:** Automatically draft polite, professional WhatsApp messages for customers based on diagnostic results. Includes a 1-click "Send via WA" deep-linking feature.
- **📱 Mobile-First Soft UI:** Beautiful, intuitive Neumorphic design optimized for mechanics using smartphones with dirty hands or gloves (large touch targets, anti-zoom inputs).
- **📊 Offline-First Local Storage:** All service histories and configurations are safely stored in the browser's `localStorage`. No complex backend required.
- **📈 Financial Dashboard & Export:** Track monthly revenue, view pending payments, and export service history to CSV for bookkeeping.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Custom Soft UI/Neumorphism)
- **Icons:** [Lucide React](https://lucide.dev/)
- **AI Integration:** [Puter.js](https://puter.com/) (Wrapper for Anthropic Claude 3.5 Sonnet)
- **State Management:** React Hooks (`useState`, `useEffect`) + Browser `localStorage`
- **Deployment:** [Vercel](https://vercel.com/)

## 🚀 Running Locally

To run this project on your local machine:

1. **Clone the repository:**

```bash
   git clone [https://github.com/Randif444/bengkel-ai.git](https://github.com/Randif444/bengkel-ai.git)
   cd bengkel-ai
```
