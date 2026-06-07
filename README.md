# Ikonex Academy — Student Management System

A full-stack web-based Student Management System built for **Ikonex Academy** as part of the Ikonex Systems Software Developer Intern Practical Assessment. The system manages class streams, students, subjects, assessments, results processing, and PDF report card generation.

---

## 🌐 Live Demo

> **Hosted URL:** `https://ikonex-academy-portal-nudx7hhv1.vercel.app`
> **Repository:** `https://github.com/ArkwingsCyprianAbala/ikonex-academy-portal`

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Design](#database-design)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [Deployment](#deployment)
- [User Guide](#user-guide)
- [API Reference](#api-reference)
- [Design Decisions](#design-decisions)
- [Challenges & Solutions](#challenges--solutions)
- [Project Structure](#project-structure)

---

## Overview

The Ikonex Academy Student Management System is a responsive, full-stack web application that enables school administrators and teachers to:

- Manage class streams, students, and subjects
- Record and update examination and continuous assessment scores
- Automatically process results, calculate grades, and rank students
- Generate professional PDF report cards for individual students and class performance reports

---

## ✅ Features

### Class Stream Management
- Create, edit, and delete class streams (e.g. Form 1A, Form 1B)
- View all streams with student and subject counts
- View detailed stream profile including assigned students and subjects

### Student Management
- Register students with full details and assign them to a stream
- Edit and delete student records
- View individual student profiles with scores and results
- Search students by name or student number
- Filter students by class stream

### Subject Management
- Create and manage subjects with name and subject code
- Assign subjects to one or more class streams
- Edit stream assignments at any time
- View subject details including assigned streams

### Assessments & Scoring
- Select a stream and subject to view the full scoring table
- Record exam scores (out of 70) and CA scores (out of 30) per student per subject
- Live total preview as scores are entered
- Edit and delete existing scores
- Progress bar showing scoring completion per subject
- Duplicate score prevention enforced at both API and database levels

### Results Processing
- Process results for an entire class stream with one click
- Automatically calculates total marks, average score, grade and class position
- Ranked leaderboard with expandable subject breakdowns
- Summary stats: class average, highest score, pass count, grade distribution
- Safe to re-process — uses upsert to update existing results

### PDF Reports
- Generate individual student report cards as PDF
- Generate class performance reports as landscape PDF
- Report cards include: student info, subject scores, grades, remarks, grading scale, signature lines
- Class reports include: all students ranked, per-subject scores, summary statistics
- All PDFs generated client-side — no server storage required

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | React framework with file-based routing |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **UI Components** | shadcn/ui + Radix UI | Accessible, composable component library |
| **Icons** | Lucide React | Consistent icon set |
| **Backend** | Next.js API Routes | RESTful API endpoints (no separate server) |
| **ORM** | Prisma | Type-safe database access layer |
| **Database** | PostgreSQL | Relational database |
| **HTTP Client** | Axios | API calls from client components |
| **PDF Generation** | jsPDF + jspdf-autotable | Client-side PDF generation |
| **Testing** | Jest + ts-jest | Unit testing framework |
| **Language** | TypeScript | Type safety across the full stack |
| **Version Control** | Git / GitHub | Source control |
| **Deployment** | Vercel + Railway | Frontend and database hosting |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                     │
│  Next.js Pages + React Components + jsPDF               │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP (Axios)
┌────────────────────────▼────────────────────────────────┐
│              Next.js API Routes (Server)                 │
│  /api/streams  /api/students  /api/subjects              │
│  /api/scores   /api/results                              │
└────────────────────────┬────────────────────────────────┘
                         │ Prisma ORM
┌────────────────────────▼────────────────────────────────┐
│                   PostgreSQL Database                    │
│  ClassStream · Student · Subject · StreamSubject         │
│  Score · Result                                          │
└─────────────────────────────────────────────────────────┘
```

The application uses Next.js as a **unified full-stack framework** — both the React frontend and the REST API live in the same project. This eliminates the need for a separate backend server, simplifies deployment, and keeps the codebase cohesive.

---

## 🗄 Database Design

### Entity Relationship Diagram

```
ClassStream (1) ──────── (M) Student
ClassStream (M) ──── StreamSubject ──── (M) Subject
Student     (1) ──────── (M) Score
Subject     (1) ──────── (M) Score
Student     (1) ──────── (1) Result
```

### Models

**ClassStream**
| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | Primary key |
| name | String | Unique, e.g. "Form 1A" |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

**Student**
| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | Primary key |
| firstName | String | |
| lastName | String | |
| studentNumber | String | Unique |
| gender | Enum (MALE/FEMALE) | |
| dateOfBirth | DateTime | |
| classStreamId | String | Foreign key → ClassStream |

**Subject**
| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | Primary key |
| name | String | Unique |
| code | String | Unique, e.g. "MATH101" |

**StreamSubject** *(join table)*
| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | Primary key |
| streamId | String | Foreign key → ClassStream |
| subjectId | String | Foreign key → Subject |
| — | @@unique | [streamId, subjectId] |

**Score**
| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | Primary key |
| examScore | Float | 0–70 |
| caScore | Float | 0–30 |
| total | Float | Computed: exam + ca |
| studentId | String | Foreign key → Student |
| subjectId | String | Foreign key → Subject |
| — | @@unique | [studentId, subjectId] |

**Result**
| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | Primary key |
| totalMarks | Float | Sum of all subject totals |
| averageScore | Float | totalMarks / subjects |
| grade | String | A / B / C / D / F |
| classPosition | Int | Rank within stream |
| studentId | String | Unique FK → Student |

### Grading Scale

| Grade | Range | Remark |
|-------|-------|--------|
| A | 80 – 100 | Excellent |
| B | 65 – 79 | Very Good |
| C | 50 – 64 | Good |
| D | 40 – 49 | Satisfactory |
| F | 0 – 39 | Needs Improvement |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **PostgreSQL** v14 or higher — [postgresql.org](https://www.postgresql.org)
- **Git** — [git-scm.com](https://git-scm.com)
- **npm** v9 or higher (comes with Node.js)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/ArkwingsCyprianAbala/ikonex-academy-portal.git
cd ikonex-academy-portal/ikonex-lms
```

**2. Install dependencies**
```bash
npm install
```

**3. Create the PostgreSQL database**
```bash
psql -U postgres -c "CREATE DATABASE ikonex_lms;"
```

**4. Set up environment variables**
```bash
cp .env.example .env
```
Then edit `.env` with your database credentials (see [Environment Variables](#environment-variables)).

**5. Run database migrations**
```bash
npx prisma migrate dev --name init
```

**6. Generate Prisma client**
```bash
npx prisma generate
```

**7. Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 🔐 Environment Variables

Create a `.env` file in the project root with the following:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ikonex_lms"
```

For production (Vercel + Railway):
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
```

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

Create a `.env.example` file for reference (safe to commit):
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ikonex_lms"
```

---

## ▶️ Running the Application

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database and re-run migrations
npx prisma migrate reset
```

---

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file change)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Suites

| Suite | File | Coverage |
|-------|------|----------|
| Grade & Results Logic | `__tests__/lib/results.test.ts` | Grade calculation, averages, student ranking |
| Score Validation | `__tests__/lib/scoreValidation.test.ts` | Boundary validation for exam and CA scores |
| API Helpers | `__tests__/lib/apiHelpers.test.ts` | Response shape and status codes |
| Formatting Utilities | `__tests__/lib/formatting.test.ts` | Name formatting, dates, initials, student numbers |

---

## ☁️ Deployment

### Frontend — Vercel

**1. Push your code to GitHub**
```bash
git add .
git commit -m "ready for deployment"
git push origin main
```

**2. Import to Vercel**
- Go to [vercel.com](https://vercel.com) and sign in
- Click **Add New Project** → Import your GitHub repository
- Framework preset: **Next.js** (auto-detected)

**3. Set environment variables in Vercel**
- Go to **Settings → Environment Variables**
- Add `DATABASE_URL` with your production PostgreSQL connection string

**4. Deploy**
- Click **Deploy** — Vercel builds and deploys automatically

### Database — Railway

**1. Create a PostgreSQL instance**
- Go to [railway.app](https://railway.app) and sign in
- Click **New Project → Provision PostgreSQL**

**2. Get the connection string**
- Click your PostgreSQL service → **Connect** tab
- Copy the **Postgres Connection URL**

**3. Run migrations against production**
```bash
DATABASE_URL="your-railway-connection-string" npx prisma migrate deploy
```

**4. Add the connection string to Vercel**
- Paste the Railway URL as `DATABASE_URL` in Vercel environment variables
- Redeploy

---

## 📖 User Guide

### Setting Up the System (First Time)

Follow this order when setting up for the first time:

```
1. Create Class Streams
      ↓
2. Create Subjects and assign them to streams
      ↓
3. Register Students and assign them to streams
      ↓
4. Record Scores (Assessments page)
      ↓
5. Process Results (Results page)
      ↓
6. Generate PDF Reports (Reports page)
```

### Class Streams
- Navigate to **Class Streams** in the sidebar
- Click **New Stream** to create a stream (e.g. "Form 1A")
- Click **View** on any stream to see its students and subjects

### Students
- Navigate to **Students** in the sidebar
- Click **Register Student** and fill in all fields
- Use the search bar to find students by name or student number
- Use the stream filter to view students in a specific class
- Click the eye icon to view a full student profile

### Subjects
- Navigate to **Subjects** in the sidebar
- Click **Add Subject**, enter the name and code
- Select which streams this subject is taught in using the toggle buttons
- A subject can be assigned to multiple streams

### Assessments
- Navigate to **Assessments** in the sidebar
- Select a **Class Stream** then a **Subject**
- The full student list appears with scoring buttons
- Click **Add Score** to record exam and CA scores for a student
- The live total updates as you type
- Click the pencil icon to edit an existing score

### Results
- Navigate to **Results** in the sidebar
- Select a **Class Stream**
- Click **Process Results** — this calculates totals, averages, grades and rankings
- Click any student row to expand their subject-by-subject breakdown
- Results can be re-processed at any time if scores are updated

### Reports
- Navigate to **Reports** in the sidebar
- Select a **Class Stream** (must have processed results)
- Click **Download PDF** next to any student for their individual report card
- Click **Download Class Report** for a full landscape PDF of the entire class

---

## 📡 API Reference

All API routes return JSON in this shape:

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "message" }
```

### Class Streams

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/streams` | Get all streams |
| POST | `/api/streams` | Create a stream |
| GET | `/api/streams/:id` | Get stream with students & subjects |
| PUT | `/api/streams/:id` | Update stream name |
| DELETE | `/api/streams/:id` | Delete stream |

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | Get all students |
| GET | `/api/students?streamId=x` | Get students by stream |
| POST | `/api/students` | Register a student |
| GET | `/api/students/:id` | Get student with scores & results |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |

### Subjects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subjects` | Get all subjects |
| POST | `/api/subjects` | Create a subject |
| GET | `/api/subjects/:id` | Get subject with stream assignments |
| PUT | `/api/subjects/:id` | Update subject and stream assignments |
| DELETE | `/api/subjects/:id` | Delete subject |

### Scores

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/scores` | Get all scores |
| GET | `/api/scores?studentId=x` | Get scores for a student |
| GET | `/api/scores?subjectId=x` | Get scores for a subject |
| POST | `/api/scores` | Record a score |
| PUT | `/api/scores/:id` | Update a score |
| DELETE | `/api/scores/:id` | Delete a score |

### Results

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/results?streamId=x` | Get results for a stream |
| POST | `/api/results` | Process results for a stream |

---

## 🧠 Design Decisions

### Why Next.js App Router over a separate backend?
Using Next.js API routes eliminates the need to manage two separate deployments (a React frontend and a Node.js server). The API lives alongside the UI in the same repo, simplifying development, deployment, and maintenance.

### Why Prisma over raw SQL?
Prisma provides type-safe database queries, automatic TypeScript types from the schema, and a clean migration system. It catches query errors at compile time rather than runtime, which is especially valuable in a TypeScript project.

### Why `cuid()` over auto-increment IDs?
CUIDs are collision-resistant, URL-safe, and don't expose sequential information about the database. Auto-increment integers reveal how many records exist and are predictable — a security concern for public-facing APIs.

### Why store `total` on the Score model?
Storing the computed total avoids recalculating `examScore + caScore` on every read. Since scores are read far more often than they are written, this is a deliberate denormalization for read performance.

### Why separate the Result model from Score?
Keeping computed results (total, average, grade, position) separate from raw scores makes reporting fast — a single query fetches the Result without aggregating across all Score rows. It also makes re-processing safe via `upsert`.

### Why client-side PDF generation?
Using `jsPDF` in the browser means no server storage, no temporary files, and instant downloads. The PDF is generated directly from the data already loaded in the UI — zero additional API calls.

### Why `params` as a Promise in API routes?
Next.js 16 made dynamic route `params` asynchronous to support future streaming features. All `[id]` routes use `const { id } = await context.params` to handle this correctly.

---

## 🚧 Challenges & Solutions

### Challenge 1 — Next.js 16 Async Params
**Problem:** Dynamic route handlers were returning 500 errors because `params.id` was accessed synchronously, but Next.js 16 made `params` a Promise.

**Solution:** Changed all `[id]` route handlers to use `context: { params: Promise<{ id: string }> }` and `await context.params` before accessing the id.

### Challenge 2 — Subject Stream Assignments Not Saving
**Problem:** Subjects were created without their stream assignments because the `POST /api/subjects` route wasn't handling `streamIds` during creation — only during updates.

**Solution:** Updated the POST handler to include a nested `streamSubjects.create` in the Prisma `create` call when `streamIds` are provided.

### Challenge 3 — Stale Prisma Client in Development
**Problem:** Next.js hot reload was creating multiple Prisma client instances, eventually exhausting database connections.

**Solution:** Used the standard Next.js + Prisma singleton pattern — storing the client on `globalThis` so it persists across hot reloads in development.

### Challenge 4 — WHERE IN (NULL) Prisma Query
**Problem:** Stream subject assignments were showing `WHERE id IN (NULL)` in Prisma query logs, meaning the `classStream` relation wasn't resolving.

**Solution:** The root cause was the async params issue — once params were correctly awaited, the stream ID resolved properly and the include worked correctly.

---

## 📁 Project Structure

```
ikonex-lms/
├── app/
│   ├── api/                          # Backend API routes
│   │   ├── streams/
│   │   │   ├── route.ts              # GET all, POST
│   │   │   └── [id]/route.ts         # GET one, PUT, DELETE
│   │   ├── students/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── subjects/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── scores/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   └── results/
│   │       └── route.ts
│   ├── (dashboard)/                  # Dashboard route group
│   │   ├── layout.tsx                # Sidebar + Header layout
│   │   └── dashboard/
│   │       ├── page.tsx              # Dashboard home
│   │       ├── streams/              # Class streams feature
│   │       ├── students/             # Students feature
│   │       ├── subjects/             # Subjects feature
│   │       ├── assessments/          # Scoring feature
│   │       ├── results/              # Results processing
│   │       └── reports/              # PDF reports
│   ├── globals.css
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Root redirect → /dashboard
├── components/
│   ├── ui/                           # shadcn/ui components
│   └── shared/                       # Custom reusable components
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       ├── StatCard.tsx
│       ├── EmptyState.tsx
│       ├── ConfirmDialog.tsx
│       ├── StreamFormDialog.tsx
│       ├── StudentFormDialog.tsx
│       ├── SubjectFormDialog.tsx
│       └── ScoreFormDialog.tsx
├── lib/
│   ├── prisma.ts                     # Prisma client singleton
│   ├── utils.ts                      # shadcn utility
│   ├── api-helpers.ts                # API response helpers
│   ├── hooks/                        # Custom React hooks
│   │   ├── useStreams.ts
│   │   ├── useStudents.ts
│   │   ├── useSubjects.ts
│   │   ├── useScores.ts
│   │   └── useResults.ts
│   └── pdf/                          # PDF generators
│       ├── generateReportCard.ts
│       └── generateClassReport.ts
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── migrations/                   # Migration history
├── __tests__/
│   └── lib/
│       ├── results.test.ts
│       ├── scoreValidation.test.ts
│       ├── apiHelpers.test.ts
│       └── formatting.test.ts
├── .env                              # Environment variables (git-ignored)
├── .env.example                      # Example env file (safe to commit)
├── .gitignore
├── jest.config.ts
├── jest.setup.ts
├── next.config.ts
├── package.json
├── prisma/schema.prisma
├── tailwind.config.ts
└── tsconfig.json
```

---

## 👨‍💻 Author

**Arkwings Cyprian Abala**
Software Developer Intern Practical Assessment
Ikonex Systems — 2026

---

## 📄 License

This project was developed as part of a technical assessment for Ikonex Systems.