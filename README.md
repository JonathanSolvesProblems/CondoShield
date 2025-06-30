# 🏢 CondoShield

**Empowering condo owners to understand, track, and challenge special assessments with AI-driven tools and community support.**

---

🔗 [**Live Demo**](https://condo-shield.vercel.app/) | 🎥 [**Watch Demo Video**](https://youtu.be/ObFtcmytA2s)  
_Note: These links may no longer be available after the judging period of the hackathon._

🛠️ **Built as part of the [BOLT](https://worldslargesthackathon.devpost.com/?ref_feature=challenge&ref_medium=your-open-hackathons&ref_content=Submissions+open&_gl=1*1ix3l7h*_gcl_au*MTExNzMzOTk5OC4xNzQzOTQ0NTky*_ga*MzcxODQ4MTcwLjE3MzYxMzgyOTk.*_ga_0YHJK3Y10M*czE3NTEyMzIwMjYkbzM2NyRnMSR0MTc1MTIzMjc2NSRqNjAkbDAkaDA.) hackathon.**

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
- 🏘️ **Community Forum** – Share experiences with condo owners
- 🌐 **Multilingual Support** – Available in English and French
- 📱 **Mobile-First Design** – Fully responsive, touch-friendly interface

---

## 🛠️ Tech Stack

| Frontend              | Backend / Auth        | AI / NLP                 | Database | Utilities                |
| --------------------- | --------------------- | ------------------------ | -------- | ------------------------ |
| NextJS + Tailwind CSS | Supabase (Auth + RLS) | GPT-4o / GPT-4.1 / Llama | Supabase | pdf-parse, Recharts, OCR |

---

## 📂 Project Structure

---

## 🧪 Run locally

### 1. Clone the repo

```bash
git clone https://github.com/JonathanSolvesProblems/CondoShield.git
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
GITHUB_TOKEN=your_github_ai_key
```

### 4. Run locally

```bash
npm run dev
```
