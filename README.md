# 🏢 CondoShield

**Empowering condo owners to understand, track, and challenge special assessments with AI-driven tools and community support.**

---

## 🚀 Overview

CondoShield is a mobile-first web application that empowers property owners to take control of their condo assessments. From analyzing complex PDF charges to generating legal letters, CondoShield combines modern design, AI tools, and verified community features to bring transparency and confidence to a confusing process.

---

## ✨ Features

- 📄 **PDF Assessment Analyzer** – Upload PDFs and view breakdowns with interactive charts
- ⚖️ **Local Law Advisor** – Get region-specific legal rights and guidance
- 💬 **AI Legal Assistant** – Ask property law questions and receive intelligent, tailored answers
- 📝 **Dispute Letter Generator** – Generate professional, editable letters to contest charges
- 📊 **Dashboard** – Track assessments, disputes, and key deadlines
- 💡 **Cost-Saving Suggestions** – AI-powered tips to reduce future financial burden
- 🏘️ **Community Forum** – Share experiences with verified condo owners
- 🌐 **Multilingual Support** – Available in English and French
- 📱 **Mobile-First Design** – Fully responsive, touch-friendly interface

---

## 🛠️ Tech Stack

| Frontend             | Backend / Auth        | AI / NLP                  | Database | Utilities                |
| -------------------- | --------------------- | ------------------------- | -------- | ------------------------ |
| React + Tailwind CSS | Supabase (Auth + RLS) | GPT-4o / LLaMA / Azure AI | Supabase | pdf-parse, Recharts, OCR |

---

## 📂 Project Structure

---

## 🧪 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/condoshield.git
cd condoshield
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a .env file to define the environment variables as:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
AZURE_AI_KEY=your_azure_ai_key
AZURE_AI_ENDPOINT=your_azure_ai_endpoint
```

### 4. Run locally

```bash
npm run dev
```
