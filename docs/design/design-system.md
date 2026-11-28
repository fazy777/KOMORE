# Komore: Design System

**Owner:** UI/UX Consistency (Student Wellness & Notifications)
**Status:** Draft v2 (uses the team's brown, cream and baby blue colour theme)

Every screen in Komore must follow these rules, so the app looks and feels like one product.

## 1. Design goals

- **Calm and clear:** students are busy and stressed, so screens should be simple and uncluttered.
- **Warm and friendly:** the app is strict about locks and proof, but its messages are kind and short.
- **Easy on a phone:** one hand, big buttons, short text.

## 2. Colours

The theme has three main colours.

| Role | Name | Hex | Where it is used |
|---|---|---|---|
| Brand 1 | Brown | `#3B2418` | Main text, main icons, dashboard, primary buttons |
| Brand 2 | Cream | `#F2E8DA` | Screen background |
| Brand 3 | Baby blue | `#8EC5FF` | Icons the user can tap, highlights |

**Supporting shades** (small helpers, so we do not add new colours):

| Role | Hex | Use |
|---|---|---|
| Cream light | `#FAF5EC` | Cards and dialogs (a lighter cream) |
| Cream border | `#D9CBB8` | Thin divider lines (decoration only) |
| Brown soft | `#6B5547` | Secondary text, hints, captions |
| Brown outline | `#8A7565` | Input borders and switch outlines |
| Success | `#256B2A` | Task done, proof verified |
| Warning | `#8A5A00` | Deadline soon |
| Error | `#B3261E` | Errors, proof rejected |

**Colour rules**

1. **Cream is the background** of every screen.
2. **Brown** is for text, main (non-tappable) icons, the dashboard, and main buttons.
3. **Baby blue** is only for things the user can tap, such as icon buttons. This way the student learns that blue means "tap me".
4. **Baby blue does not show up well on cream** (contrast is only 1.5 to 1). So a baby blue icon is never drawn as a thin line directly on cream. Use one of these two ways:
   - **On cream:** a baby blue filled circle (48 x 48) with a brown icon inside it.
   - **On a brown surface (like the dashboard):** a baby blue icon drawn directly on brown. This is easy to see (contrast 8 to 1).
5. Never use colour alone to show meaning. Add an icon or a word too.
6. Do not add new colours without asking the team.

### Contrast check (readability)

| Combination | Ratio | Result |
|---|---|---|
| Brown on cream | 11.9 to 1 | Excellent |
| Brown on cream light | 13.3 to 1 | Excellent |
| Cream on brown | 11.9 to 1 | Excellent |
| Baby blue on brown | 8.0 to 1 | Excellent |
| Brown on baby blue | 8.0 to 1 | Excellent |
| Brown soft on cream | 5.8 to 1 | Good |
| Brown outline on cream | 3.6 to 1 | OK for borders and icons |
| Baby blue on cream | 1.5 to 1 | Too low, do not use alone |

## 3. Typography

Use the phone's default font: **Roboto** on Android and **San Francisco** on iPhone. This needs no extra installation.

| Style | Size | Weight | Colour | Use |
|---|---|---|---|---|
| Title | 24 | Bold | Brown | Screen titles |
| Heading | 20 | Semi-bold | Brown | Section titles |
| Subheading | 16 | Semi-bold | Brown | Card titles |
| Body | 16 | Regular | Brown | Normal text |
| Caption | 12 | Regular | Brown soft | Hints, timestamps |
| Button | 16 | Semi-bold | Depends on button | Button labels |

Rules: never go below size 12. Left-align text. Keep lines short. Let the text grow if the student uses a larger font size on their phone. On the brown dashboard, text is cream.

## 4. Spacing and layout

- Use a **4-point grid**: spaces of 4, 8, 12, 16, 24 and 32.
- **Screen side margin:** 16.
- **Space between cards:** 12.
- **Card inner padding:** 16.
- **Corner radius:** 16 for cards and dialogs, 12 for buttons and inputs, fully round for icon circles.
- **Touch target:** every tappable item is at least 48 x 48.

**Standard screen structure**

1. Top bar with the screen title (and a back arrow when needed)
2. Content area that scrolls, on a cream background
3. Bottom navigation bar (main screens only)

**Dashboard (home screen):** the top part is a large brown card with cream text and baby blue tap icons. It shows today's progress, the current task and the focus session button.

**Suggested bottom tabs:** Home, Timetable, Tasks, Health, Profile. The bar is cream light. The selected tab has a brown icon and label, with a baby blue pill behind the icon. Other tabs have a brown soft icon and label.

## 5. Buttons

| Type | Look | Use |
|---|---|---|
| Primary | Brown fill, cream text | The main action on a screen (one per screen) |
| Secondary | Baby blue fill, brown text | Other actions |
| Outline | No fill, brown border and brown text | Less important actions |
| Text button | No border, brown text, underlined | Small actions like "Skip" |
| Destructive | Error red fill, cream text | Delete, cancel session |

- Height: 48. Corner radius: 12. Label: Button style.
- **On a brown dashboard card:** the primary button is baby blue with brown text.
- **Disabled:** cream border colour (`#D9CBB8`) fill and brown outline text. Not tappable.
- **Pressed:** slightly darker version of the same colour.
- Use short, action-based labels: "Start session", "Upload proof", "Snooze".

## 6. Inputs and controls

- **Text field:** cream light fill, brown outline border, 48 high, label above, error message in red below.
- **Switch:** on = brown track with a cream thumb; off = cream track with a brown outline.
- **Dropdown and time picker:** use the phone's standard pickers.
- **Slider or stepper:** brown track, baby blue thumb with a brown outline, with the value shown.

## 7. Cards, lists and icons

- **Card:** cream light, radius 16, thin cream border, no heavy shadow.
- **List item:** brown icon on the left, title and caption in the middle, a tap icon or arrow on the right.
- **Icons:** one set only, outline style, size 24 (use Material Symbols or Lucide).

| Icon kind | Look |
|---|---|
| Main or display icon (not tappable) | Brown line icon |
| Tap icon on cream | Baby blue circle (48) with a brown icon |
| Tap icon on brown | Baby blue icon on brown |

- **Empty states:** a simple brown icon, one short sentence, and one button. Example: "No tasks yet. Add your first task."

## 8. Notification style

All notifications (health reminders and others) follow this format:

| Part | Rule |
|---|---|
| Icon | The reminder type's icon in brown on baby blue |
| Title | Short, 3 to 5 words (for example "Rest your eyes") |
| Message | One short sentence, kind and clear |
| Buttons | Done, Snooze, Skip (health reminders) |
| Sound | Soft default sound; no sound during quiet hours |

**Health reminder icons.** The four reminders use the same colours and are told apart by their icon shape (and their title), not by extra colours:

| Reminder | Icon idea |
|---|---|
| Eye-rest | Eye |
| Stretch | Person stretching |
| Water | Water drop |
| Sleep | Moon |

**Notification channels** (so the student can control each one in phone settings): Eye-rest, Stretch, Water, Sleep, Tasks and deadlines.

**Tone:** friendly and short. Say "Drink some water" and not "You have failed to hydrate".

## 9. States and feedback

| Situation | What to show |
|---|---|
| Loading | A small brown spinner, or a cream border placeholder block |
| Success | Green check icon and a short message (a "toast" at the bottom for 3 seconds) |
| Error | Red icon and a message that says what to do next |
| Locked apps | Brown banner with a lock icon and cream text: "Apps are locked until your task is done" |
| Proof pending or rejected | Cream light banner with an amber or red icon, the reason, and a "Try again" button |

## 10. Accessibility

- Normal text contrast must be at least 4.5 to 1, and icons and borders at least 3 to 1 (see the table in section 2).
- Every icon button has a text label or an accessibility label.
- Do not use colour alone to show a state.
- Support the phone's larger-text setting.
- Animations are short and gentle, and nothing flashes.

## 11. Naming rules for design files

- Screens: `screen-name` in lowercase with dashes (for example `notification-settings`).
- Files: `wireframe-notification-settings.png`, `wireframe-sleep-alert.png`.
- Components: `button-primary`, `card-task`, `banner-locked`.
