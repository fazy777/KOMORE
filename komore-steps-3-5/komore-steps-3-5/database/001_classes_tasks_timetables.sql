-- =====================================================================
-- Komore: Scheduling & AI Timetable Engine (Steps 3, 4, 5)
-- Author : Shifa Fatima
-- Tables : classes, calendar_connections, tasks, timetables,
--          timetable_entries
-- DB     : PostgreSQL
--
-- Depends on: users(id uuid primary key) from Step 1 (sign-up/login).
-- Step 8 (photo proof) writes tasks.status = 'completed' and
-- tasks.completed_at once a photo is verified.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- gen_random_uuid()

-- ---------------------------------------------------------------------
-- Enumerated types
-- ---------------------------------------------------------------------
CREATE TYPE class_kind    AS ENUM ('class', 'lab');
CREATE TYPE class_source  AS ENUM ('manual', 'google_calendar');
CREATE TYPE task_category AS ENUM ('assignment', 'exam_revision', 'lecture_recap');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE task_status   AS ENUM ('pending', 'scheduled', 'in_progress', 'completed');
CREATE TYPE entry_kind    AS ENUM ('class', 'task_block');

-- ---------------------------------------------------------------------
-- STEP 3: Class schedule (fixed, unmovable time blocks)
-- ---------------------------------------------------------------------
CREATE TABLE classes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           text NOT NULL,
  kind            class_kind NOT NULL DEFAULT 'class',
  day_of_week     smallint CHECK (day_of_week BETWEEN 1 AND 7),  -- weekly repeat (1 = Monday)
  specific_date   date,                                          -- one-off entry (e.g. synced event)
  start_time      time NOT NULL,
  end_time        time NOT NULL,
  location        text,
  source          class_source NOT NULL DEFAULT 'manual',
  google_event_id text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time),
  CHECK (day_of_week IS NOT NULL OR specific_date IS NOT NULL),
  UNIQUE (user_id, google_event_id)
);

CREATE INDEX idx_classes_user_day ON classes (user_id, day_of_week);
CREATE INDEX idx_classes_user_date ON classes (user_id, specific_date);

-- Google Calendar API connection, one per student
CREATE TABLE calendar_connections (
  user_id            uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  google_calendar_id text NOT NULL,
  refresh_token_enc  text NOT NULL,   -- must be stored encrypted
  sync_token         text,
  last_synced_at     timestamptz
);

-- ---------------------------------------------------------------------
-- STEP 4: Task manager
-- ---------------------------------------------------------------------
CREATE TABLE tasks (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title             text NOT NULL,
  description       text,
  category          task_category NOT NULL,
  priority          task_priority NOT NULL DEFAULT 'medium',
  deadline          timestamptz NOT NULL,
  estimated_minutes integer NOT NULL CHECK (estimated_minutes > 0),
  status            task_status NOT NULL DEFAULT 'pending',
  completed_at      timestamptz,      -- set by Step 8 after photo proof is verified
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_user_deadline ON tasks (user_id, deadline);
CREATE INDEX idx_tasks_user_status   ON tasks (user_id, status);

-- ---------------------------------------------------------------------
-- STEP 5: Generated timetables
-- ---------------------------------------------------------------------
CREATE TABLE timetables (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  for_date     date NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  is_active    boolean NOT NULL DEFAULT true   -- older versions kept when regenerated
);

-- Only one active timetable per student per day
CREATE UNIQUE INDEX uq_timetables_active_per_day
  ON timetables (user_id, for_date) WHERE is_active;

CREATE TABLE timetable_entries (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_id      uuid NOT NULL REFERENCES timetables(id) ON DELETE CASCADE,
  kind              entry_kind NOT NULL,
  class_id          uuid REFERENCES classes(id) ON DELETE SET NULL,
  task_id           uuid REFERENCES tasks(id)   ON DELETE SET NULL,
  start_at          timestamptz NOT NULL,
  end_at            timestamptz NOT NULL,
  edited_by_student boolean NOT NULL DEFAULT false,  -- student edits survive regeneration
  CHECK (end_at > start_at),
  CHECK (
    (kind = 'class'      AND class_id IS NOT NULL AND task_id IS NULL) OR
    (kind = 'task_block' AND task_id  IS NOT NULL AND class_id IS NULL)
  )
);

CREATE INDEX idx_entries_timetable_start ON timetable_entries (timetable_id, start_at);
