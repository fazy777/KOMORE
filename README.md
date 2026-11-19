# Komore – Intelligent Student Time Management & Focus Application

**Komore** is an intelligent time-management and productivity application for Android and iOS, designed specifically for university students. It serves as a strict yet supportive study partner by generating personalized daily timetables, managing academic tasks and deadlines, restricting distractions during focus sessions, and encouraging healthy study habits.

## Project Information

- **Course Instructor:** Ms. Kainat Akram
- **Department:** Computer Engineering
- **Institution:** University of Engineering and Technology (UET), Lahore

## Team Members

| Name | Registration Number |
|---|---|
| Muhammad Faizan | `2025-CYS-157` |
| Shifa Fatima | `2025-CYS-133` |
| Sawira Safdar | `2025-CYS-132` |
| Zahra Asghar | `2025-CYS-137` |

## Core Features

### 1. AI-Powered Timetable Generation
- Generates personalized daily schedules based on class timings, assignments, examinations, and deadlines.
- Prioritizes tasks according to urgency, workload, and available time.
- Creates realistic study plans with minimal user input.

### 2. App and Website Blocking
- Restricts access to selected distracting applications and websites during scheduled focus sessions.
- Maintains focus until the designated session or task requirements are completed.
- Uses platform-specific APIs to implement blocking functionality.

### 3. Photo-Based Task Verification
- Requires users to submit photographic evidence of completed tasks.
- Supports proof such as handwritten solutions, completed assignments, and code displayed on a screen.
- Uses verification mechanisms to discourage false task completion claims.

### 4. Smart Onboarding and Routine Tracking
- Collects relevant student information, including accommodation type, commute duration, academic schedule, and study habits.
- Tracks productivity patterns and task completion behavior.
- Identifies preferred study hours and recurring delays to improve future scheduling.

### 5. Countdown Focus Sessions
- Provides timed study sessions for individual tasks.
- Helps students maintain concentration through structured work intervals.
- Tracks session completion and productivity.

### 6. Health and Study Reminders
- Sends hydration and stretching reminders.
- Provides eye-rest notifications during extended study sessions.
- Suggests appropriate sleeping times based on the next day's academic schedule.

## Project Scope

### In Scope
- Student registration, authentication, and profile management.
- Class schedule management and calendar synchronization.
- Task and academic deadline management.
- AI-powered timetable generation.
- Countdown-based focus sessions.
- Application and website blocking.
- Photo-based task completion verification.
- Health and productivity reminders.
- Study progress tracking and productivity analytics.

### Out of Scope
The following functionalities are excluded from the current semester's development:

- Web and desktop applications.
- Teacher and parent accounts.
- Academic grading and examination management.
- Social networking and chat functionality.
- Payment processing and premium subscription plans.

## Technology Stack

| Component | Technologies |
|---|---|
| Mobile Application | React Native, TypeScript |
| App Blocking (Android) | Accessibility Services, Usage Stats API |
| App Blocking (iOS) | Family Controls, Device Activity |
| Camera and Photo Proof | React Native Camera, Cloud Object Storage |
| Backend | Node.js, Express.js, REST APIs |
| Database | PostgreSQL |
| AI and Scheduling | AI API, Custom Scheduling Algorithm |
| Calendar Integration | Google Calendar API |
| Notifications | Local Notifications, Background Tasks |
| Health Integration | Apple HealthKit, Android Health Connect (Optional) |
| Authentication and Security | JWT, HTTPS/TLS, Role-Based Access Control (RBAC) |
| Testing | Jest, React Native Testing Library, API Testing Tools |
| Infrastructure | Managed Cloud Hosting, Git, GitHub |

## Development Roadmap

The project will be developed over eight weeks, following a structured software development lifecycle.

| Phase | Timeline | Deliverables |
|---|---|---|
| Proposal and Planning | Week 1 | Approved project proposal |
| Requirements Analysis | Week 2 | Software Requirements Specification (SRS) |
| System Design | Week 3 | UI/UX designs, database schema, and system architecture |
| Development | Weeks 4–6 | Working application with core functionalities |
| Testing and Debugging | Week 7 | Test reports, bug fixes, and performance improvements |
| Final Delivery | Week 8 | Final application, project report, and demonstration |

## Initial Repository Structure

```text
komore/
│
├── docs/
│   └── KOMORE_PROJECT_PROPOSAL.pdf
│
├── mobile/
│   └── React Native + TypeScript application
│
├── backend/
│   └── Node.js + Express.js REST API
│
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── schema/
│
├── .gitignore
└── README.md
```

## Project Objective

The primary objective of Komore is to help university students develop consistent study routines, manage academic responsibilities effectively, minimize digital distractions, and maintain a healthy balance between productivity and personal well-being.

By combining intelligent scheduling, distraction management, task verification, and habit tracking, Komore aims to provide a centralized academic productivity solution tailored to students' daily routines.
