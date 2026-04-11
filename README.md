# 🍽️ NutriMind — Personal AI Kitchen & Nutrition Intelligence App

> A mobile app that acts as your personal AI-powered kitchen assistant, nutrition tracker, and smart grocery planner — built specifically for students living abroad.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![AI Powered](https://img.shields.io/badge/AI_Powered-Groq_LLaMA-blue?style=for-the-badge)

---

## 📱 What is NutriMind?

NutriMind is a personal project I built to solve real problems I face as an international student in Germany. Managing food, budget, nutrition, and grocery shopping efficiently while cooking Pakistani and other cuisines — no existing app handled all of this together.

**The app combines:**
- 🤖 AI recipe generation (Groq API + LLaMA 3.1)
- 🗄️ Real-time database (Supabase)
- 📱 Cross-platform mobile (React Native + Expo)
- 📊 Nutrition tracking and data visualization
- 🛒 Budget-aware grocery planning

---

## ✨ Features

| Feature | Description | Status |
|---|---|---|
| 🧑‍🍳 Recipe Generator | AI generates recipes from your available ingredients + cuisine style | ✅ Live |
| 📦 Pantry Tracker | Track ingredient quantities, auto-deducts after cooking | ✅ Live |
| 🛒 Smart Grocery Planner | Budget-based shopping list with store preferences | ✅ Live |
| 💪 Health Profile | Personal health goals, height, weight — saves to database | ✅ Live |
| 🤖 Meal Plan Generator | AI generates full 7-day meal plan based on your goals | ✅ Live |
| 📊 Nutrition Dashboard | Daily calorie and macro tracking | 🔄 In Progress |
| 📈 Smart Consumption Patterns | ML-based personal usage pattern learning | 🔜 Planned |
| 💰 Budget Intelligence | Weekly spending analysis and savings suggestions | 🔜 Planned |
| 🔔 Low Stock Notifications | Alerts when ingredients are about to run out | 🔜 Planned |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React Native + Expo (TypeScript) |
| Database | Supabase (PostgreSQL) |
| AI / LLM | Groq API — LLaMA 3.1 8B Instant |
| Navigation | Expo Router |
| Version Control | Git + GitHub |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Expo Go app on your phone
- Supabase account (free)
- Groq API key (free)

### Installation

```bash
# Clone the repository
git clone https://github.com/AshMin-Dev/NutriMind.git

# Navigate into project
cd NutriMind

# Install dependencies
npm install

# Start the app
npx expo start
```

### Environment Setup

Create a `.env` file in the root folder:
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
Add your Groq API key in `app/(tabs)/recipes.tsx` and `app/(tabs)/mealplan.tsx`.

---

## 🗄️ Database Schema

```sql
-- Pantry Items
create table pantry_items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  quantity float not null,
  unit text not null,
  created_at timestamp default now()
);

-- Health Profile
create table health_profile (
  id uuid default gen_random_uuid() primary key,
  name text,
  age int,
  height float,
  height_unit text default 'cm',
  weight float,
  weight_unit text default 'kg',
  goal text,
  created_at timestamp default now()
);

-- Grocery Items
create table grocery_items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price float,
  store text,
  checked boolean default false,
  created_at timestamp default now()
);
```

---

## 📸 App Screenshots

*Coming soon*

---

## 🧠 Why I Built This

As a Master's student in Software Engineering at Hildesheim University, Germany, I wanted to build something that solves my own real problems while learning AI integration, mobile development, and database design from scratch.

NutriMind is unique because:
- **Cultural intelligence** — understands Pakistani, Italian, Chinese and other cuisines properly
- **Student-focused** — designed around budget constraints and small apartment cooking
- **Truly personal** — learns your pantry, your goals, your cuisine preferences

---

## 📅 Roadmap

- [x] Phase 1 — App foundation + database + health profile
- [x] Phase 2 — AI recipe generator + meal plan generator
- [ ] Phase 3 — Nutrition tracking + live grocery prices
- [ ] Phase 4 — Push notifications + budget intelligence
- [ ] Phase 5 — ML consumption pattern learning
- [ ] Phase 6 — UI polish + app store preparation

---

## 👨‍💻 Developer

**Awais** — Master's in Software Engineering, Hildesheim University, Germany

- 🎓 BS Computer Science — UCP Lahore (CGPA: 3.8)
- 🌍 Originally from Lahore, Pakistan
- 💼 Looking for Werkstudent roles in AI/Data Science in the Hannover/Braunschweig area

---

## 📄 License

This project is for portfolio and educational purposes.