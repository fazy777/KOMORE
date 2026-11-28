# Komore: Database Tables for Health Reminders

**Owner:** Student Wellness & Notifications
**Related files:** `srs-health-notifications.md`, `reminder-rules.md`, `Komore_Health_ERD.pdf`
**Status:** Draft v1

## 1. Overview

The Health Reminders feature uses three tables:

| Table | What it stores |
|---|---|
| `notification_preference` | The student's settings: sleep details and quiet hours (one row per student) |
| `health_alert` | The four reminder types and their settings (4 rows per student) |
| `reminder_log` | Every reminder that was shown and how the student answered |

Reminders must work without internet (NFR-HN-02), so the phone must also keep this data on the device and send it to the server when it is online.

Three tables belong to other features and are only linked here: `student`, `class_schedule` and `focus_session`.

## 2. How the tables connect

| Relationship | Meaning |
|---|---|
| `student` 1 to 1 `notification_preference` | Each student has one set of settings |
| `student` 1 to many `health_alert` | Each student has four alerts (eye_rest, stretch, water, sleep) |
| `health_alert` 1 to many `reminder_log` | One alert is shown many times |
| `focus_session` 1 to many `reminder_log` | One session can have many reminders (empty for sleep reminders) |
| `class_schedule` 1 to many `health_alert` | The sleep alert is based on tomorrow's first class |

## 3. Table: notification_preference

The student's personal settings.

| Column | Type | Key | Empty allowed | Default | Notes |
|---|---|---|---|---|---|
| pref_id | integer | PK | No | auto | Unique ID |
| student_id | integer | FK, unique | No | | Links to `student`. One row per student. |
| sleep_hours_needed | decimal(3,1) | | No | 8.0 | Allowed 5 to 10 |
| prep_time_minutes | integer | | No | 60 | Morning prep. Allowed 15 to 120. |
| commute_minutes | integer | | No | | Set at onboarding from student type (day scholar 45, hostel 15). Allowed 0 to 120. |
| sleep_lead_minutes | integer | | No | 30 | Alert before bedtime. Allowed 10 to 60. |
| quiet_enabled | boolean | | No | false | Quiet hours on or off |
| quiet_start | time | | Yes | | Empty when quiet hours are off |
| quiet_end | time | | Yes | | Empty when quiet hours are off |
| updated_at | timestamp | | No | now | Last change |

## 4. Table: health_alert

The four reminder types for each student.

| Column | Type | Key | Empty allowed | Default | Notes |
|---|---|---|---|---|---|
| alert_id | integer | PK | No | auto | Unique ID |
| student_id | integer | FK | No | | Links to `student` |
| alert_type | text | | No | | `eye_rest`, `stretch`, `water` or `sleep` |
| is_enabled | boolean | | No | true | The on/off switch on the settings screen |
| interval_minutes | integer | | Yes | | Eye-rest 15 to 60, stretch 30 to 90, water 30 to 90. Empty for sleep. |
| next_trigger_at | timestamp | | Yes | | Sleep only: when the next sleep reminder appears |
| next_bedtime | timestamp | | Yes | | Sleep only: the calculated bedtime |
| based_on_class_id | integer | FK | Yes | | Sleep only: the class used in the calculation. Empty if there is no class tomorrow. |
| updated_at | timestamp | | No | now | Last change |

**Rules**
- A student can have only one row for each `alert_type` (unique on `student_id` + `alert_type`).
- The four rows are created automatically when the student registers (FR-HN-03).
- Default intervals: eye_rest 20, stretch 45, water 45.

## 5. Table: reminder_log

The history of reminders.

| Column | Type | Key | Empty allowed | Default | Notes |
|---|---|---|---|---|---|
| log_id | integer | PK | No | auto | Unique ID |
| alert_id | integer | FK | No | | Which alert was shown |
| session_id | integer | FK | Yes | | The focus session. Empty for sleep reminders. |
| scheduled_at | timestamp | | No | | When it was planned to appear |
| sent_at | timestamp | | No | | When it really appeared |
| response | text | | Yes | | `done`, `snoozed`, `skipped` or `ignored`. Empty until the student answers. |
| response_at | timestamp | | Yes | | When the student answered |
| snooze_count | integer | | No | 0 | Allowed 0 to 2 |
| is_combined | boolean | | No | false | True when it was shown together with another reminder (FR-HN-10) |

A combined notification (for example "Stretch and drink water") is saved as two log rows, one for each type, both with `is_combined = true`.

## 6. Example data

**health_alert** (one student)

| alert_id | student_id | alert_type | is_enabled | interval_minutes | next_trigger_at | next_bedtime | based_on_class_id |
|---|---|---|---|---|---|---|---|
| 1 | 7 | eye_rest | true | 20 | | | |
| 2 | 7 | stretch | true | 45 | | | |
| 3 | 7 | water | true | 45 | | | |
| 4 | 7 | sleep | true | | 2026-12-01 21:45 | 2026-12-01 22:15 | 12 |

**notification_preference**

| pref_id | student_id | sleep_hours_needed | prep_time_minutes | commute_minutes | sleep_lead_minutes | quiet_enabled | quiet_start | quiet_end |
|---|---|---|---|---|---|---|---|---|
| 1 | 7 | 8.0 | 60 | 45 | 30 | false | | |

**reminder_log**

| log_id | alert_id | session_id | scheduled_at | sent_at | response | response_at | snooze_count | is_combined |
|---|---|---|---|---|---|---|---|---|
| 1 | 1 | 31 | 15:20 | 15:20 | done | 15:21 | 0 | false |
| 2 | 2 | 31 | 15:45 | 15:45 | snoozed | 15:46 | 1 | true |
| 3 | 3 | 31 | 15:45 | 15:45 | snoozed | 15:46 | 1 | true |
| 4 | 4 | | 21:45 | 21:45 | done | 21:47 | 0 | false |

## 7. SQL (PostgreSQL)

The project uses PostgreSQL. The tables `student`, `class_schedule` and `focus_session` are made by other team members, so check their names and key columns before you run this.

```sql
CREATE TABLE notification_preference (
    pref_id            SERIAL PRIMARY KEY,
    student_id         INTEGER NOT NULL UNIQUE REFERENCES student(student_id) ON DELETE CASCADE,
    sleep_hours_needed NUMERIC(3,1) NOT NULL DEFAULT 8.0 CHECK (sleep_hours_needed BETWEEN 5 AND 10),
    prep_time_minutes  INTEGER NOT NULL DEFAULT 60 CHECK (prep_time_minutes BETWEEN 15 AND 120),
    commute_minutes    INTEGER NOT NULL CHECK (commute_minutes BETWEEN 0 AND 120),
    sleep_lead_minutes INTEGER NOT NULL DEFAULT 30 CHECK (sleep_lead_minutes BETWEEN 10 AND 60),
    quiet_enabled      BOOLEAN NOT NULL DEFAULT FALSE,
    quiet_start        TIME,
    quiet_end          TIME,
    updated_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    CHECK (quiet_enabled = FALSE OR (quiet_start IS NOT NULL AND quiet_end IS NOT NULL))
);

CREATE TABLE health_alert (
    alert_id          SERIAL PRIMARY KEY,
    student_id        INTEGER NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    alert_type        TEXT NOT NULL CHECK (alert_type IN ('eye_rest', 'stretch', 'water', 'sleep')),
    is_enabled        BOOLEAN NOT NULL DEFAULT TRUE,
    interval_minutes  INTEGER,
    next_trigger_at   TIMESTAMP,
    next_bedtime      TIMESTAMP,
    based_on_class_id INTEGER REFERENCES class_schedule(class_id) ON DELETE SET NULL,
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, alert_type),
    CHECK (
        (alert_type = 'eye_rest' AND interval_minutes BETWEEN 15 AND 60) OR
        (alert_type IN ('stretch', 'water') AND interval_minutes BETWEEN 30 AND 90) OR
        (alert_type = 'sleep' AND interval_minutes IS NULL)
    )
);

CREATE TABLE reminder_log (
    log_id       SERIAL PRIMARY KEY,
    alert_id     INTEGER NOT NULL REFERENCES health_alert(alert_id) ON DELETE CASCADE,
    session_id   INTEGER REFERENCES focus_session(session_id) ON DELETE SET NULL,
    scheduled_at TIMESTAMP NOT NULL,
    sent_at      TIMESTAMP NOT NULL,
    response     TEXT CHECK (response IN ('done', 'snoozed', 'skipped', 'ignored')),
    response_at  TIMESTAMP,
    snooze_count INTEGER NOT NULL DEFAULT 0 CHECK (snooze_count BETWEEN 0 AND 2),
    is_combined  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_reminder_log_alert_sent ON reminder_log (alert_id, sent_at DESC);
```

## 8. Which requirement each column supports

| Requirement | Where it is stored |
|---|---|
| FR-HN-03 default settings | Four `health_alert` rows and one `notification_preference` row created at registration |
| FR-HN-32 turn each reminder on or off | `health_alert.is_enabled` |
| FR-HN-33 change intervals | `health_alert.interval_minutes` |
| FR-HN-34 sleep hours, prep, commute, lead time | `notification_preference` columns |
| FR-HN-35 quiet hours | `quiet_enabled`, `quiet_start`, `quiet_end` |
| FR-HN-15 to FR-HN-19 sleep calculation | `next_trigger_at`, `next_bedtime`, `based_on_class_id` |
| FR-HN-25 snooze limit | `reminder_log.snooze_count` |
| FR-HN-26 ignored after 10 minutes | `reminder_log.response = 'ignored'` |
| FR-HN-28, FR-HN-29 reminder log | `reminder_log` |
| FR-HN-30, FR-HN-31 history and weekly summary | Counts of `reminder_log.response` grouped by `alert_type` |
| FR-HN-10 combined reminders | `reminder_log.is_combined` |
