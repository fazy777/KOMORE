# Komore

**Komore** is an intelligent time-management and focus mobile application (Android & iOS) built for students[cite: 2]. It acts as a strict yet supportive study partner that generates daily timetables around classes and deadlines, blocks distracting apps and websites during work sessions, verifies task completion via photo proof, and prompts healthy study habits[cite: 2, 3].

> **Course / Instructor:** Submitted to Ms. Kainat Akram, Department of Computer Engineering, University of Engineering and Technology (UET), Lahore[cite: 2].

## Team

- **Muhammad Faizan** (`2025-CYS-157`)[cite: 2]
- **Shifa Fatima** (`2025-CYS-133`)[cite: 2]
- **Sawira Safdar** (`2025-CYS-132`)[cite: 2]
- **Zahra Asghar** (`2025-CYS-137`)[cite: 2]

## Core Features

- **AI Timetable & Schedule Sync:** Builds a realistic daily plan from class schedules, deadlines, and task urgency (assignments, exam revision, lecture recaps), aiming for setup in under 5 minutes[cite: 2, 3].
- **Task & App Locking:** Restricts selected distracting apps and websites during focus sessions until tasks are completed[cite: 2, 3].
- **Photo-Proof Verification:** Requires a photo of finished work (such as solved equations, code on screen, or a completed essay) to help prevent fake completions[cite: 2, 3].
- **Smart Onboarding & Routine Tracking:** Adapts to student context (e.g., day scholar or hostel student, commute time, habits) and learns peak focus hours and delays over time[cite: 3].
- **Countdown Focus Sessions:** Runs timed work intervals for focused execution[cite: 3].
- **Health Reminders:** Sends stretch/eye-rest alerts, hydration reminders, and sleep-time prompts aligned with the next day's first class[cite: 2, 3].

## Scope Boundaries

- **In Scope:** Student sign-up/profile, class schedule sync, task & deadline management, AI-generated timetable, countdown focus sessions, app/website locking, photo-proof verification, health reminders, and progress tracking[cite: 2].
- **Out of Scope (Current Semester):** Web or desktop apps, teacher/parent accounts, academic grading, social/chat features, and payments/premium plans[cite: 2].

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Mobile App** | React Native, TypeScript[cite: 3] |
| **App Blocking** | Android Accessibility Services & Usage Stats API; iOS Family Controls & Device Activity[cite: 3] |
| **Photo Proof** | React Native Camera, Cloud Object Storage[cite: 3] |
| **Backend** | Node.js, Express.js, REST APIs[cite: 3] |
| **Database** | PostgreSQL[cite: 3] |
| **AI & Scheduling** | AI API, Scheduling Algorithm, Google Calendar API[cite: 3] |
| **Health & Notifications** | Local Notifications, Background Tasks, HealthKit / Health Connect (optional)[cite: 4] |
| **Security** | HTTPS/TLS, JWT Authentication, Role-Based Access Control (RBAC)[cite: 4] |
| **Testing** | Jest, React Native Testing Library, API Testing Tools[cite: 4] |
| **Infra & Tooling** | Managed Cloud Hosting, PostgreSQL, Git & GitHub[cite: 4] |

## 8-Week Roadmap & Milestones

| Phase | Timeline | Key Deliverable |
| :--- | :--- | :--- |
| **Proposal & Planning** | Week 1 | Approved project proposal[cite: 4] |
| **Requirements** | Week 2 | Software Requirements Specification (SRS)[cite: 4] |
| **Design** | Week 3 | UI designs, database schema, and system design[cite: 4] |
| **Development** | Weeks 4–6 | Core working app (auth, tasks, timetable, locking, photo proof, health reminders)[cite: 4] |
| **Testing & Fixes** | Week 7 | Test report and bug fixes[cite: 4] |
| **Final Delivery** | Week 8 | Final demo, report, and presentation[cite: 4] |

## Initial Repository Structure

```text
komore/
├── docs/
│   └── KOMORE ( PROJECT-PROPOSAL).pdf
├── mobile/          # React Native + TypeScript client (Android & iOS)
├── backend/         # Node.js + Express.js REST API & scheduling services
├── database/        # PostgreSQL migrations, seed scripts, and schema docs
├── .gitignore
└── README.md
