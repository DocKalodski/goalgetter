# Product Requirements Document (PRD)

## GoalGetter - LEAP Goal Tracking Application

**Version:** 4.0
**Last Updated:** March 7, 2026
**Author:** Product Team
**Status:** Requirements Finalized - Ready for Implementation

---

## 1. Executive Summary

GoalGetter is a comprehensive goal tracking and progress management system designed specifically for the Leadership Excellence Achievement Program (LEAP). The application implements the S.M.A.R.T.e.r. goal framework (Specific, Measurable, Achievable, Relevant, Time-bound, exciting, rewarding) with hierarchical role-based access control, enabling head coaches to oversee entire batches, coaches to monitor their council members, and students to track their personal, professional, and enrollment goals across a 12-week timeline.

### 1.1 Core Value Proposition

- **Hierarchical Accountability:** Four-tier organizational structure (Head Coach > Coach > Council Leader > Student) ensures clear reporting lines and accountability
- **S.M.A.R.T.e.r. Framework:** Structured goal-setting methodology proven to increase achievement rates
- **Real-time Progress Tracking:** Weekly milestone tracking with cumulative percentage calculations
- **Offline-First Architecture:** Service workers and IndexedDB enable goal updates without internet connectivity
- **Comprehensive Reporting:** PDF and CSV exports at individual, council, and batch levels

### 1.2 Problem Statement

LEAP programs currently use spreadsheets (Google Sheets) for goal tracking, leading to:

1. **Manual Tracking Inefficiency:** Version control issues, manual data aggregation, limited real-time visibility
2. **Lack of Hierarchical Visibility:** Coaches cannot easily monitor council members' progress; head coaches lack batch-level analytics
3. **No Automated Reminders:** Students miss milestone deadlines due to lack of automated notifications
4. **Limited Offline Access:** Internet connectivity issues prevent progress updates during field work or travel
5. **Reporting Overhead:** Generating reports requires manual data extraction and formatting

---

## 2. Goals & Success Metrics

### 2.1 Business Goals

1. **Increase Goal Completion Rate:** Achieve 75%+ goal completion rate across all students (baseline: 45% with spreadsheets)
2. **Reduce Administrative Overhead:** Decrease coach reporting time by 60% through automated dashboards
3. **Improve Student Engagement:** Achieve 90%+ weekly update compliance through notifications
4. **Enable Data-Driven Decisions:** Provide real-time analytics for program optimization

### 2.2 Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Weekly Update Compliance | 90% | % of students updating milestones weekly |
| Goal Completion Rate | 75% | % of goals marked complete by week 12 |
| Coach Reporting Time | -60% | Time spent generating reports (before/after) |
| User Satisfaction | 4.5/5 | Post-program survey rating |
| System Uptime | 99.5% | Application availability monitoring |
| Offline Sync Success | 98% | % of offline updates successfully synced |

### 2.3 Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Page Load Time | < 2 seconds on 3G |
| API Response Time | < 500ms (95th percentile) |
| Database Query Time | < 200ms for complex queries |
| Concurrent Users | 500 |
| Data Volume | 200 students per batch |
| Browser Support | Chrome, Firefox, Safari, Edge (latest 2) |
| Mobile | Responsive, mobile-first (320px+) |
| Accessibility | WCAG 2.1 Level AA |
| Testing | 80%+ code coverage (Vitest) |
| TypeScript | Strict mode, no type errors |

---

## 3. User Personas

### 3.1 Head Coach (HC)

| Attribute | Detail |
|-----------|--------|
| **Count** | 1 per batch |
| **Description** | Program leader overseeing the entire LEAP batch |
| **Access Level** | L1 (Batch Overview), L2 (Council Detail), L3 (Student Detail) |
| **Login Destination** | L1 - Batch Overview |
| **Key Activities** | Manage councils/coaches, view batch-level analytics, cross-council comparisons, administrative controls, send batch notifications, export batch reports |

### 3.2 Coach

| Attribute | Detail |
|-----------|--------|
| **Count** | 1 per council |
| **Description** | Mentor assigned to lead a council of 5-15 students |
| **Access Level** | L2 (Council Detail), L3 (Student Detail) |
| **Login Destination** | L2 - Council Detail |
| **Key Activities** | Monitor student progress, provide guidance, view council analytics, send council notifications, export council reports |

### 3.3 Council Leader

| Attribute | Detail |
|-----------|--------|
| **Count** | 1 per council |
| **Description** | A student who also serves as the coach's assistant within the council |
| **Access Level** | L3 (Student Detail) |
| **Login Destination** | L3 - Goals tab |
| **Key Activities** | Track own goals, update milestones, assist coach with council visibility |

### 3.4 Student

| Attribute | Detail |
|-----------|--------|
| **Count** | 50-150 per batch |
| **Description** | LEAP program participant tracking 3 goals |
| **Access Level** | L3 (Student Detail) |
| **Login Destination** | L3 - Goals tab |
| **Key Activities** | Set/track S.M.A.R.T.e.r. goals, update weekly milestones, add action plans, view progress dashboard, receive reminders |

---

## 4. User Stories

### 4.1 Head Coach Stories

1. **As a head coach**, I want to view all councils and their performance metrics on a single dashboard, so I can identify underperforming councils
2. **As a head coach**, I want to create and manage councils with assigned coaches, so I can organize the batch structure
3. **As a head coach**, I want to export batch-level reports as PDF, so I can present program progress to stakeholders
4. **As a head coach**, I want to send notifications to all students or specific councils, so I can communicate important updates
5. **As a head coach**, I want to view goal distribution by type, so I can ensure balanced goal-setting across the program

### 4.2 Coach Stories

1. **As a coach**, I want to see a list of all my council members with their goal progress, so I can identify who needs support
2. **As a coach**, I want to view individual student goal details with weekly milestones, so I can provide specific feedback
3. **As a coach**, I want to export council summary reports as PDF, so I can share progress with the head coach
4. **As a coach**, I want to send notifications to my council members, so I can remind them of deadlines
5. **As a coach**, I want to see council-level analytics, so I can measure my council's performance

### 4.3 Student Stories

1. **As a student**, I want to create S.M.A.R.T.e.r. goals for each category (Enrollment, Personal, Professional), so I can structure my objectives
2. **As a student**, I want to update weekly milestones with progress percentages, so I can track advancement
3. **As a student**, I want to add action plans for each week, so I can document tasks and strategies
4. **As a student**, I want to update my goals offline, so I can maintain progress tracking without internet
5. **As a student**, I want to receive weekly check-in reminders, so I don't forget to update progress
6. **As a student**, I want to view my goal completion dashboard, so I can visualize overall progress
7. **As a student**, I want to export my progress as PDF, so I can share achievements

---

## 5. Detailed Feature Requirements

### 5.1 Module 1: Authentication & Authorization

#### Input Fields

| Field | Type | Validation |
|-------|------|------------|
| Email | text | Required, valid email format, unique |
| Password | text | Required, min 8 characters |

#### Access Control Matrix

| Feature | Student | Council Leader | Coach | Head Coach |
|---------|---------|----------------|-------|------------|
| View own goals | Y | Y | Y | Y |
| Create/edit own goals | Y | Y | Y | Y |
| View council member goals | - | - | Y | Y |
| View all goals (batch-level) | - | - | - | Y |
| Create councils | - | - | - | Y |
| Assign users to councils | - | - | - | Y |
| Update user roles | - | - | - | Y |
| Send council notifications | - | - | Y | Y |
| Send batch notifications | - | - | - | Y |
| Export own progress | Y | Y | Y | Y |
| Export council reports | - | - | Y | Y |
| Export batch reports | - | - | - | Y |

#### Workflow

1. User submits email + password
2. Server validates credentials via bcrypt comparison
3. JWT tokens created (access: 1h, refresh: 7d) via jose (HS256)
4. Tokens stored in HttpOnly, Secure, SameSite=Strict cookies
5. Next.js middleware validates token on every protected route
6. Role-based redirect: HC->L1, Coach->L2, Student/CL->L3(Goals)

#### Acceptance Criteria

- [ ] Users can login with email/password
- [ ] Passwords hashed with bcrypt (10 salt rounds)
- [ ] JWT access token expires in 1 hour
- [ ] JWT refresh token expires in 7 days
- [ ] Role-based route protection enforced via middleware
- [ ] Login redirects to correct level based on role

### 5.2 Module 2: Goal Management (S.M.A.R.T.e.r. Framework)

#### Input Fields

| Field | Type | Validation |
|-------|------|------------|
| Goal Type | enum | Required: enrollment, personal, professional |
| Specific (Goal Statement) | text | Required, max 500 chars |
| Measurable | text | Optional, max 300 chars |
| Achievable | text | Optional, max 300 chars |
| Relevant | text | Optional, max 300 chars |
| Time-bound (Start/End Date) | date | 12-week timeline |
| exciting | text | Optional, max 200 chars |
| rewarding | text | Optional, max 200 chars |
| Values Declaration | text | Optional, max 500 chars |

#### Goal Status Flow

```
Draft -> In Progress -> Completed -> Archived
```

- **Draft:** Goal created but not started
- **In Progress:** At least one milestone updated
- **Completed:** All 12 milestones marked as done
- **Archived:** Goal archived after program end

#### Business Rules

- Each student has exactly 3 goals (one per type)
- Goals editable before week 1 milestone is marked complete
- After week 1 completion, only milestone updates allowed (goal statement locked)
- Coaches can view but not edit student goals
- Head coach can view all goals but not edit

#### Acceptance Criteria

- [ ] Students can create exactly 3 goals (enrollment, personal, professional)
- [ ] S.M.A.R.T.e.r. fields validated with correct length constraints
- [ ] Goal status transitions work correctly
- [ ] Goal editing locked after week 1 completion
- [ ] Coaches can view but not modify student goals

### 5.3 Module 3: Weekly Milestone Tracking

#### Input Fields

| Field | Type | Validation |
|-------|------|------------|
| Week Number | integer | 1-12 |
| Milestone Description | text | Optional, max 300 chars |
| Action Items | JSON array | [{text: string, done: boolean}] |
| Results/Outcomes | JSON array | [{text: string, done: boolean}] |
| Cumulative Percentage | integer | 0-100, auto-calculated |

#### Progress Calculation

- **Live Progress:** `(checked items / total items) * 100`
- **Goal Progress:** Highest cumulative percentage across all milestones
- **Council Progress:** Average of all council member goal progress
- **Batch Progress:** Average of all student goal progress

#### Business Rules

- Students update milestones weekly
- Offline updates cached in IndexedDB with automatic sync
- Conflict resolution: Last write wins

#### Acceptance Criteria

- [ ] 12-week milestone grid renders correctly
- [ ] Action/result checkboxes toggle and persist
- [ ] Live progress auto-calculates from checked items
- [ ] Cumulative percentage updates correctly
- [ ] Offline milestone updates sync on reconnection

### 5.4 Module 4: Attendance Tracking

#### Components

| Component | Description |
|-----------|-------------|
| Meetings Grid | 12-week attendance grid (Present/Late/Absent/No Data) |
| Calls Table | Weekly call attendance (M-T-W-Th-F per week) |
| Intensives Table | 3 special session events (2 days each) |
| Workshops Table | 2 workshop events |
| Paint Mode | Quick-set status across multiple cells |
| Consistency Score | Percentage based on attendance compliance |

#### Business Rules

- Only coaches and HC can update attendance
- Paint mode allows rapid status updates
- Consistency score auto-calculated from attendance data

#### Acceptance Criteria

- [ ] Meetings grid shows 12 weeks with status toggles
- [ ] Calls table shows M-T-W-Th-F for each week
- [ ] Paint mode works for quick-set operations
- [ ] Consistency score calculates correctly
- [ ] Intensives/workshops tracked separately

### 5.5 Module 5: 3-Level Navigation

#### Navigation Structure

| Level | View | Accessible By |
|-------|------|---------------|
| L1 | Batch Overview - Council cards with progress stats | HC only |
| L2 | Council Detail - Student list with goal/attendance buttons | HC + Coach |
| L3 | Student Detail - Tabbed: Attendance + Goals | All roles |

#### Navigation Flow

| From | Action | Destination |
|------|--------|-------------|
| L1 | Click council card | L2 (council selected) |
| L2 | Click attendance "View" | L3 Attendance tab |
| L2 | Click goal % button | L3 Goals tab (goal selected) |
| L3 | Click "Back to Council" | L2 |
| L3 | Switch tab | Toggle between Attendance/Goals |

#### L3 Student Detail - Tab Structure

**Header (shared):** Student name, goal summary boxes (Enrollment/Personal/Professional progress), live cumulative percentage, back button

**Attendance Tab:**
- SMART Assessment badges (S, M, A, R, T, e, r)
- Consistency score
- Coach/AI chat panel
- Meetings grid (12 weeks, paint mode)
- Calls table (M-T-W-Th-F, paint mode)
- Intensives/workshops tables

**Goals Tab:**
- SMART Assessment badges per goal
- Goal statement (S.M.A.R.T.e.r. details)
- Coach/AI chat panel
- Weekly tracking grid (12 weeks: milestones, actions, results, live %)

#### Acceptance Criteria

- [ ] HC sees L1 on login; Coach sees L2; Student/CL sees L3
- [ ] Council cards on L1 show progress stats and drill down to L2
- [ ] Student list on L2 shows goal progress buttons and attendance view
- [ ] L3 tabbed view switches between Attendance and Goals
- [ ] Back navigation works correctly at each level

### 5.6 Module 6: Council Management

#### Input Fields

| Field | Type | Validation |
|-------|------|------------|
| Council Name | text | Required, unique |
| Theme | text | Optional |
| Coach Assignment | FK | Required, one coach per council |
| Council Leader | FK | Optional, must be a student in the council |
| Batch ID | FK | Required |

#### Operations (HC only)

- Create/edit/delete councils (delete only if no members assigned)
- Assign/reassign students to councils
- Designate council leaders
- Reassign coaches

#### Acceptance Criteria

- [ ] HC can create councils with name, theme, coach, batch
- [ ] HC can assign students to councils
- [ ] HC can designate a student as council leader
- [ ] Council deletion prevented if members exist

### 5.7 Module 7: Notification System

#### Notification Types

| Type | Trigger | Recipients |
|------|---------|-----------|
| Milestone Reminder | 2 days before week end | Student |
| Weekly Check-in | Every Monday 9 AM | Student |
| Goal Completion | All milestones done | Student, Coach |
| Council Notification | Coach sends manually | Council members |
| Batch Notification | HC sends manually | All students/councils |
| Low Progress Alert | Progress < 30% at week 6 | Student, Coach |

#### Delivery Channels

- **In-App:** Bell icon with unread count, notification dropdown
- **Email:** Sent via Resend or SendGrid
- **Preferences:** Users can enable/disable notification types

#### Acceptance Criteria

- [ ] Bell icon shows unread notification count
- [ ] Notification types trigger correctly
- [ ] Email notifications delivered via configured service
- [ ] Users can manage notification preferences

### 5.8 Module 8: Export & Reporting

#### Report Types

| Report | Content | Generator |
|--------|---------|-----------|
| Student Progress PDF | 3 goals, milestones, action plans, statistics | Student, Coach, HC |
| Council Report PDF | Student list, council stats, charts | Coach, HC |
| Batch Report PDF | Council comparisons, cross-council analytics | HC only |
| Goals CSV | All goal data with S.M.A.R.T.e.r. fields | Coach, HC |
| Milestones CSV | Milestone data with progress percentages | Coach, HC |

#### Acceptance Criteria

- [ ] Student PDF includes all 3 goals with weekly milestones
- [ ] Council PDF includes student list with progress summary
- [ ] Batch PDF includes council comparisons
- [ ] CSV exports filterable by user, council, date range

### 5.9 Module 9: Offline Functionality (PWA)

#### Architecture

| Layer | Strategy |
|-------|----------|
| Static Assets | Cache-first (install-time precache) |
| API Responses | Network-first with cache fallback |
| Goal Updates | IndexedDB queue for offline writes |
| Sync | Background Sync API on reconnection |

#### IndexedDB Schema

- `goals` store: Cached goal data
- `milestones` store: Cached milestone data
- `pendingUpdates` store: Offline changes queue

#### UI Indicators

- "Offline" badge in header when disconnected
- Pending changes counter ("3 changes pending sync")
- Sync progress indicator during sync
- Conflict warnings if server data differs

#### Acceptance Criteria

- [ ] Service Worker caches static assets on install
- [ ] Goal updates work offline via IndexedDB
- [ ] Pending updates sync automatically on reconnection
- [ ] Offline status badge and pending count display correctly
- [ ] PWA is installable on mobile devices

### 5.10 Module 10: Communication

#### Coach-Student Chat

- Per-student chat thread between coach and student
- Available in L3 view (both Attendance and Goals tabs)
- Messages stored in database

#### AI Coach Chat

- Rule-based coaching responses for MVP
- Future: Integration with Claude API for personalized coaching
- Available alongside coach chat in L3 view

#### Acceptance Criteria

- [ ] Coach can send/receive messages to/from students
- [ ] AI coach provides rule-based responses
- [ ] Chat panel visible in L3 Attendance and Goals tabs

### 5.11 Module 11: Additional Features

#### Buddy System

- Each student paired with an accountability buddy within their council
- Assignments managed by HC or coach
- Pairing visible on student profile

#### Declarations

- Each student has a personal declaration statement
- Visible on student profile in L3
- Editable by the student

#### Dark Mode

- Toggle between light and dark themes
- Preference persisted per user
- Full theme support across all components

#### Acceptance Criteria

- [ ] Buddy pairings display on student profile
- [ ] Students can edit their declarations
- [ ] Dark mode toggle persists preference
- [ ] All components render correctly in dark mode

---

## 6. System Architecture

### 6.1 Technology Stack

#### Frontend

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 15 (App Router) with TypeScript (strict mode) |
| Styling | Tailwind CSS 4 + shadcn/ui components |
| State Management | TanStack Query (React Query) |
| Forms | React Hook Form + Zod validation |
| Charts | Recharts |
| Offline | Service Workers + IndexedDB (Serwist) |

#### Backend

| Component | Technology |
|-----------|-----------|
| API | Next.js 15 Server Actions + API Routes |
| Database | Turso (hosted SQLite/libSQL) |
| ORM | Drizzle ORM (libSQL dialect) |
| Auth | Custom bcrypt + JWT (jose library, HS256) |
| Email | Resend or SendGrid |

#### DevOps

| Component | Technology |
|-----------|-----------|
| Hosting | Vercel (serverless) |
| CI/CD | Vercel Git integration (auto-deploy on push) |
| Monitoring | Vercel Analytics + Web Vitals |
| Testing | Vitest (unit/integration) |
| Local DB | SQLite via better-sqlite3 (development) |
| Prod DB | Turso (hosted libSQL) |

### 6.2 Design System

| Aspect | Specification |
|--------|--------------|
| Direction | Vibrant Professional |
| Primary Color | Blue (#3b82f6) |
| Secondary Color | Green (#10b981) |
| Accent Color | Purple (#8b5cf6) |
| Font | Inter (sans-serif) |
| Dark Mode | Full support with toggle |
| Layout | Sidebar (desktop) + Sheet drawer (mobile) |
| Cards | Rounded corners (8px), subtle shadows, bold color accents |
| Progress | Gamified indicators with professional aesthetics |
| Animations | Subtle micro-interactions, celebration on goal completion |

---

## 7. Data Models

### 7.1 Database Schema

| Table | Key Fields |
|-------|-----------|
| **batches** | id (PK), name, start_date, end_date, timestamps |
| **users** | id (PK), email (unique), password_hash, name, role (enum), council_id (FK), batch_id (FK), timestamps |
| **councils** | id (PK), name (unique), theme, coach_id (FK), leader_id (FK), batch_id (FK), timestamps |
| **goals** | id (PK), user_id (FK), goal_type (enum), goal_statement, S.M.A.R.T.e.r. fields, status (enum), timestamps |
| **weekly_milestones** | id (PK), goal_id (FK), week_number, milestone_description, actions (JSON), results (JSON), cumulative_percentage, timestamps |
| **action_plans** | id (PK), goal_id (FK), week_number, action_description, support_needed, timestamps |
| **attendance** | id (PK), user_id (FK), week_number, meeting_status (enum), call_mon-fri, timestamps |
| **chat_messages** | id (PK), sender_id (FK), recipient_id (FK), message, type (enum), created_at |
| **notifications** | id (PK), user_id (FK), title, message, type (enum), read, created_at |
| **buddies** | id (PK), student_id (FK), buddy_id (FK), council_id (FK) |
| **declarations** | id (PK), user_id (FK, unique), text, timestamps |

All tables use text IDs (cuid) and integer timestamps (unix).

### 7.2 Entity Relationships

```
batches 1--* councils
batches 1--* users
councils 1--* users (members)
councils 1--1 users (coach)
councils 0..1--1 users (leader)
users 1--* goals (3 per student)
goals 1--* weekly_milestones (12 per goal)
goals 1--* action_plans
users 1--* attendance (12 weeks)
users 1--* chat_messages (sender)
users 1--* notifications
users 1--* buddies
users 1--1 declarations
```

---

## 8. Security Requirements

| Area | Requirement |
|------|------------|
| Password Hashing | bcrypt with 10 salt rounds |
| Session Tokens | JWT via jose (HS256), HttpOnly cookies |
| Token Expiry | Access: 1h, Refresh: 7d |
| Cookie Flags | HttpOnly, Secure, SameSite=Strict |
| Authorization | Role-based access control (RBAC) in middleware + server actions |
| Transport | HTTPS for all communications (Vercel default) |
| SQL Injection | Parameterized queries via Drizzle ORM |
| XSS Prevention | HttpOnly cookies, input sanitization |
| Input Validation | Zod schemas for all server action inputs |

---

## 9. Development Phases

### Phase 1: Foundation
- Database schema design (Drizzle + Turso)
- Authentication system (bcrypt + JWT)
- Role-based access control
- Basic project scaffolding (Next.js 15 + shadcn/ui)

### Phase 2: Core Features
- S.M.A.R.T.e.r. goal creation form
- Weekly milestone tracking
- Action plan management
- Student dashboard

### Phase 3: 3-Level Navigation & Views
- L1 Batch Overview (Head Coach)
- L2 Council Detail with student list and goal buttons
- L3 Student Detail with tabbed Attendance + Goals view
- Role-based navigation rules
- State-based drill-down navigation

### Phase 4: Attendance & Goal Tracking
- L3 Attendance tab: meetings grid, calls table, intensives
- L3 Goals tab: weekly milestone/action tracking with live %
- Paint mode for quick-set attendance status
- SMART assessment badges and consistency scoring
- Coach/AI chat panels

### Phase 5: Advanced Features
- Council management UI
- Buddy system
- Declarations
- Dark mode toggle
- Seed data migration from v3.00 prototype

### Phase 6: Offline Functionality
- Service Worker setup (Serwist)
- IndexedDB caching and sync
- Offline indicators in UI
- Background sync on reconnection

### Phase 7: Notifications & Exports
- In-app notification system
- Email notifications (Resend/SendGrid)
- PDF/CSV export functionality
- Automated reminder scheduling

### Phase 8: Polish & Launch
- Progress visualization charts (Recharts)
- User onboarding flow
- Performance optimization
- Responsive design testing
- User acceptance testing

---

## 10. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Low user adoption | High | Medium | Comprehensive onboarding, training sessions |
| Data loss during offline sync | High | Low | Conflict resolution logic, backup before sync |
| Performance with large datasets | Medium | Medium | Database indexing, query optimization, pagination |
| Coach resistance to new system | Medium | Medium | Early coach involvement, feedback loops |
| Internet connectivity issues | Medium | High | Offline-first architecture, local caching |
| Turso free tier limitations | Low | Low | Monitor usage, upgrade if needed |

---

## 11. Success Criteria (Definition of Done)

### Functional

- [ ] All 4 roles can login and see correct dashboard level
- [ ] Students can create and track 3 S.M.A.R.T.e.r. goals
- [ ] 12-week milestone tracking with auto-calculated progress
- [ ] 3-level drill-down navigation works for all roles
- [ ] Attendance tracking with paint mode operational
- [ ] Council management by HC functional
- [ ] Notifications delivered (in-app + email)
- [ ] PDF/CSV exports generate correctly
- [ ] Offline updates sync on reconnection
- [ ] Dark mode toggle works across all components

### Non-Functional

- [ ] Page load < 2 seconds on 3G
- [ ] API response < 500ms (95th percentile)
- [ ] 80%+ test coverage
- [ ] TypeScript strict mode, zero type errors
- [ ] WCAG 2.1 Level AA compliance
- [ ] PWA installable on mobile

### Quality Gates

1. All Vitest tests passing
2. TypeScript strict mode clean (`tsc --noEmit`)
3. Lighthouse score > 90
4. Security review passed (no OWASP top 10 vulnerabilities)
5. Responsive design verified (320px to 1920px)

---

## 12. Seed Data (from v3.00 Prototype)

### Users (20 total)
- 1 Head Coach: Louie
- 19 Students: Elaine, Kalod, Nini, Iya, Danji, Royce, Gek, Angie, Maj, RJ, Jervin, Yollie, Anthony, JP, Daisy, Mickey, Ding, Cherry, Nancy

### Councils (3)

| Council | Theme | Coach | Leader | Members |
|---------|-------|-------|--------|---------|
| KINDER | Unstoppable Love | Louie | Kalod | 6 |
| MARY-G | Unstoppable Love | Louie | RJ | 6 |
| The Magnificents | Unstoppable Love | Louie | JP | 7 |

### Meta Call Schedule
- Virgin group (MWF): 10 time slots, 15-minute each (7:30 AM - 10:30 PM)
- Veteran group (TTh): 10 time slots, 15-minute each (7:30 AM - 10:30 PM)
- Events: 3 Intensives (Apr 25-26, May 23-24, Jun 20-21) + 2 Workshops (May 17, Jun 14)

### Progress Data
- Weeks 1-3 populated with actions, results, and milestone data per goal per student

---

## 13. Glossary

| Term | Definition |
|------|-----------|
| S.M.A.R.T.e.r. Goals | Specific, Measurable, Achievable, Relevant, Time-bound, exciting, rewarding |
| LEAP | Leadership Excellence Achievement Program |
| Batch | A cohort of students in a LEAP program (e.g., "LEAP 99") |
| Council | A group of 5-15 students led by one coach |
| Council Leader | A student who assists the coach within their council |
| Milestone | Weekly progress checkpoint (12 total per goal) |
| Cumulative Percentage | Total progress toward goal completion (0-100%) |
| Action Plan | Weekly task list and strategy document |
| Paint Mode | Quick-set UI pattern for rapidly updating attendance status across cells |
| Turso | Hosted SQLite-compatible database service (libSQL) |

---

## Appendix A: UI Wireframes

### L1 - Batch Overview

```
+---------------------------------------------------+
| Header: GoalGetter | Head Coach | [L1][L2][L3]    |
+---------------------------------------------------+
| Batch Overview - LEAP 99                           |
|                                                    |
| +------------------+ +------------------+          |
| | KINDER Council   | | MARY-G Council   |          |
| | Coach: Louie     | | Coach: Louie     |          |
| | 6 students       | | 6 students       |          |
| | Avg: 67%         | | Avg: 72%         |          |
| | [View Council]   | | [View Council]   |          |
| +------------------+ +------------------+          |
|                                                    |
| Batch Stats: 3 Councils | 19 Students | 57 Goals   |
+---------------------------------------------------+
```

### L2 - Council Detail

```
+---------------------------------------------------+
| Header: GoalGetter | Coach | [L1][L2][L3]          |
+---------------------------------------------------+
| <- Back to Batch Overview                          |
| KINDER Council - Coach: Louie                      |
|                                                    |
| +----------+------+------+------+----------+       |
| |Student   |Enroll|Person|Profes|Attendance|       |
| +----------+------+------+------+----------+       |
| |Elaine I. | 67%  | 45%  | 80%  | [View]   |       |
| |Kalod S.  | 50%  | 60%  | 55%  | [View]   |       |
| +----------+------+------+------+----------+       |
|                                                    |
| Click % to go to L3 Goals tab for that goal        |
| Click [View] to go to L3 Attendance tab            |
+---------------------------------------------------+
```

### L3 - Student Detail (Tabbed)

```
+---------------------------------------------------+
| Header: GoalGetter | User | [L1][L2][L3]           |
+---------------------------------------------------+
| <- Back to Council Summaries                       |
| Student: Elaine Iwa                                |
| +----------+ +---------+ +-------------+           |
| |Enrollment| |Personal | |Professional | Live% 64% |
| |  67%     | |  45%    | |  80%        |           |
| +----------+ +---------+ +-------------+           |
|                                                    |
| [Attendance Tab] [Goals Tab]                       |
| -------------------------------------------------- |
|                                                    |
| === Attendance Tab ===                             |
| SMART Badges | Consistency: 85%                    |
| Meetings Grid (12 weeks, paint mode)               |
| Calls Table (M-T-W-Th-F, paint mode)              |
| Intensives Table                                   |
| Chat Panel | Analysis                              |
|                                                    |
| === Goals Tab ===                                  |
| SMART Badges per goal                              |
| Goal Statement (S.M.A.R.T.e.r.)                   |
| Weekly Tracking Grid (12 weeks)                    |
|   - Milestones, Actions, Results                   |
|   - Live % auto-calculated                        |
| Chat Panel                                         |
+---------------------------------------------------+
```

---

## Appendix B: Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Turso database URL (or `file:./local.db` for dev) | Yes |
| `DATABASE_AUTH_TOKEN` | Turso authentication token | Production only |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | Yes |
| `NEXT_PUBLIC_APP_URL` | Application base URL | Yes |
| `RESEND_API_KEY` | Email service API key | Optional |

---

**Document End**
