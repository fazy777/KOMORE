# Komore SRS: Health Reminders and Notifications

**Section owner:** Student Wellness & Notifications
**Related files:** `reminder-rules.md`, `design-system.md`
**Status:** Draft v1

## 1. Introduction

### 1.1 Purpose
This section lists what the Health Reminders and Notifications feature of Komore must do. It covers eye-rest, stretch, water and sleep reminders, the student's notification settings, and the record of reminders.

### 1.2 Scope
The feature sends local notifications on the student's phone. Eye-rest, stretch and water reminders appear during an active focus session. Sleep reminders are calculated from the first class on tomorrow's timetable.

**Not included:** medical advice, health data from wearables, and reminders sent from a server.

### 1.3 Definitions

| Term | Meaning |
|---|---|
| Local notification | A notification created by the app on the phone itself. It works without internet. |
| Focus session | A timed work session on one task |
| Reminder | One notification shown to the student |
| Interval | The time between two reminders of the same type |
| Quiet hours | A time range in which session reminders are not shown |
| Snooze | Delay a reminder for a short time |

## 2. Overall description

### 2.1 Users
- **Student:** the only user of this feature. The student receives reminders and changes the settings.

### 2.2 Connection to other features

| Feature | What this feature needs from it |
|---|---|
| Focus Session | Events when a session starts, pauses, resumes and ends, and the session length |
| Timetable | The start time of tomorrow's first class, and a signal when that time changes |
| Onboarding and Profile | Student type (day scholar or hostel) for the default commute time |
| App Lock and Photo Proof | None. Reminders never lock or unlock apps. |

### 2.3 Assumptions
- The student gives permission for notifications.
- The phone clock and time zone are correct.
- Notification rules follow `reminder-rules.md`.

## 3. User stories

| ID | Story |
|---|---|
| US-01 | As a student, I want an eye-rest reminder during long study sessions so that my eyes do not get tired. |
| US-02 | As a student, I want a stretch reminder so that I do not sit for too long. |
| US-03 | As a student, I want a water reminder so that I remember to drink water while I study. |
| US-04 | As a student, I want a sleep reminder based on my first class tomorrow so that I get enough sleep. |
| US-05 | As a student, I want to choose which reminders I get and how often, so that they do not annoy me. |
| US-06 | As a student, I want to snooze or skip a reminder so that I can finish my thought first. |
| US-07 | As a student, I want to see my past reminders so that I can see my healthy habits. |

## 4. Functional requirements

Priority: **High** = must have, **Medium** = should have.

### 4.1 Permission and setup

| ID | Requirement | Priority |
|---|---|---|
| FR-HN-01 | The system shall ask the student for notification permission during onboarding. | High |
| FR-HN-02 | If permission is refused, the system shall show a banner saying that reminders are off, with a button that opens the phone settings. | High |
| FR-HN-03 | The system shall create a default set of settings for each new student (see section 4.6). | High |

### 4.2 Session reminders (eye-rest, stretch, water)

| ID | Requirement | Priority |
|---|---|---|
| FR-HN-04 | The system shall send eye-rest, stretch and water reminders only while a focus session is active. | High |
| FR-HN-05 | The system shall start counting each interval from the start of the focus session. | High |
| FR-HN-06 | The system shall pause the interval timers when the session is paused and continue them when it resumes. | High |
| FR-HN-07 | The system shall stop all session reminders when the session ends or is cancelled. | High |
| FR-HN-08 | The system shall not send a reminder if the session is shorter than that reminder's interval. | Medium |
| FR-HN-09 | The system shall not send a reminder when less than 2 minutes remain in the session. | Medium |
| FR-HN-10 | If two reminders are due within 5 minutes of each other, the system shall combine them into one notification. | Medium |
| FR-HN-11 | The system shall not send a session reminder of a type that the student turned off. | High |
| FR-HN-12 | The system shall not send session reminders during the student's quiet hours. | Medium |
| FR-HN-13 | Reminders shall work in the background, including when the app is closed or the phone is locked. | High |
| FR-HN-14 | Reminders shall not lock or unlock any app. | High |

### 4.3 Sleep reminders

| ID | Requirement | Priority |
|---|---|---|
| FR-HN-15 | The system shall calculate the wake-up time as the first class start time minus the morning prep time and the commute time. | High |
| FR-HN-16 | The system shall calculate the bedtime as the wake-up time minus the sleep hours needed. | High |
| FR-HN-17 | The system shall send the sleep reminder before the bedtime by the chosen lead time (default 30 minutes). | High |
| FR-HN-18 | The system shall calculate the next day's sleep reminder every evening at 6:00 pm (default). | High |
| FR-HN-19 | The system shall calculate the sleep reminder again immediately when tomorrow's first class changes, is added or is removed. | High |
| FR-HN-20 | If there is no class tomorrow, or no timetable, the system shall use a default bedtime of 11:00 pm. | High |
| FR-HN-21 | If the calculated reminder time has already passed, the system shall send the reminder within 5 minutes. | Medium |
| FR-HN-22 | The system shall use the commute time from the student type chosen at onboarding (day scholar 45 minutes, hostel 15 minutes) unless the student changes it. | Medium |
| FR-HN-23 | Quiet hours shall not block the sleep reminder. | Medium |

### 4.4 Responding to a reminder

| ID | Requirement | Priority |
|---|---|---|
| FR-HN-24 | Each reminder shall show the buttons Done, Snooze and Skip. | High |
| FR-HN-25 | When the student taps Snooze, the system shall show the reminder again after 5 minutes, at most 2 times. | Medium |
| FR-HN-26 | If the student does not respond within 10 minutes, the system shall mark the reminder as ignored. | Medium |
| FR-HN-27 | The notification shall show an icon, a short title and one short sentence, following the notification style in `design-system.md`. | High |

### 4.5 Reminder log

| ID | Requirement | Priority |
|---|---|---|
| FR-HN-28 | The system shall save a log entry for every reminder that is shown. | High |
| FR-HN-29 | Each log entry shall store the reminder type, the focus session (if any), the time sent, the response (done, snoozed, skipped or ignored) and the response time. | High |
| FR-HN-30 | The student shall be able to open a history screen that lists past reminders, newest first. | Medium |
| FR-HN-31 | The history screen shall show a simple summary, for example how many water reminders were marked done this week. | Medium |

### 4.6 Notification preferences

| ID | Requirement | Priority |
|---|---|---|
| FR-HN-32 | The student shall be able to switch each reminder type (eye-rest, stretch, water, sleep) on or off. | High |
| FR-HN-33 | The student shall be able to change the interval for eye-rest, stretch and water reminders within the allowed range. | High |
| FR-HN-34 | The student shall be able to set the sleep hours needed, the morning prep time, the commute time and the sleep reminder lead time. | High |
| FR-HN-35 | The student shall be able to set quiet hours. | Medium |
| FR-HN-36 | The system shall save the settings and apply a change to the next reminder that is scheduled. | High |
| FR-HN-37 | The system shall check that each setting is inside its allowed range and show a clear message if it is not. | Medium |

**Default settings and allowed ranges**

| Setting | Default | Allowed range |
|---|---|---|
| Eye-rest interval | 20 minutes | 15 to 60 minutes |
| Stretch interval | 45 minutes | 30 to 90 minutes |
| Water interval | 45 minutes | 30 to 90 minutes |
| Sleep hours needed | 8 hours | 5 to 10 hours |
| Morning prep time | 60 minutes | 15 to 120 minutes |
| Sleep reminder lead time | 30 minutes | 10 to 60 minutes |
| Quiet hours | Off | Any start and end time |

### 4.7 Phone and system events

| ID | Requirement | Priority |
|---|---|---|
| FR-HN-38 | After the phone restarts, the system shall schedule the sleep reminder again. | High |
| FR-HN-39 | If the phone's time zone or clock changes, the system shall calculate the sleep reminder again. | Medium |
| FR-HN-40 | If the phone limits background work, the system shall show a one-time tip that asks the student to allow Komore to run in the background. | Medium |

## 5. Non-functional requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-HN-01 | Performance | A reminder shall appear within 30 seconds of its scheduled time. |
| NFR-HN-02 | Offline use | All reminders shall work without an internet connection. |
| NFR-HN-03 | Battery | The reminder system shall use the phone's own scheduling tools and shall not keep the app running all the time. |
| NFR-HN-04 | Reliability | No reminder shall be sent twice for the same schedule, and no reminder shall be lost after a restart. |
| NFR-HN-05 | Usability | The student shall be able to reach the notification settings in no more than 3 taps from the home screen. |
| NFR-HN-06 | Usability | Notification text shall be short, friendly and written in simple words. |
| NFR-HN-07 | Accessibility | All screens in this feature shall follow the accessibility rules in `design-system.md` (contrast, text size, labels). |
| NFR-HN-08 | Privacy | Reminder logs and settings shall belong to the student only, and shall not be shown to other users. |
| NFR-HN-09 | Compatibility | The feature shall work on the same Android and iOS versions as the rest of Komore. |
| NFR-HN-10 | Consistency | All screens shall follow the colours, fonts and buttons in `design-system.md`. |

## 6. User interface requirements

| Screen | Purpose |
|---|---|
| Notification Preferences | Switches, intervals, sleep settings and quiet hours (FR-HN-32 to FR-HN-35) |
| Reminder notification | The pop-up with Done, Snooze and Skip (FR-HN-24 to FR-HN-27) |
| Sleep Alert | Shows tomorrow's first class and the suggested bedtime |
| Reminder History | Past reminders and a weekly summary (FR-HN-30, FR-HN-31) |
| Permission banner | Shown when notifications are off (FR-HN-02) |

The wireframes for these screens are in the Design Document.

## 7. Data requirements

The feature stores three kinds of data. The table designs are in the Design Document.

| Data | What it holds |
|---|---|
| Health Alert | The type of reminder, its interval, trigger time and whether it is on |
| Reminder Log | Each reminder shown and the student's response |
| Notification Preference | The student's switches, sleep hours, prep time, commute time and quiet hours |

## 8. Acceptance criteria

| Requirement | How to test it |
|---|---|
| FR-HN-04, FR-HN-05 | Start a 30-minute session with a 20-minute eye-rest interval. One reminder appears after 20 minutes. No reminder appears when no session is active. |
| FR-HN-06 | Pause the session for 10 minutes. The next reminder is delayed by 10 minutes. |
| FR-HN-10 | Set stretch and water to the same interval. Only one combined notification appears. |
| FR-HN-15 to FR-HN-17 | First class at 8:00 am, 60 minutes prep, 45 minutes commute, 8 hours sleep, 30 minutes lead. The sleep reminder appears at 9:45 pm. |
| FR-HN-19 | Move tomorrow's first class from 8:00 am to 10:00 am. The sleep reminder time changes to 11:45 pm. |
| FR-HN-20 | Remove all classes for tomorrow. The default bedtime of 11:00 pm is used. |
| FR-HN-25 | Tap Snooze three times. The reminder returns twice and then stops. |
| FR-HN-28, FR-HN-29 | After a reminder is answered, a log entry exists with the correct type and response. |
| FR-HN-38 | Restart the phone. The sleep reminder is still scheduled. |
| NFR-HN-02 | Turn on airplane mode. Reminders still appear. |
