# Product Requirements Document (PRD)
# GoalGetter - LEAP Goal Tracking Application

**Version:** 4.0
**Last Updated:** March 7, 2026
**Document Owner:** Product Team
**Status:** Requirements Finalized - Ready for Implementation

---

## Executive Summary

GoalGetter is a comprehensive goal tracking and progress management system designed specifically for the Leadership Excellence Achievement Program (LEAP). The application implements the S.M.A.R.T.e.r. goal framework (Specific, Measurable, Achievable, Relevant, Time-bound, exciting, rewarding) with hierarchical role-based access control, enabling head coaches to oversee entire batches, coaches to monitor their council members, and students to track their personal, professional, and enrollment goals across a 12-week timeline.

### Core Value Proposition

- **Hierarchical Accountability:** Four-tier organizational structure (Head Coach > Coach > Council Leader > Student) ensures clear reporting lines and accountability
- **S.M.A.R.T.e.r. Framework:** Structured goal-setting methodology proven to increase achievement rates
- **Real-time Progress Tracking:** Weekly milestone tracking with cumulative percentage calculations
- **Offline-First Architecture:** Service workers and IndexedDB enable goal updates without internet connectivity
- **Comprehensive Reporting:** PDF and CSV exports at individual, council, and batch levels

---

## Problem Statement

### Current Challenges

1. **Manual Tracking Inefficiency:** LEAP programs currently use spreadsheets (Google Sheets) for goal tracking, leading to version control issues, manual data aggregation, and limited real-time visibility
2. **Lack of Hierarchical Visibility:** Coaches cannot easily monitor their council members' progress, and head coaches lack batch-level analytics
3. **No Automated Reminders:** Students miss milestone deadlines due to lack of automated notification systems
4. **Limited Offline Access:** Internet connectivity issues prevent students from updating progress during field work or travel
5. **Reporting Overhead:** Generating progress reports requires manual data extraction and formatting

### Target Users

1. **Head Coach (1 per batch)**
   - Oversees entire LEAP program batch
   - Manages multiple councils and coaches
   - Requires batch-level analytics and cross-council comparisons
   - Needs administrative controls for user and council management

2. **Coaches (1 per council)**
   - Assigned to one council of 5-15 students
   - Monitors individual student progress
   - Provides guidance and support
   - Reports council performance to head coach

3. **Council Leaders (1 per council)**
   - A student who also serves as the coach's assistant within the council
   - Has student-level access to track their own goals
   - May have additional visibility within their council to assist the coach

4. **Students/Members (50-150 per batch)**
   - Sets and tracks 3 goals (Enrollment, Personal, Professional)
   - Updates weekly milestones and action plans
   - Views personal progress and completion rates
   - Receives automated reminders and notifications

---

## Goals and Success Metrics

### Business Goals

1. **Increase Goal Completion Rate:** Achieve 75%+ goal completion rate across all students (baseline: 45% with spreadsheets)
2. **Reduce Administrative Overhead:** Decrease coach reporting time by 60% through automated dashboards
3. **Improve Student Engagement:** Achieve 90%+ weekly update compliance through notifications
4. **Enable Data-Driven Decisions:** Provide real-time analytics for program optimization

### Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Weekly Update Compliance | 90% | % of students updating milestones weekly |
| Goal Completion Rate | 75% | % of goals marked complete by week 12 |
| Coach Reporting Time | -60% | Time spent generating reports (before/after) |
| User Satisfaction | 4.5/5 | Post-program survey rating |
| System Uptime | 99.5% | Application availability monitoring |
| Offline Sync Success | 98% | % of offline updates successfully synced |

---

## User Stories

### Head Coach Stories

1. **As a head coach**, I want to view all councils and their performance metrics on a single dashboard, so I can identify underperforming councils and provide targeted support
2. **As a head coach**, I want to create and manage councils with assigned coaches, so I can organize the batch structure efficiently
3. **As a head coach**, I want to export batch-level reports as PDF, so I can present program progress to stakeholders
4. **As a head coach**, I want to send notifications to all students or specific councils, so I can communicate important updates
5. **As a head coach**, I want to view goal distribution by type (Enrollment, Personal, Professional), so I can ensure balanced goal-setting across the program

### Coach Stories

1. **As a coach**, I want to see a list of all my council members with their goal progress, so I can identify who needs support
2. **As a coach**, I want to view individual student goal details with weekly milestones, so I can provide specific feedback
3. **As a coach**, I want to export council summary reports as PDF, so I can share progress with the head coach
4. **As a coach**, I want to send notifications to my council members, so I can remind them of deadlines or celebrate achievements
5. **As a coach**, I want to see council-level analytics (average progress, completion rate), so I can measure my council's performance

### Student Stories

1. **As a student**, I want to create S.M.A.R.T.e.r. goals for each category (Enrollment, Personal, Professional), so I can structure my objectives clearly
2. **As a student**, I want to update weekly milestones with progress percentages, so I can track my advancement toward goals
3. **As a student**, I want to add action plans for each week, so I can document specific tasks and strategies
4. **As a student**, I want to update my goals offline, so I can maintain progress tracking even without internet
5. **As a student**, I want to receive weekly check-in reminders, so I don't forget to update my progress
6. **As a student**, I want to view my goal completion dashboard, so I can visualize my overall progress
7. **As a student**, I want to export my progress as PDF, so I can share achievements with mentors or employers

---

## Functional Requirements

### 1. Authentication & Authorization

#### 1.1 User Roles
- **Role Hierarchy:** `head_coach` > `coach` > `council_leader` > `student`
- **Role Assignment:** Head coach can assign roles and council memberships
- **Authentication:** Custom email/password with bcrypt password hashing
- **Session Management:** JWT-based sessions stored in HttpOnly cookies

#### 1.2 Access Control Matrix

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

### 2. Goal Management

#### 2.1 Goal Creation
- **Goal Types:** Enrollment, Personal, Professional (exactly 3 goals per student)
- **S.M.A.R.T.e.r. Framework Fields:**
  - **Specific:** Clear goal statement (text, 500 char max)
  - **Measurable:** Quantifiable success criteria (text, 300 char max)
  - **Achievable:** Resources and capabilities assessment (text, 300 char max)
  - **Relevant:** Alignment with values/objectives (text, 300 char max)
  - **Time-bound:** Start date, end date, 12-week timeline
  - **exciting:** Personal motivation statement (text, 200 char max)
  - **rewarding:** Expected benefits/rewards (text, 200 char max)
- **Additional Metadata:**
  - Student name (auto-filled from user profile)
  - Council name (auto-filled from user's council)
  - Values declaration (text, 500 char max)
  - Creation timestamp

#### 2.2 Goal Editing
- Students can edit goals before week 1 milestone is marked complete
- After week 1 completion, only milestone updates allowed (goal statement locked)
- Coaches can view but not edit student goals
- Head coach can view all goals but not edit

#### 2.3 Goal Status
- **Draft:** Goal created but not started
- **In Progress:** At least one milestone updated
- **Completed:** All 12 milestones marked as done
- **Archived:** Goal archived after program end

### 3. Weekly Milestone Tracking

#### 3.1 Milestone Structure
- **12 Weeks:** Fixed timeline from goal start date
- **Week Number:** 1-12
- **Week Start/End Dates:** Auto-calculated from goal start date
- **Milestone Description:** Optional text describing week's focus (300 char max)
- **Action Items:** Checkboxes for specific tasks (add/remove/toggle)
- **Results/Outcomes:** Checkboxes for measurable outcomes (add/remove/toggle)
- **Live Progress:** Auto-calculated from checked actions/results
- **Cumulative Percentage:** 0-100%, represents total progress toward goal
- **Timestamps:** Created at, updated at

#### 3.2 Progress Calculation
- **Live Progress:** Auto-calculated: `(checked items / total items) * 100`
- **Completion Rate:** `(Completed Milestones / 12) * 100`
- **Goal Progress:** Uses highest cumulative percentage across all milestones
- **Council Progress:** Average of all council member goal progress
- **Batch Progress:** Average of all student goal progress

#### 3.3 Milestone Updates
- Students update milestones weekly
- Offline updates cached in IndexedDB
- Automatic sync when connection restored
- Conflict resolution: Last write wins

### 4. Action Plans

#### 4.1 Action Plan Structure
- **Week Number:** 1-12 (linked to milestone)
- **Action Description:** Specific tasks/strategies for the week (500 char max)
- **Support Needed:** Optional field for requesting coach assistance (300 char max)
- **Timestamps:** Created at, updated at

#### 4.2 Action Plan Management
- Students create/edit action plans for each week
- Coaches can view action plans to provide targeted support
- Action plans visible in goal detail view

### 5. Council Management

#### 5.1 Council Structure
- **Council Name:** Unique identifier (e.g., "KINDER")
- **Theme:** Council theme/motto (e.g., "Unstoppable Love")
- **Coach Assignment:** One coach per council
- **Council Leader:** One student designated as leader/assistant
- **Batch ID:** Program batch identifier (for multi-batch readiness)
- **Member Count:** Number of students in council
- **Timestamps:** Created at, updated at

#### 5.2 Council Operations
- **Create Council:** Head coach creates council with name, theme, coach, batch
- **Edit Council:** Head coach updates council details
- **Delete Council:** Head coach removes council (only if no members assigned)
- **Assign Students:** Head coach assigns students to councils
- **Assign Leader:** Head coach designates a student as council leader
- **Reassign Coach:** Head coach changes council coach assignment

### 6. Navigation & Views (3-Level Drill-Down)

The application uses a 3-level hierarchical drill-down navigation model. All roles share the same navigation structure with role-based access controls.

#### 6.1 L1 - Batch Overview (Head Coach only)
- **Batch Summary Stats:**
  - Total councils, total students, active goals count
  - Batch-level completion rate
- **Council Cards:** One card per council showing:
  - Council name, coach name
  - Student count, average progress
  - Click to drill down to L2

#### 6.2 L2 - Council Detail (Head Coach + Coach)
- **Council Header:** Council name, coach, student count
- **Student List:** Table with columns:
  - Student name
  - Enrollment/Personal/Professional goal progress (individual buttons)
  - Attendance View button (navigates to L3 Attendance tab)
  - Goal-specific buttons (navigate to L3 Goals tab with that goal selected)
- **Council Analytics:**
  - Average progress across all students
  - Goal distribution (Enrollment/Personal/Professional)
  - Students needing support (low progress)

#### 6.3 L3 - Student Detail (All roles, tabbed view)
A combined view for individual student data with two tabs:

**Header (shared across tabs):**
- Student name (editable by student role)
- Goal summary boxes showing Enrollment, Personal, Professional progress
- Live cumulative percentage across all goals
- Back button: "Back to Council Summaries" (returns to L2)

**Tab: Attendance (default for HC/Coach navigation)**
- **SMART Assessment Tags:** S, M, A, R, T, e, r badges with status indicators
- **Consistency Score:** Percentage badge based on attendance compliance
- **Coach/AI Chat Panel:** Contextual chat for attendance-related feedback
- **Meetings Grid:** 12-week attendance grid with status per week (Present/Late/Absent/No Data)
  - Paint mode for quick-set status across multiple weeks
- **Calls Table:** Weekly call attendance (M-T-W-Th-F per week)
  - Paint mode for quick-set status
- **Intensives Table:** Special session attendance tracking
- **Attendance Analysis:** Summary of patterns and recommendations

**Tab: Goals (default for Student login)**
- **SMART Assessment Tags:** S, M, A, R, T, e, r badges per goal
- **Goal Statement:** Full S.M.A.R.T.e.r. goal details
- **Coach/AI Chat Panel:** Contextual chat for goal-related feedback
- **Weekly Tracking Grid:** 12-week milestone table with:
  - Week number and date range
  - Milestone description (editable)
  - Action items with checkboxes (add/remove/toggle)
  - Results/outcomes with checkboxes
  - Live progress percentage (auto-calculated from checked actions/results)
  - Cumulative progress indicator

#### 6.4 Role-Based Navigation Rules
| Role | Login Destination | Accessible Levels |
|------|------------------|-------------------|
| Head Coach | L1 (Batch Overview) | L1, L2, L3 |
| Coach | L2 (Council Detail) | L2, L3 |
| Council Leader | L3 (Goals tab) | L3 only |
| Student | L3 (Goals tab) | L3 only |

### 7. Notification System

#### 7.1 Notification Types

| Type | Trigger | Recipients | Content |
|------|---------|-----------|---------|
| Milestone Reminder | 2 days before week end | Student | "Week {N} milestone due in 2 days for {Goal Name}" |
| Weekly Check-in | Every Monday 9 AM | Student | "Time to update your weekly progress!" |
| Goal Completion | All milestones marked done | Student, Coach | "Congratulations on completing {Goal Name}!" |
| Council Notification | Coach sends manually | Council members | Custom title and message |
| Batch Notification | Head coach sends manually | All students or specific councils | Custom title and message |
| Low Progress Alert | Progress < 30% at week 6 | Student, Coach | "Your {Goal Name} progress needs attention" |

#### 7.2 Notification Delivery
- **In-App Notifications:** Bell icon with unread count
- **Email Notifications:** Sent via email service (Resend or SendGrid)
- **Notification Preferences:** Users can enable/disable notification types
- **Notification History:** View past 30 days of notifications

#### 7.3 Automated Scheduling
- Milestone reminders: Scheduled 2 days before week end date
- Weekly check-ins: Cron job every Monday 9 AM (user timezone)
- Low progress alerts: Batch job runs every Sunday at week 6

### 8. Export & Reporting

#### 8.1 Student Progress PDF
- **Content:**
  - Student name, email, council
  - All 3 goals with S.M.A.R.T.e.r. details
  - Weekly milestone table (12 weeks)
  - Action plans summary
  - Overall progress statistics
- **Format:** Professional PDF with charts and tables
- **Generation:** On-demand via "Export Progress" button

#### 8.2 Council Report PDF
- **Content:**
  - Council name, coach, batch
  - Student list with progress summary
  - Council-level statistics
  - Goal distribution chart
  - Progress trend chart
  - Individual student progress tables
- **Format:** Multi-page PDF with visualizations
- **Generation:** Coach or head coach on-demand

#### 8.3 Batch Report PDF
- **Content:**
  - Batch name, head coach, date range
  - Summary statistics (councils, students, goals)
  - Council comparison table
  - Goal distribution across batch
  - Cross-council analytics
  - Top performers and insights
- **Format:** Executive summary PDF with charts
- **Generation:** Head coach on-demand

#### 8.4 CSV Exports
- **Goals CSV:** All goal data with S.M.A.R.T.e.r. fields
- **Milestones CSV:** All milestone data with progress percentages
- **Filters:** By user, council, batch, date range
- **Use Case:** Data analysis in Excel/Google Sheets

### 9. Offline Functionality

#### 9.1 Service Worker
- **Cache Strategy:** Network-first for API calls, cache-first for static assets
- **Offline Detection:** Monitor `navigator.onLine` status
- **Background Sync:** Queue failed requests for retry when online

#### 9.2 Local Storage
- **IndexedDB Schema:**
  - `goals` table: Cached goal data
  - `milestones` table: Cached milestone data
  - `pendingUpdates` table: Offline changes queue
- **Sync Logic:**
  - On reconnection, process `pendingUpdates` queue
  - Merge server data with local changes (last write wins)
  - Clear successfully synced updates

#### 9.3 Offline UI Indicators
- **Status Badge:** "Offline" badge in header when disconnected
- **Pending Changes Count:** "3 changes pending sync"
- **Sync Progress:** Loading indicator during sync operation
- **Conflict Warnings:** Alert if server data conflicts with local changes

### 10. Buddy System

- Each student is paired with an accountability buddy within their council
- Buddy assignments managed by head coach or coach
- Buddy pairing visible on student profile

### 11. Declarations

- Each student has a personal declaration statement
- Declarations visible on student profile in L3
- Editable by the student

### 12. Communication

#### 12.1 Coach-Student Chat
- Per-student chat thread between coach and student
- Available in L3 view (both Attendance and Goals tabs)
- Messages stored in database

#### 12.2 AI Coach Chat
- Rule-based AI coaching responses for MVP
- Future: Integration with Claude API for personalized coaching
- Available alongside coach chat in L3 view

### 13. Dark Mode

- Toggle between light and dark themes
- Preference persisted per user
- Full theme support across all components

---

## Non-Functional Requirements

### 1. Performance
- **Page Load Time:** < 2 seconds on 3G connection
- **API Response Time:** < 500ms for 95th percentile
- **Database Query Time:** < 200ms for complex queries
- **Offline Sync Time:** < 5 seconds for 50 pending updates

### 2. Scalability
- **Concurrent Users:** Support 500 concurrent users
- **Data Volume:** Handle 10,000 goals, 120,000 milestones
- **Batch Size:** Support batches up to 200 students

### 3. Security
- **Authentication:** Custom email/password with bcrypt (10 salt rounds)
- **Session Tokens:** JWT via jose library (HS256), stored in HttpOnly cookies
- **Authorization:** Role-based access control (RBAC)
- **Data Encryption:** HTTPS for all communications (Vercel default)
- **SQL Injection Prevention:** Parameterized queries via Drizzle ORM
- **XSS Prevention:** HttpOnly cookies, input sanitization

### 4. Reliability
- **Uptime:** 99.5% availability (Vercel SLA)
- **Data Backup:** Turso automated backups
- **Error Handling:** Graceful degradation, user-friendly error messages
- **Monitoring:** Vercel Analytics + Web Vitals

### 5. Usability
- **Responsive Design:** Mobile-first, works on 320px+ screens
- **Accessibility:** WCAG 2.1 Level AA compliance
- **Browser Support:** Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Loading States:** Skeleton screens for all async operations
- **Error States:** Clear error messages with recovery actions

### 6. Maintainability
- **Code Quality:** TypeScript with strict mode
- **Testing:** 80%+ code coverage with Vitest
- **Documentation:** Inline comments, README, API docs
- **Version Control:** Git with semantic versioning

---

## Technical Architecture

### Technology Stack

#### Frontend
- **Framework:** Next.js 15 (App Router) with TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui components
- **State Management:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts for data visualization
- **Offline:** Service Workers + IndexedDB (Serwist)

#### Backend
- **Framework:** Next.js 15 Server Actions + API Routes
- **Database:** Turso (hosted SQLite/libSQL)
- **ORM:** Drizzle ORM (libSQL dialect)
- **Authentication:** Custom bcrypt + JWT (jose library)
- **Email:** Resend or SendGrid (for notifications)

#### DevOps
- **Hosting:** Vercel (serverless)
- **CI/CD:** Vercel Git integration (auto-deploy on push)
- **Monitoring:** Vercel Analytics
- **Testing:** Vitest for unit/integration tests
- **Local DB:** SQLite via better-sqlite3 (development only)
- **Production DB:** Turso (hosted libSQL)

### Database Schema

#### Users Table
```typescript
{
  id: text (PK, cuid),
  email: text (unique, not null),
  passwordHash: text (not null),
  name: text,
  role: text ('head_coach' | 'coach' | 'council_leader' | 'student'),
  councilId: text (FK to councils.id, nullable),
  batchId: text (FK to batches.id, nullable),
  createdAt: integer (unix timestamp),
  updatedAt: integer (unix timestamp)
}
```

#### Batches Table
```typescript
{
  id: text (PK, cuid),
  name: text (unique, not null),
  startDate: text (ISO date),
  endDate: text (ISO date),
  createdAt: integer (unix timestamp),
  updatedAt: integer (unix timestamp)
}
```

#### Councils Table
```typescript
{
  id: text (PK, cuid),
  name: text (unique, not null),
  theme: text,
  coachId: text (FK to users.id, not null),
  leaderId: text (FK to users.id, nullable),
  batchId: text (FK to batches.id, not null),
  createdAt: integer (unix timestamp),
  updatedAt: integer (unix timestamp)
}
```

#### Goals Table
```typescript
{
  id: text (PK, cuid),
  userId: text (FK to users.id, not null),
  goalType: text ('enrollment' | 'personal' | 'professional', not null),
  goalStatement: text (not null),
  specificDetails: text,
  measurableCriteria: text,
  achievableResources: text,
  relevantAlignment: text,
  startDate: text (ISO date),
  endDate: text (ISO date),
  excitingMotivation: text,
  rewardingBenefits: text,
  valuesDeclaration: text,
  status: text ('draft' | 'in_progress' | 'completed' | 'archived'),
  createdAt: integer (unix timestamp),
  updatedAt: integer (unix timestamp)
}
```

#### Weekly Milestones Table
```typescript
{
  id: text (PK, cuid),
  goalId: text (FK to goals.id, not null),
  weekNumber: integer (1-12, not null),
  weekStartDate: text (ISO date),
  weekEndDate: text (ISO date),
  milestoneDescription: text,
  actions: text (JSON array of {text, done}),
  results: text (JSON array of {text, done}),
  cumulativePercentage: integer (0-100),
  createdAt: integer (unix timestamp),
  updatedAt: integer (unix timestamp)
}
```

#### Action Plans Table
```typescript
{
  id: text (PK, cuid),
  goalId: text (FK to goals.id, not null),
  weekNumber: integer (1-12, not null),
  actionDescription: text (not null),
  supportNeeded: text,
  createdAt: integer (unix timestamp),
  updatedAt: integer (unix timestamp)
}
```

#### Attendance Table
```typescript
{
  id: text (PK, cuid),
  userId: text (FK to users.id, not null),
  weekNumber: integer (1-12, not null),
  meetingStatus: text ('present' | 'late' | 'absent' | 'no_data'),
  callMon: text (status),
  callTue: text (status),
  callWed: text (status),
  callThu: text (status),
  callFri: text (status),
  createdAt: integer (unix timestamp),
  updatedAt: integer (unix timestamp)
}
```

#### Chat Messages Table
```typescript
{
  id: text (PK, cuid),
  senderId: text (FK to users.id, not null),
  recipientId: text (FK to users.id, not null),
  message: text (not null),
  type: text ('coach' | 'ai'),
  createdAt: integer (unix timestamp)
}
```

#### Notifications Table
```typescript
{
  id: text (PK, cuid),
  userId: text (FK to users.id, not null),
  title: text (not null),
  message: text (not null),
  type: text ('milestone_reminder' | 'weekly_checkin' | 'goal_completion' | 'council' | 'batch' | 'low_progress'),
  read: integer (0 or 1),
  createdAt: integer (unix timestamp)
}
```

#### Buddies Table
```typescript
{
  id: text (PK, cuid),
  studentId: text (FK to users.id, not null),
  buddyId: text (FK to users.id, not null),
  councilId: text (FK to councils.id, not null)
}
```

#### Declarations Table
```typescript
{
  id: text (PK, cuid),
  userId: text (FK to users.id, not null, unique),
  text: text (not null),
  createdAt: integer (unix timestamp),
  updatedAt: integer (unix timestamp)
}
```

---

## User Interface Design

### Design System

#### Design Direction: Vibrant Professional
Bold colors with professional layout, gamified progress indicators, rounded cards, subtle animations, and celebration effects on goal completion.

#### Color Palette
- **Primary:** Blue (#3b82f6) - Trust, professionalism
- **Secondary:** Green (#10b981) - Growth, progress
- **Accent:** Purple (#8b5cf6) - Creativity, inspiration
- **Success:** Green (#22c55e)
- **Warning:** Yellow (#eab308)
- **Error:** Red (#ef4444)
- **Neutral:** Gray scale (#f9fafb to #111827)

#### Typography
- **Font Family:** Inter (sans-serif)
- **Headings:** Bold, 24-32px
- **Body:** Regular, 14-16px
- **Small:** Regular, 12-14px

#### Spacing
- **Base Unit:** 4px
- **Scale:** 4, 8, 12, 16, 24, 32, 48, 64px

#### Components (shadcn/ui)
- **Cards:** Rounded corners (8px), subtle shadow, bold color accents
- **Buttons:** Rounded corners (6px), hover states, loading states
- **DataTable:** Sortable columns, filtering, pagination
- **Tabs:** For L3 Attendance/Goals views
- **Sidebar:** Persistent on desktop, Sheet drawer on mobile
- **Charts:** Recharts with consistent color scheme, tooltips, legends
- **Forms:** Clear labels, inline validation, error messages

### Page Layouts (3-Level Drill-Down)

The application uses state-based navigation to drill down through 3 levels. A nav bar shows the current level and allows navigation between accessible levels.

#### L1 - Batch Overview
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

#### L2 - Council Detail
```
+---------------------------------------------------+
| Header: GoalGetter | Coach | [L1][L2][L3]          |
+---------------------------------------------------+
| <- Back to Batch Overview                          |
| KINDER Council - Coach: Louie                      |
|                                                    |
| Student List                                       |
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

#### L3 - Student Detail (Tabbed)
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

## Development Phases

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
- Role-based navigation rules (HC->L1, Coach->L2, Student->L3)
- State-based drill-down navigation

### Phase 4: Attendance & Goal Tracking
- L3 Attendance tab: meetings grid, calls table, intensives
- L3 Goals tab: weekly milestone/action tracking with live %
- Paint mode for quick-set attendance status
- SMART assessment badges and consistency scoring
- Coach/AI chat panels in both tabs

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

## Testing Strategy

### Unit Tests
- Authentication flows
- Goal CRUD operations
- Milestone updates
- Council management
- Notification sending
- Export generation
- Role-based access control

### Integration Tests
- End-to-end user flows
- Offline sync functionality
- Multi-user scenarios
- Data consistency checks

### Manual Testing Checklist
- [ ] Student creates all 3 goal types
- [ ] Student updates milestones offline
- [ ] Coach views council member progress
- [ ] Head coach creates and manages councils
- [ ] Notifications sent and received
- [ ] PDF exports generate correctly
- [ ] CSV exports contain accurate data
- [ ] Responsive design on mobile devices
- [ ] Browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Dark mode toggle works correctly
- [ ] Paint mode for attendance works

---

## Deployment & Operations

### Hosting
- **Platform:** Vercel (serverless)
- **Domain:** Custom domain or `.vercel.app` subdomain
- **SSL:** Automatic HTTPS (Vercel default)
- **CDN:** Vercel Edge Network

### Environment Variables
- `DATABASE_URL` - Turso database URL
- `DATABASE_AUTH_TOKEN` - Turso authentication token
- `JWT_SECRET` - JWT signing secret (min 32 chars)
- `NEXT_PUBLIC_APP_URL` - Application base URL
- `RESEND_API_KEY` - Email service API key (optional)

### Monitoring
- **Analytics:** Vercel Analytics (Web Vitals, page views)
- **Error Tracking:** Console error logging + Vercel logs
- **Performance:** Lighthouse scores, Core Web Vitals

### Backup & Recovery
- **Database Backups:** Turso automated backups
- **Version Control:** Git-based with semantic versioning
- **Rollback:** Vercel instant rollback to previous deployments

---

## Seed Data (from v3.00 Prototype)

The application will be seeded with data from the GoalGetter v3.00 HTML prototype:

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
- Virgin group (MWF): 10 time slots, 15-minute each
- Veteran group (TTh): 10 time slots, 15-minute each
- Events: 3 Intensives (Apr 25-26, May 23-24, Jun 20-21) + 2 Workshops (May 17, Jun 14)

### Progress Data
- Weeks 1-3 populated with actions, results, and milestone data per goal per student

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Low user adoption | High | Medium | Comprehensive onboarding, training sessions |
| Data loss during offline sync | High | Low | Conflict resolution logic, backup before sync |
| Performance issues with large datasets | Medium | Medium | Database indexing, query optimization, pagination |
| Coach resistance to new system | Medium | Medium | Early coach involvement, feedback loops |
| Internet connectivity in remote areas | Medium | High | Offline-first architecture, local caching |
| Turso free tier limitations | Low | Low | Monitor usage, upgrade if needed |

---

## Glossary

- **S.M.A.R.T.e.r. Goals:** Specific, Measurable, Achievable, Relevant, Time-bound, exciting, rewarding
- **LEAP:** Leadership Excellence Achievement Program
- **Batch:** A cohort of students in a LEAP program (e.g., "LEAP 99")
- **Council:** A group of 5-15 students led by one coach
- **Council Leader:** A student who assists the coach within their council
- **Milestone:** Weekly progress checkpoint (12 total per goal)
- **Cumulative Percentage:** Total progress toward goal completion (0-100%)
- **Action Plan:** Weekly task list and strategy document
- **Head Coach:** Program leader overseeing entire batch
- **Coach:** Mentor assigned to lead a council of students
- **Student/Member:** LEAP program participant tracking goals
- **Turso:** Hosted SQLite-compatible database service (libSQL)
- **Paint Mode:** Quick-set UI pattern for rapidly updating attendance status across cells

---

**Document End**
