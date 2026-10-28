# StudyConnect integration audit

Audited on 28 October 2026. This supersedes the preliminary audit. Source inspection covers the frontend, backend controllers, DTOs, services, and the product requirements, personas, user flows, and MVP documents. Product documents describe several capabilities that the current backend does not implement.

## Defects fixed

- `App.jsx` referenced undefined `authChecked`, `user`, `setUser`, and `clearToken`. It now owns one authenticated user, waits for session checking, and distinguishes network failures from expired authentication. Failed session checks can be retried without discarding a valid token. Login and OTP callbacks retain the returned user. Logout clears the token and user; other tabs react to token changes.
- `Auth.js` appended `/api/v1` even when the configured URL already included it, sent an unsupported `name` during registration, and sent a forbidden extra `otp` field. Both API clients now share URL normalization and request handling, preserving the existing exported helpers and token key.
- OTP verification mutated a user in memory but persisted only `role`. `/auth/me` still returned `isVerified=false`, and the next login failed. Verification now persists through an internal `UsersService.verifyEmail` operation before issuing the token. The public profile DTO still cannot set verification. Regression tests cover persistence, sequencing, and invalid OTPs. Live signup, reload, and subsequent login validate the fix.
- Dashboard session clicks previously navigated without selecting the session. ID-based hash routes now retrieve the exact session and survive reload/back navigation. Legacy view names remain aliases.
- Fake tutors, sessions, activities, chat, ratings, files, unread badges, and simulated booking success were removed. Null backend course arrays are handled safely.
- Material sharing previously selected a local file but saved only URL metadata through browser prompts. It now explicitly requests a hosted URL and a real course; it does not imply binary upload support.

## Current integration

| Feature | Backend contract and frontend behavior |
| --- | --- |
| Account access | Register, OTP verify/resend, login, current user, and password recovery retain existing endpoints. Required fields, code/password validation, pending states, and server feedback are visible. Returning unverified users can continue verification after a rejected login. |
| Tutor discovery | Fetches TUTOR and BOTH profiles; searches name/department/course and filters by returned department/course values. Profile details and reviews come from user/review APIs. No fabricated availability, ratings, or recommendations. |
| Learner discovery | Uses the learner directory endpoint. No unsupported invitation action is presented. |
| Booking | Posts real tutor/course UUIDs, future ISO timestamp, duration, goal, mode, and venue/link to `/tutoring/book`. Group capacity appears only for group sessions. Success opens the created session. |
| Sessions | Fetches own sessions, exact details, and open groups. Supports joining groups, role-appropriate confirm/complete/cancel actions, history, meeting links, and completed-session reviews. Errors remain visible. |
| Study partners | Calls matching/history/reshuffle APIs. Explains that a match is immediate and reshuffling can end the old match without finding a new one. Shows actual profile course overlap when present, rather than claiming an algorithmic compatibility score. |
| Materials | Loads actual metadata, searches/filters it, shares hosted links, records access, and exposes the returned HTTP(S) URL. |
| Profile | Saves validated academic/profile fields and teaching/learning course arrays through the profile PATCH endpoint. Verification is read-only in the UI. |
| Theme | Light/dark preference is stored under the existing localStorage key. Local Inter font avoids remote font dependencies. |
| Notifications | Uses real notification list/unread count and read/read-all endpoints. Unknown/failed counts are not replaced with invented numbers. |
| Messages | Honest unavailable state, including the legacy session-chat destination; there is no chat endpoint. |

## Design and accessibility

Midnight navy, indigo, lavender, white surfaces, slate background, and a green success accent form a shared token system. Inter is self-hosted with its license. Primary body/form/navigation text is 14–16px; smaller type is reserved for supporting labels and metadata. Cards use 12–16px radii, restrained shadows, and responsive spacing. The original campus photograph remains on account access screens.

Navigation is grouped into Overview, Discover, Learning, Communication, and Account. Desktop uses a fixed sidebar. The mobile drawer uses native dialog focus trapping, Escape/backdrop/close controls, focus return, and body scroll locking. Booking and material dialogs use the same primitive. Focus styles, a skip link, semantic forms, reduced motion, and status/error announcements are shared. Safety is a compact, expandable checklist after dashboard tasks and alongside booking/partner workflows.

## Backend limitations kept explicit

- No chat, attachment transport, invitation acceptance/decline, availability timetable, schedule-overlap scoring, notification preferences, or attendance-verification API.
- Partner candidate selection now requires an active, verified peer with the exact requested course in their teaching or learning profile, excluding active matches and the previous partner on reshuffle. Meeting format and schedule compatibility are still not enforced, and the UI states that limitation.
- Institutional email restrictions and campus scoping described in the PRD are not enforced by the current registration/directory implementation. Email verification is labeled as email verification, not institutional identity verification.
- Material endpoints store hosted-file metadata, not uploaded binary files. Externally hosted resource availability remains the provider's responsibility.
- Backend notification APIs work with stored notifications, but inspected booking/matching services do not automatically create notifications for every event. Empty activity is therefore legitimate.
- Session topology follows the implemented backend: one tutor with one or multiple learners. It does not pretend to implement the different multi-tutor model described in some product documents.
- Local development uses console OTP delivery; real email delivery requires configured Resend credentials and was not exercised.

## Validation

Run `npm test` and `npm run build` in `frontend`. The frontend tests use Node's built-in test runner and add no dependency. Run `pnpm run build`, `pnpm test`, and `pnpm run test:e2e --runInBand` in `backend`.

Browser validation uses system Chromium with Playwright against the actual local PostgreSQL/Nest/Vite services and isolated, clearly named QA records. Error, loading, and expiry checks deliberately intercept responses only in the browser test; application code contains no mock API layer. Tests inspect real persistence and exact session IDs. Responsive checks cover all ten main screens at 320, 375, 768, 1024, and 1440px. Screenshots show test accounts and test sessions, not production activity. Automatic accessibility checks supplement keyboard tests and do not establish complete WCAG conformance.
