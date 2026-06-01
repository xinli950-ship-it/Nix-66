# Production Switch Checklist: Mock/Team-DB to Turso

This checklist ensures a smooth transition from the development/mock database to the production Turso database.

## Phase 1: Database Provisioning
- [x] Create a new database in the [Turso Dashboard](https://turso.tech/).
- [x] Copy the **Database URL**: `libsql://noxa-loanis7.aws-us-east-2.turso.io`
- [x] Generate and copy a **Full Access Token**.

## Phase 2: Schema Initialization
- [x] Open the Turso SQL Shell or Dashboard Query Editor.
- [x] Run the creation script for the `matches` table (DONE).
- [x] Run the creation script for the `suggestions` table (DONE).
- [x] Verify tables exist: `SELECT name FROM sqlite_master WHERE type='table';` (VERIFIED).

## Phase 3: Configuration Update
- [ ] **Vercel/Hosting Provider**: Add the following Environment Variables:
    - `TURSO_DATABASE_URL`: Your copied URL.
    - `TURSO_AUTH_TOKEN`: Your copied token.
- [ ] **Optional**: If you want to disable mock videos at the same time, set `USE_MOCK_VIDEO=false`.
- [ ] Trigger a redeploy or restart the production server to pick up the new variables.

## Phase 4: Validation
- [ ] **Health Check**: Visit the home page and ensure it loads without errors.
- [ ] **Suggestion Test**: Use the "Suggest a Character" feature.
    - [ ] Check the Turso Dashboard to see if a row was added to the `suggestions` table.
- [ ] **Match Initiation**: Start a new match generation.
    - [ ] Check if a row is created in the `matches` table with status `submitted` or `processing`.
- [ ] **Status Polling**: Ensure the match result page polls correctly and doesn't crash.
- [ ] **Completion**: Once Kling AI finishes (real or mock), verify the `video_url` and `status` are updated in Turso.

## Phase 5: Cleanup
- [ ] (Optional) Export any valuable data from the team-db or mock logs if needed.
- [ ] Monitor logs for any "Turso query error" messages.
