# Komore: Steps 3, 4, 5 (Scheduling & AI Timetable Engine), backend logic

Author: Shifa Fatima. Suggested branches: `class-schedule`, `task-manager`, `timetable-maker`.
Per the team plan, this is backend logic only (no screens). Screens come after all features are merged and the tests pass.

## Classes to merge (one entry point per feature)

| Class | File | Feature |
|---|---|---|
| `ClassScheduleService` | `src/features/classes/ClassScheduleService.ts` | Step 3: list, get, save (add/edit), remove classes, sync from Google Calendar |
| `TaskManagerService` | `src/features/tasks/TaskManagerService.ts` | Step 4: create, update, remove, get, list tasks, setStatus, markCompleted |
| `TimetableManager` | `src/features/timetable/TimetableManager.ts` | Step 5: generate a day's timetable, getForDate, moveBlock, removeBlock |

Every function has a comment explaining what it does, its inputs and what it returns.

## Other files

| Path | Purpose |
|---|---|
| `src/types/schedule.ts`, `src/types/profile.ts` | Types for classes, tasks, timetables, and what Step 5 needs from the onboarding profile |
| `src/features/*/classService.ts`, `taskService.ts`, `timetableService.ts` | The logic the classes above call |
| `src/services/scheduler.ts` | Step 5 core: fixed classes first, then urgent tasks into free gaps (pure functions) |
| `src/services/googleCalendar.ts` | Step 3: maps Google events to fixed classes and merges without duplicates |
| `src/services/profileProvider.ts` | The only place to connect to Step 2 |
| `src/services/timeUtils.ts`, `ids.ts`, `classRules.ts` | Shared helpers |
| `src/storage/` | AsyncStorage repositories (data stays on the phone for now) |
| `database/001_classes_tasks_timetables.sql` | PostgreSQL schema (target for the backend later) |
| `docs/komore_wireframes_steps_3_5.html` | Wireframes (design deliverable) |
| `__tests__/` | Jest tests (54 tests) |

## How other steps connect

1. **Step 2 (onboarding):** `defaultProfileProvider` in `src/services/profileProvider.ts` returns defaults
   (day scholar, bedtime 23:00, no travel). When `on-boarding` is merged, change that one function to read the
   real profile and map it to `ScheduleProfile`. Tests use a fake provider, so they do not depend on Step 2.
   `new TimetableManager({ profileProvider })` accepts any provider.
2. **Step 6 (focus session):** `new TaskManagerService().setStatus(taskId, 'in_progress')`.
3. **Step 8 (photo proof):** `new TaskManagerService().markCompleted(taskId)` after the photo is verified.
4. **Step 10 (activity log):** reads tasks with `list({ status: 'completed' })` (has `completedAt`).
5. **Backend later:** replace `src/storage/repository.ts` with API calls. The services stay the same.

## Scheduling rules (Step 5)

1. Fixed classes for the day are placed first and never move.
2. Free time = day start (08:00) to bedtime minus 60 minutes, minus travel time before the first class and after the last class (only on days with classes).
3. Tasks (pending or scheduled, due within 7 days or overdue) are sorted by nearest deadline, then priority, then category.
4. Each task goes into the first gap that holds it whole. If none does, it is split across gaps (blocks of at least 25 minutes). Whatever does not fit is listed as unplaced.
5. A task due today is only placed before its deadline time. When planning today, nothing is placed in the past.
6. Blocks the student moved by hand are kept when the timetable is regenerated.

## Run the tests

```bash
npm test
npm run lint
```
