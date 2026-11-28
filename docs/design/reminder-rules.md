# Komore: Health Reminder Rules

**Owner:** Student Wellness & Notifications
**Status:** Draft v1 (values marked "default" can be changed by the team)

## 1. Purpose

Komore keeps students healthy while they study. It sends four kinds of reminders:

| Type | When it appears |
|---|---|
| Eye-rest | During an active focus session |
| Stretch | During an active focus session |
| Water | During an active focus session |
| Sleep | In the evening, based on tomorrow's first class |

All reminders are **local notifications**. They are created on the phone itself, so they work in the background and without internet.

## 2. Default settings

The student can change all of these in Notification Preferences.

| Setting | Default | Allowed range |
|---|---|---|
| Eye-rest interval | every 20 minutes | 15 to 60 minutes |
| Stretch interval | every 45 minutes | 30 to 90 minutes |
| Water interval | every 45 minutes | 30 to 90 minutes |
| Sleep hours needed | 8 hours | 5 to 10 hours |
| Morning prep time | 60 minutes | 15 to 120 minutes |
| Commute time | from onboarding (see section 5) | 0 to 120 minutes |
| Sleep alert lead time | 30 minutes before bedtime | 10 to 60 minutes |
| Quiet hours (session reminders) | off | any start and end time |
| Each reminder type | on | on or off |

## 3. Rules for session reminders (eye-rest, stretch, water)

1. **Only during an active session.** Reminders start when a focus session starts and stop when it ends.
2. **Timer counts from the session start.** For example, with a 20-minute eye-rest interval, the first reminder appears 20 minutes after the session begins.
3. **Pause with the session.** If the student pauses the session, the reminder timers pause too, and they continue when the session resumes.
4. **Skip short sessions.** If a session is shorter than the interval, that reminder does not appear.
5. **No reminder near the end.** If less than 2 minutes remain in the session, do not send a reminder.
6. **Combine close reminders.** If two reminders are due within 5 minutes of each other, show one notification that includes both (for example, "Stretch and drink water").
7. **Respect preferences.** If the student turned off a reminder type, or the time is inside quiet hours, do not send it.
8. **Do not block the lock.** A reminder never unlocks apps. It only reminds. Apps stay locked until the task is completed with photo proof.

### Message examples

| Type | Message |
|---|---|
| Eye-rest | "Rest your eyes. Look at something far away for 20 seconds." |
| Stretch | "Time to stretch. Stand up and move for 2 minutes." |
| Water | "Drink some water." |
| Sleep | "Time to wind down. Your bedtime is 10:15 pm." |

## 4. What the student can do with a reminder

Each reminder has three buttons:

| Button | What happens |
|---|---|
| Done | Reminder is closed and marked "done". |
| Snooze | Reminder comes back after 5 minutes. A reminder can be snoozed at most 2 times. |
| Skip | Reminder is closed and marked "skipped". |

If the student does nothing for 10 minutes, the reminder is marked "ignored".

Every reminder is saved in the Reminder Log with: which alert, which session (if any), time sent, response (done, snoozed, skipped, ignored), and time of response.

## 5. Rules for the sleep alert

The sleep alert depends on **tomorrow's first class** in the timetable.

**Formula**

1. Wake-up time = first class start time − morning prep time − commute time
2. Bedtime = wake-up time − sleep hours needed
3. Alert time = bedtime − alert lead time

**Commute time default** (taken from the student type chosen at onboarding):

| Student type | Default commute |
|---|---|
| Day scholar | 45 minutes |
| Hostel student | 15 minutes |

**Example**

- First class tomorrow: 8:00 am
- Prep time: 60 minutes, commute: 45 minutes (day scholar), sleep needed: 8 hours
- Wake-up time = 8:00 − 1:45 = 6:15 am
- Bedtime = 6:15 am − 8 hours = 10:15 pm
- Alert time = 10:15 pm − 30 minutes = 9:45 pm

**When to calculate**

- Every evening at 6:00 pm (default), for the next day.
- Again right away whenever the timetable changes (a class is added, moved or removed).

**Special cases**

| Case | What the app does |
|---|---|
| No class tomorrow | Use the default bedtime of 11:00 pm. |
| Student has no timetable yet | Use the default bedtime of 11:00 pm. |
| Calculated alert time has already passed | Send the alert in the next 5 minutes. |
| Sleep alert is off in preferences | Do not send it. |

Quiet hours do not block the sleep alert.

## 6. Phone and system rules

- **Permission:** the app asks for notification permission at onboarding. If the student refuses, show a banner in the app saying that reminders are off, with a button to open settings.
- **Phone restart:** after the phone restarts, the app schedules the sleep alert again. Session reminders start again with the next session.
- **Battery saver:** if the phone limits background work, show a one-time tip asking the student to allow Komore to run in the background.
- **Time zone and clock changes:** use the phone's local time. Recalculate the sleep alert if the time zone changes.

## 7. What the database must store (for Step 6)

- The reminder types and their intervals (Health Alert)
- Each reminder sent and how the student responded (Reminder Log)
- The student's settings: on/off switches, sleep hours, prep time, quiet hours (Notification Preference)


