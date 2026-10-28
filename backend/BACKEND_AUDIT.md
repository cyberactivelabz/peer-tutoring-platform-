# Backend and database audit — 28 October 2026

This update fixes confirmed defects in existing workflows. It does not deploy changes or change the production database. Public endpoint URLs remain unchanged; invalid or unauthorized operations now fail explicitly.

## Findings and fixes

| Finding | Resulting behavior |
| --- | --- |
| Public registration and profile updates accepted `ADMIN` | DTOs accept student roles only, and the service checks again before writing. Existing admins are not removed or demoted. Profile saves omit unchanged roles. |
| A password-reset JWT could authenticate ordinary API requests | New access tokens have an `ACCESS` purpose. Reset/other-purpose tokens are rejected by the API guard. Existing access tokens without a purpose still work for active, verified users. Deleted/inactive/unverified users receive 401. |
| Production could start with a known development JWT signing secret | Production startup now requires a private, non-example JWT secret of at least 32 characters. Signing and verification use the same required configuration. Local development still has its existing fallback. |
| A caller could retrieve another student's private session by UUID | The assigned tutor and participants can retrieve private details. Authenticated users can still discover and view future open group sessions. |
| Booking inserted a session and its first participant in separate commits | Both writes now happen in one transaction; a participant failure rolls back the session. |
| Simultaneous joins could overfill a group or create duplicate participation | A PostgreSQL row lock serializes joins and checks the latest membership/capacity. A unique `(sessionId, learnerId)` index adds database protection. Past, closed, full, and already-joined sessions reject new joins. |
| Status requests could skip confirmation or reopen terminal sessions | The locked transition path enforces scheduled → confirmed → completed, with cancellation available before completion. Only tutors confirm/complete; participants can cancel. Terminal sessions cannot reopen. |
| Booking accepted non-tutors, past times, or an unrelated course/topic | The backend requires an active, verified tutor with the exact course in their teaching profile, a future timestamp, and a topic belonging to that course when supplied. The frontend offers only matching catalog courses. |
| Partner selection ignored course and activity status | Candidates must be active, verified, non-admin peers with the exact normalized course in their teaching/learning profile. Partial codes do not match. Reshuffling excludes the previous peer. Meeting format and timetable matching remain unsupported and are stated in the UI. |
| Concurrent reviews could duplicate a review or leave incorrect tutor aggregates | Review creation and aggregate updates share a transaction with a tutor row lock. The database also enforces one review per session/learner. Duplicates return a client error. |
| `DB_SYNCHRONIZE=false` was ignored outside production | Explicit false now disables synchronization in both the application and CLI configuration. Production remains opt-in by default. |
| Unhandled database errors could expose internal messages in HTTP responses | Unexpected 500 responses use a generic message; actionable validation errors remain visible. |
| Course arrays accepted non-string members | Public user DTOs validate string entries and cap each course array at 50 items. |

## Database migration and deployment

The new migration adds unique indexes to `session_participants` and `reviews`. It first checks for duplicate session/learner pairs and stops if they exist. It never deletes or merges existing records. An operator must review any reported duplicates before rerunning it. The down migration removes only these two indexes.

Before deploying this backend on Render:

1. Keep a recoverable database backup using your database provider's normal procedure.
2. Set `NODE_ENV=production`, `DB_SYNCHRONIZE=false`, and a private random `JWT_SECRET` of at least 32 characters in backend environment settings. Do not copy the old example signing secret. If rotating an existing key, current users will need to sign in again.
3. Build the backend with `npm run build`.
4. Use `npm run migration:show:prod` to inspect migration state, then run `npm run migration:run:prod` against the intended backend database.
5. Start with `npm run start:prod` and validate health, login, course discovery, booking, and session status actions.

If the Render service supports a pre-deploy command, use `npm run migration:run:prod`. Otherwise a start command of `npm run migration:run:prod && npm run start:prod` applies pending migrations before starting the app. Migration execution is idempotent. Do not bypass a duplicate-data failure or turn synchronization back on to get past it.

These are incremental migrations for the existing application schema, not a full empty-database baseline. Local integration tests explicitly bootstrap a disposable schema. A full production baseline migration is still a separate database task.

## Verification

- `pnpm run build` compiles the backend.
- `pnpm test` runs unit regressions for authorization, validation, lifecycle rules, and configuration.
- `pnpm run test:e2e --runInBand` runs the existing HTTP health test.
- `pnpm run test:integration` builds the backend and runs real PostgreSQL/HTTP integration checks. It refuses remote database hosts, creates a uniquely named `qa_integrity_*` database, and removes it afterwards. The local database user needs permission to create/drop this disposable database. No existing development or production tables are cleared.
- In `frontend`, run `npm test` and `npm run build` for the small compatibility changes.

Integration scenarios cover administrator-role injection, reset-token misuse, unverified accounts, booking rollback, private-session access, role/state transitions, competing joins, duplicate joins, course matching, excluded/inactive peers, concurrent ratings, duplicate reviews, and migration preflight/idempotence. Test requests use the application's actual guards, DTO validation, services, repositories, and PostgreSQL locks.

Completed validation: backend build; 68 unit tests across 15 suites; 10 PostgreSQL/HTTP integration tests; the existing HTTP health test; frontend build and 9 frontend regression tests. All passed. Dependency lockfiles remain unchanged.

## Remaining work

This is the first backend/database repair tranche. The product still needs chat/attachments, explicit timetable storage and matching, connection approvals, and binary file storage. Notification creation is not yet wired to every domain event. Further audit work should cover profile field minimization, password-reset token single-use/revocation, case-insensitive database email uniqueness for legacy data, scheduling conflicts, and a full initial-schema migration. No claim of complete production hardening is made.
