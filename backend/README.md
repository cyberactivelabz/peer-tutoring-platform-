# 🎓 CampusConnect — Peer Tutoring & Academic Collaboration Platform

[![GitHub Repository](https://img.shields.io/badge/GitHub-campusconnect-blue?logo=github)](https://github.com/samuelbukumni/campusconnect)

Welcome to the backend repository of **CampusConnect**, a peer-to-peer academic platform designed to connect students who need academic assistance with fellow students who excel in those subjects.

Built with **NestJS**, **TypeORM**, **PostgreSQL**, **Redis**, and **Resend**.

For a verified demo learner that can sign in through the live frontend, see
[Live demo account setup](DEMO_ACCOUNT.md). Set its password in the backend's
environment settings, then run `npm run seed:demo` after building the backend.

[Backend audit, migration, and deployment notes](BACKEND_AUDIT.md) describe the current authorization, transaction, and database safeguards.

---

## 📖 Table of Contents
1. [Project Overview & Problem Statement](#-project-overview--problem-statement)
2. [Where to Find What (Project File Map)](#-where-to-find-what-project-file-map)
3. [Database & Schema Architecture](#-database--schema-architecture)
4. [Getting Started (Quick Setup Guide)](#-getting-started-quick-setup-guide)
5. [Interactive Swagger API Documentation](#-interactive-swagger-api-documentation)
6. [API Endpoints Reference](#-api-endpoints-reference)
7. [Git Conventions for the Team](#-git-conventions-for-the-team)
8. [Roadmap & Development Phases](#-roadmap--development-phases)
9. [Phase 7: Cloud Deployment on Render.com](#-phase-7-cloud-deployment-on-rendercom)

---

## 🌟 Project Overview & Problem Statement

### The Problem
In academic institutions, many students encounter difficulty grasping specific topics (e.g. Calculus in `MTH 102` or Data Structures in `CSC 201`). At the same time, many peers have mastered these exact subjects and are ready to help, but there is no structured campus platform to match them, schedule sessions, share past questions/notes, or verify accountability.

### How CampusConnect Solves This
1. **Dual Student Role**: A student isn't just a learner or a tutor — they can tutor courses they understand while receiving tutoring in courses they find challenging.
2. **One-on-One & Group Tutorials**: Book study sessions with clear locations (library, campus hub, online) and scheduled times.
3. **Study & Reading Partners**: Find peers with similar study schedules, courses, and goals with reshuffling support.
4. **Academic Material Hub**: Share lecture summaries, previous exam questions, solutions, and track downloads.
5. **Trust & Quality**: Peer reviews, 1-to-5 star ratings, testimonials, and verified student profiles.
6. **Student Safety**: Disciplinary reporting for misconduct, scams, or no-shows with admin resolution.
7. **In-App Notifications**: Real-time alerts for booking confirmations, partner matches, reviews, and materials.

---

## 🗂 Where to Find What (Project File Map)

Every single concern is isolated in its own dedicated modular folder:

```text
Study-connect-Backend/
├── .env.example                     # Sample environment variables (Copy to .env)
├── agent.md                         # Agent memory & technical decisions log
├── PRD_TECHNICAL_SPEC.md            # Complete Product & Technical Specification
├── README.md                        # This project guide
├── nest-cli.json                    # NestJS CLI configuration
├── package.json                     # Dependencies and npm scripts
├── tsconfig.json                    # TypeScript compiler config & module path aliases
│
└── src/
    ├── main.ts                      # Application entry point (starts server, Swagger docs, global pipes)
    ├── app.module.ts                # Root module that bundles all submodules together
    ├── app.controller.ts            # Root controller (contains health check endpoint)
    ├── app.service.ts               # Root service
    │
    ├── common/                      # Reusable helpers used across all modules
    │   ├── decorators/              # Custom decorators (@CurrentUser(), @Public())
    │   ├── filters/                 # Error handling (AllExceptionsFilter)
    │   ├── guards/                  # Route guards (JwtAuthGuard)
    │   ├── interceptors/            # Response transformers (TransformInterceptor)
    │   └── interfaces/              # Shared TypeScript interfaces (ApiResponse<T>)
    │
    ├── config/                      # Typed configuration loaders (app, database, jwt)
    │
    ├── database/                    # Database setup
    │   ├── base.entity.ts           # Base model (provides id as UUID, createdAt, updatedAt)
    │   ├── data-source.ts           # TypeORM DataSource used for CLI migrations
    │   └── migrations/              # Database migration SQL files
    │
    └── modules/                     # Business domain modules
        ├── auth/                    # 🔐 Registration, Login, Resend OTP & JWT
        ├── users/                   # 👤 Student profiles, roles, and courses
        ├── courses/                 # 📚 Course & topic catalog, search, demand stats
        ├── tutoring/                # 🤝 1-on-1 & group sessions, scheduling, pairing
        ├── partners/                # 👥 Study & reading partner matching & reshuffling
        ├── materials/               # 📁 Shared notes, summaries, and past questions
        ├── reviews/                 # ⭐ Tutor ratings, stats & testimonials
        ├── reports/                 # 🛡️ Safety & inappropriate conduct reporting
        └── notifications/           # 🔔 In-app student alerts & reminders
```

---

## 🗄 Database & Schema Architecture

We use **PostgreSQL** as the relational database and **TypeORM** as the Object-Relational Mapper (ORM).

### How Schema Management Works:
1. **Modular Domain Entities:** Each module defines the database tables it owns inside its own `entities/` folder (e.g. `User`, `Otp`, `Course`, `Topic`, `TutoringSession`, `StudyPartnerMatch`, `Material`, `Review`, `Report`, `Notification`).
2. **Centralized Data Source:** `src/database/data-source.ts` registers all 11 entities and provides the database connection for both the running NestJS app and TypeORM CLI migrations.
3. **Automatic Synchronization in Development:** In `.env`, `DB_SYNCHRONIZE=true` automatically updates PostgreSQL tables when you edit entities during local development.

---

## 🚀 Getting Started (Quick Setup Guide)

### Prerequisites
1. **Node.js** (v20+): Check with `node -v`
2. **PostgreSQL 16**: Ensure PostgreSQL is running on your machine.

---

### Step 1: Install Dependencies
```bash
npm install
```
*(Or `corepack pnpm install`)*

---

### Step 2: Configure Environment Variables
Copy `.env.example` to create your local `.env` file:
```bash
cp .env.example .env
```
Ensure your database credentials match your local PostgreSQL:
```env
PORT=3000
API_PREFIX=api/v1
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=study_connect_db
DB_SYNCHRONIZE=true
JWT_SECRET=super_secret_jwt_key_study_connect_2026
RESEND_API_KEY=re_your_api_key_here
MAIL_FROM=onboarding@resend.dev
```

---

### Step 3: Run the Application in Development Mode
```bash
npm run start:dev
```

You will see:
```text
[Bootstrap] StudyConnect API is running on: http://localhost:3000/api/v1
[Bootstrap] Swagger API Docs available at: http://localhost:3000/docs
```

---

### Step 4: Run the Test Suite
```bash
npm test
```
*(All 9 test suites and 40 unit test assertions run in band and pass cleanly).*

---

## 📖 Interactive Swagger API Documentation

All request payloads, response schemas, and parameter validations are documented interactively in Swagger:

👉 **`http://localhost:3000/docs`**

You can test every endpoint directly from your browser without using Postman.

---

## 📡 API Endpoints Reference

All endpoints are versioned with the `/api/v1` prefix.

### 1. Health Status
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/health` | Public | System health check |

### 2. Authentication & Verification (`/api/v1/auth`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register new student & send 6-digit OTP via Resend |
| `POST` | `/api/v1/auth/verify-otp` | Public | Verify 6-digit OTP code, activate account & receive JWT |
| `POST` | `/api/v1/auth/resend-otp` | Public | Resend OTP (rate-limited with 60-second cooldown) |
| `POST` | `/api/v1/auth/login` | Public | Authenticate verified student & receive JWT |
| `GET` | `/api/v1/auth/me` | Bearer JWT | Current student session with full profile details |

### 3. Students & Profiles (`/api/v1/users`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/users` | Bearer JWT | Browse/filter student tutors & learners |
| `GET` | `/api/v1/users/profile/me` | Bearer JWT | View current user profile |
| `PATCH`| `/api/v1/users/profile/me` | Bearer JWT | Update profile, bio, or courses |
| `GET` | `/api/v1/users/:id` | Bearer JWT | View any student's public profile and stats |

### 4. Courses & Topics Catalog (`/api/v1/courses`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/courses` | Public | Browse all courses with live tutor & learner demand counts |
| `GET` | `/api/v1/courses/search?q=integration` | Public | Search by course code, title, or syllabus topic |
| `GET` | `/api/v1/courses/:id` | Public | View course details, curriculum topics, and verified peer tutors |
| `POST` | `/api/v1/courses` | Bearer JWT | Register a new course (code, title, department, level) |
| `POST` | `/api/v1/courses/:id/topics` | Bearer JWT | Add a syllabus topic to a course |
| `POST` | `/api/v1/courses/seed` | Public | Seed 6 standard university courses & topics for testing |

### 5. Tutoring Sessions & Bookings (`/api/v1/tutoring`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/tutoring/book` | Bearer JWT | Book a 1-on-1 or group session (location, time, course) |
| `POST` | `/api/v1/tutoring/:id/join` | Bearer JWT | Join an open group tutoring session |
| `GET` | `/api/v1/tutoring/my-sessions` | Bearer JWT | List sessions where user is tutor or learner |
| `GET` | `/api/v1/tutoring/group/open` | Bearer JWT | List open upcoming group sessions (optional course filter) |
| `GET` | `/api/v1/tutoring/:id` | Bearer JWT | View full session details & attendees |
| `PATCH`| `/api/v1/tutoring/:id/status` | Bearer JWT | Update session status (`CONFIRMED`, `COMPLETED`, `CANCELLED`) |

### 6. Study Partners Matching (`/api/v1/partners`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/partners/match` | Bearer JWT | Request a peer study partner for a course |
| `GET` | `/api/v1/partners/my-partners` | Bearer JWT | List all active and past study partner pairings |
| `POST` | `/api/v1/partners/:id/reshuffle` | Bearer JWT | Reshuffle match if incompatible & find new peer |

### 7. Academic Materials Hub (`/api/v1/materials`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/materials` | Bearer JWT | Upload lecture notes, slides, or past question metadata |
| `GET` | `/api/v1/materials` | Public | Browse and filter materials by course, topic, or keyword |
| `GET` | `/api/v1/materials/:id` | Public | View material details |
| `POST` | `/api/v1/materials/:id/download` | Public | Record download count & retrieve file link |
| `DELETE`| `/api/v1/materials/:id` | Bearer JWT | Delete material (uploader or admin only) |

### 8. Reviews & Ratings (`/api/v1/reviews`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/reviews` | Bearer JWT | Submit 1-5 star review and testimonial for completed session |
| `GET` | `/api/v1/reviews/tutor/:tutorId` | Public | View all reviews, ratings, and testimonials for a tutor |

### 9. Safety & Disciplinary Reports (`/api/v1/reports`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/reports` | Bearer JWT | Submit safety or misconduct report against a user/session |
| `GET` | `/api/v1/reports/my-reports` | Bearer JWT | View reports submitted by current student |
| `GET` | `/api/v1/reports` | Admin JWT | View all incident reports across campus |
| `PATCH`| `/api/v1/reports/:id/status` | Admin JWT | Update resolution status (`INVESTIGATING`, `RESOLVED`, `DISMISSED`) |

### 10. In-App Notifications (`/api/v1/notifications`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/notifications` | Bearer JWT | Retrieve student notifications (optional `unreadOnly=true`) |
| `GET` | `/api/v1/notifications/unread-count` | Bearer JWT | Get badge counter of unread notifications |
| `PATCH`| `/api/v1/notifications/:id/read` | Bearer JWT | Mark a single notification as read |
| `PATCH`| `/api/v1/notifications/read-all` | Bearer JWT | Mark all student notifications as read |

---

## 🤝 Git Conventions for the Team

### Commit Message Format:
```text
<type>(<scope>): <short description in present tense>
```

### Commit Types:
* **`feat:`** A new feature (e.g. `feat(auth): implement student registration and JWT login`)
* **`fix:`** A bug fix (e.g. `fix(courses): correct topic search matching logic`)
* **`docs:`** Documentation changes (e.g. `docs(readme): update API reference and Render deployment guide`)
* **`refactor:`** Code restructuring without changing behavior
* **`test:`** Adding or updating unit tests (e.g. `test(courses): add search unit test`)
* **`chore:`** Dependency updates, build configs

---

## 🗺 Roadmap & Development Phases

* [x] **Phase 1: Foundation & Authentication** (Completed ✅)
  * Project architecture, TypeORM setup, PostgreSQL config.
  * JWT Authentication, Student Registration, Resend OTP Email Verification.
  * Swagger documentation & unified error interceptors.
* [x] **Phase 2: Courses & Topic Search Engine** (Completed ✅)
  * Course catalog & topic search (e.g. MTH 102 ➔ Integration).
  * High-demand metrics (count of learners needing help vs available tutors).
  * Pre-populated catalog seed endpoint.
* [x] **Phase 3: Tutoring Sessions & Scheduling** (Completed ✅)
  * 1-on-1 and group tutorial booking.
  * Campus physical meetup points & Google Meet scheduling.
  * Session status lifecycle (`SCHEDULED` ➔ `CONFIRMED` ➔ `COMPLETED` ➔ `CANCELLED`).
* [x] **Phase 4: Study Partners & Reshuffling** (Completed ✅)
  * Peer study partner matching algorithm based on course requirements and meetup preferences.
  * Partner reshuffling when schedules or goals are incompatible.
* [x] **Phase 5: Academic Materials & Resources** (Completed ✅)
  * Resource sharing for lecture notes, past exam questions, slides, lab reports.
  * Keyword search, syllabus topic filtering, and download tracking.
* [x] **Phase 6: Reviews, Safety & Notifications** (Completed ✅)
  * 1-to-5 star ratings, testimonials, and automatic recalculation of tutor ratings.
  * Disciplinary reporting for misconduct, scams, and no-shows with admin resolution.
  * Real-time in-app notification badge and alert system.
* [ ] **Phase 7: Cloud Deployment on Render.com** (Ready to Deploy 🚀)
  * Free managed PostgreSQL instance & Node.js Web Service on Render.

---

## ☁️ Phase 7: Cloud Deployment on Render.com

Deploying the backend live on Render makes it available for testing and defense presentation:

### Step 1: Create a Managed PostgreSQL Database on Render
1. Go to [dashboard.render.com](https://dashboard.render.com/) and click **New +** ➔ **PostgreSQL**.
2. Set the Name to `campusconnect-db` and select the **Free Plan**.
3. Once created, copy the **Internal Database URL** (or individual credentials: Host, Port, User, Password, Database).

### Step 2: Create a Web Service on Render
1. Click **New +** ➔ **Web Service** and connect your GitHub repository (`samuelbukumni/campusconnect`).
2. Configure settings:
   * **Runtime:** `Node`
   * **Build Command:** `npm install && npm run build`
   * **Start Command:** `npm run start:prod`
   * **Plan:** `Free`

### Step 3: Add Environment Variables in Render Dashboard
Under the **Environment** tab of your Render Web Service, add:
* `NODE_ENV` = `production`
* `PORT` = `3000`
* `API_PREFIX` = `api/v1`
* `DB_HOST` = *(From your Render PostgreSQL)*
* `DB_PORT` = `5432`
* `DB_USERNAME` = *(From your Render PostgreSQL)*
* `DB_PASSWORD` = *(From your Render PostgreSQL)*
* `DB_DATABASE` = *(From your Render PostgreSQL)*
* `DB_SYNCHRONIZE` = `true`
* `JWT_SECRET` = *(A secure random secret key)*
* `RESEND_API_KEY` = *(Your Resend.com API Key)*
* `MAIL_FROM` = `onboarding@resend.dev`

### Step 4: Verify Live API
* **Health Check:** `https://your-app.onrender.com/api/v1/health`
* **Swagger Documentation:** `https://your-app.onrender.com/docs`
