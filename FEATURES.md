# GiveCircle — FEATURES.md
# Complete Feature Specification for Codex Implementation
# Synthesized from: user-flow.md · CDP_FEATURES_V2.md · tech-stack.md · AGENTS.md · codex-prompt.md
# Last updated: April 2026

---

> **Purpose of this file:** This is the single source of truth for every feature in GiveCircle.
> Codex must read this file in full before generating any component, endpoint, service, or migration.
> Features are listed per role, per phase, with backend contracts, frontend specs, security requirements,
> and acceptance criteria. Do not implement features in a different order than the phases defined in AGENTS.md.

---

## Roles Overview

| Role | Description | Primary Identifier |
|------|-------------|-------------------|
| **Donor** | Individual who lists items for donation | Email or phone |
| **Recipient** | Individual who requests donated items | Phone (email optional) |
| **NGO** | Verified organisation that requests in bulk and coordinates drives | Email + org docs |
| **Admin** | Platform operator — manually created, no public registration | Email |

---

## Section 1 — Shared Features (All Roles After Login)

### S1 — Auth & Authorization

**Scope:** Registration, login, OTP verification, JWT lifecycle, role guards.

#### Backend
- `POST /auth/register/donor` — accepts `name, email|phone, password, city, pincode, neighbourhood, language_pref`
- `POST /auth/register/recipient` — accepts `name, phone, city, pincode, neighbourhood, language_pref, needs_description (optional)`
- `POST /auth/register/ngo` — accepts `org_name, contact_person, phone, email, city, service_area_radius, doc_urls[]`, sets `verification_status = pending`
- `POST /auth/login` — email/phone + password → access token + refresh token
- `POST /auth/otp/send` — triggers Twilio Verify to phone number
- `POST /auth/otp/verify` — verifies OTP code, marks `phone_verified = true`
- `POST /auth/refresh` — validates refresh token against Redis blocklist, issues new access token
- `POST /auth/logout` — adds refresh token JTI to Redis blocklist key `blocklist:{jti}`

#### Token Lifecycle
- Access token: 15-minute expiry, signed with `SECRET_KEY` via `python-jose`
- Refresh token: 7-day expiry, JTI stored in Redis on issue, checked and invalidated on use
- Role field embedded in JWT claims; role guards enforce via FastAPI `Depends()`

#### Role Guards (in `app/core/security.py`)
- `get_current_user` — decodes JWT, loads user from DB, raises 401 if invalid/expired
- `require_donor`, `require_recipient`, `require_ngo`, `require_admin` — compose on `get_current_user`, raise 403 if role mismatch

#### Security Requirements
- Passwords hashed with `passlib[bcrypt]`, never stored in plaintext
- OTP rate-limited: **max 5 attempts per phone number per 15 minutes** via `slowapi`
- Never log JWT tokens, passwords, or OTP codes — enforce in logging config
- All OTP codes expire after Twilio Verify's default window (10 minutes)
- Refresh token blocklist checked on every `/auth/refresh` call before issuing new access token
- Input validation: Pydantic v2 validators strip HTML, enforce max lengths, validate phone format `+91XXXXXXXXXX`

#### Frontend
- `/register` — role selector page: three `surface-1` cards (Donor / Recipient / NGO), lime-400 active border, sentence case labels
- `/register/donor`, `/register/recipient`, `/register/ngo` — per-role multi-step forms using React Hook Form + Zod
- `/register/verify` — OTP entry step, 6-digit input, resend button (disabled for 60s after send)
- `/login` — email/phone + password. Links to forgot-password flow
- On successful login → redirect to role-appropriate dashboard

#### Tests
- `tests/test_auth_service.py`: register all four roles, login, OTP send/verify, token refresh, blocklist enforcement, duplicate phone/email rejection

---

### S2 — User Profile Management

**Scope:** Edit personal info, profile photo, account settings.

#### Backend
- `GET /users/me` — returns current user's full profile
- `PATCH /users/me` — update name, email, phone, city, pincode, language_pref
- `POST /users/me/photo` — Cloudinary signed upload; stores URL in `users.avatar_url`
- `DELETE /users/me` — soft-delete: sets `is_active = false`, anonymises PII within 30 days (GDPR-aligned)

#### Security Requirements
- Profile photo upload: Cloudinary signed upload only — no file buffered on backend server
- Phone number changes require re-OTP verification before saving
- Email changes require re-verification link via Resend

#### Frontend
- `/profile` — editable form with avatar upload dropzone (`react-dropzone`), name, contact, location, language selector
- Changes show optimistic update, revert on error (TanStack Query mutation)

#### Tests
- `tests/test_user_service.py`: profile fetch, update, photo URL persistence, soft-delete anonymisation

---

### S3 — Reputation & Trust Score

**Scope:** Visible score on every public profile based on behaviour signals.

#### Backend
- `reputation_score` column on `users` table (float, 0–100, default 50.0)
- Score components (weighted):
  - Follow-through rate: confirmed handovers / total accepted matches (40%)
  - Feedback average: mean rating received (35%)
  - No-show count: penalises missed pickups (−15%)
  - Response speed: average time to respond to match (10%)
- `app/services/reputation_service.py`: `recalculate_score(user_id)` — called as Celery task after each handover/rating event
- Score exposed on `GET /users/{id}/public` alongside badge wall and donation count

#### Frontend
- Score displayed as a numeric badge (e.g., "87 / 100") on every public profile card
- Colour-coded: ≥80 lime-400, 50–79 text-secondary, <50 amber (but never amber + lime on same component)

#### Tests
- `tests/test_reputation_service.py`: score calculation under various handover/rating scenarios

---

### S4 — Notifications Center

**Scope:** In-app + email + SMS alerts for all event types.

#### Backend
- `notifications` table: `id, user_id, type (enum), content (JSONB), read_at (nullable), created_at`
- `GET /notifications/my` — paginated, unread first
- `PATCH /notifications/{id}/read` — marks single notification read
- `POST /notifications/read-all` — marks all read
- `GET /notifications/preferences` — returns per-event-type × per-channel settings
- `PATCH /notifications/preferences` — update user's notification preferences

#### Event Types
`match_found · wishlist_match · drive_reminder · handover_confirmed · badge_earned · ngo_approved · ngo_rejected · item_flagged · system_update`

#### Delivery Channels (per event, user-configurable)
- **In-app:** pushed via WebSocket `ws://host/ws/notifications/{user_id}`, stored in `notifications` table
- **Email:** Resend REST API via httpx, async Celery task
- **SMS:** Twilio SMS, async Celery task
- **Push (Phase 2):** Firebase Cloud Messaging

#### Security Requirements
- WebSocket notification channel requires JWT auth (token as query param on handshake)
- Reject unauthorised WS connections immediately with code 4001

#### Frontend
- Notification bell in global header — badge with unread count (TanStack Query, 30s refetch)
- Dropdown list: recent 10 notifications, "Mark all read" button
- `/settings/notifications` — toggle matrix: event type rows × channel columns (push/SMS/email)

#### Tests
- `tests/test_notification_service.py`: mock Resend, Twilio, FCM; verify correct dispatch per preference config

---

### S5 — Search & Filters

**Scope:** Browse donations by category, location, condition, availability.

#### Backend
- `GET /donations/items` — query params: `category, subcategory, condition, city, radius_km, date_listed_after, status, page, page_size`
- PostGIS `ST_DWithin` filters items by distance from requester's location
- Response: paginated list of `DonationItemSummary` schemas (no PII until match confirmed)

#### Frontend
- Filter sidebar: category multi-select, condition checkboxes (Good/Fair/Worn), distance slider (1–50km), date range
- Item cards: photo thumbnail, AI-assessed condition chip, category tag, distance, date listed
- Infinite scroll via TanStack Query `useInfiniteQuery`

#### Tests
- `tests/test_donation_service.py`: filter combinations, geo-radius correctness via mock PostGIS

---

### S6 — Feedback & Ratings

**Scope:** Leave a rating and review after every completed donation transaction.

#### Backend
- `feedback` table: `id, match_id, reviewer_id, reviewee_id, rating (1–5), note (text, max 500 chars), created_at`
- `POST /feedback` — only callable when match status is `completed`; one feedback per reviewer per match
- `GET /users/{id}/feedback` — paginated feedback received

#### Security Requirements
- Feedback only writable when `match.status = 'completed'` and `match` involves the authenticated user
- Rating must be integer 1–5; note sanitised (strip HTML, max 500 chars)

#### Frontend
- Post-handover modal (triggered by "Handover Complete" confirmation): star selector + optional note textarea
- Feedback displayed on public profiles as scrollable card list

#### Tests
- `tests/test_feedback_service.py`: valid submission, duplicate rejection, status guard

---

### S7 — Responsive UI

**Scope:** Mobile-first design that works across all screen sizes.

#### Requirements
- Minimum tap target: **44×44px** on all interactive elements
- Breakpoints: mobile-first Tailwind defaults (`sm:640px, md:768px, lg:1024px`)
- Sidebar collapses to bottom nav tab bar on mobile
- All tables reflow to stacked cards on mobile
- Tested at 360px, 390px (iPhone 15), 768px (iPad), 1280px (desktop)
- Accessibility: all interactive elements have `aria-label`; focus ring `0 0 0 3px rgba(167,209,41,0.15)`; tested with axe-core

---

## Section 2 — Donor Features

### D1 — Item Listing Wizard

**Scope:** 6-step wizard to create a donation listing.

#### Wizard Steps
1. **Category** — select from: Clothes / Shoes / Accessories / Books / Toys / Electronics / Other
2. **Sub-category** — contextual (e.g., Men's / Women's / Children's within Clothes)
3. **Condition & Photos** — upload 1–3 photos via `react-dropzone` → Cloudinary signed direct upload; AI condition classification runs server-side
4. **Quantity** — numeric input
5. **Handover preference** — radio: Direct pickup from home / Drop-off at NGO / Community drive
6. **Location & Availability** — auto-filled from profile (editable); date/time availability window

#### Backend
- `POST /donations/items` — creates `donation_items` record + `item_photos` records; triggers `matching.run_geo_match(item_id)` Celery task
- `donation_items` table: `id, donor_id, category, subcategory, condition (Good|Fair|Worn), quantity, handover_preference, availability_start, availability_end, location (PostGIS Point), status (available|matched|handover_pending|completed|cancelled), created_at`
- `item_photos` table: `id, item_id, cloudinary_url, display_order`
- `PATCH /donations/items/{id}` — edit listing (allowed when status = `available`)
- `DELETE /donations/items/{id}` — soft-delete (sets status = `cancelled`)

#### AI Integration — Condition Classification
- After photo upload, pass `category + donor_description` as structured text to `app/services/ai_service.py::classify_item_condition()`
- Model: `meta-llama/llama-3.3-70b-instruct:free` via OpenRouter
- Response must be exactly `Good`, `Fair`, or `Worn` — validate before writing to DB; default to `Fair` on unexpected output
- **No vision model on free tier** — do not pass image URLs to the LLM

#### AI Integration — Category Suggestion
- Optional: `classify_item_category(description)` suggests category from free-text description
- Same model; response validated against enum before use

#### Security Requirements
- Photos: signed Cloudinary upload from frontend; backend stores only the Cloudinary URL — no file buffered server-side
- Listing creation rate-limited: **max 10 per user per hour** via `slowapi`
- All text fields sanitised: strip HTML, max lengths enforced by Pydantic v2 validators

#### Offline-First Draft
- Wizard saves form state to `localStorage` key `draft:listing` after each step
- On mount: check for existing draft, show restore banner
- On successful submit or explicit discard: clear `draft:listing`

#### Frontend
- `/donate/new` — 6-step wizard with progress bar (olive-500 → lime-500 gradient fill)
- Step navigation: "Back" / "Continue" buttons; "Save draft" link
- Photo upload: `react-dropzone` with preview thumbnails, remove button per photo
- AI condition result displayed as chip below photos with "Override" toggle
- Condition chip colours: Good = lime-400 text, Fair = text-secondary, Worn = text-muted

#### Tests
- `tests/test_donation_service.py`: create listing, AI classification with valid/invalid LLM responses, geo-match trigger, rate limit enforcement

---

### D2 — Active Listings Manager

**Scope:** View, edit, pause, or remove current donation listings.

#### Backend
- `GET /donations/items/my` — all donor's listings, filterable by status
- `PATCH /donations/items/{id}/pause` — sets status = `paused`
- `PATCH /donations/items/{id}/resume` — sets status = `available`, re-triggers geo-match

#### Frontend
- `/donor/listings` — table/card list with status chip per item; row actions: Edit, Pause, Remove
- Status chips: Available (lime-400), Matched (text-primary), Handover Pending (amber — note: never amber + lime simultaneously), Completed (text-muted), Paused (text-muted)

---

### D3 — Request Inbox

**Scope:** See all incoming requests for listed items from individuals and NGOs.

#### Backend
- `GET /donations/items/{id}/requests` — all requests on a specific item
- `POST /matches` — donor accepts a request → creates `matches` record, triggers notification to recipient/NGO

#### Frontend
- `/donor/requests` — list of all incoming requests grouped by item; requester name, type (Individual/NGO), optional note, distance
- Accept / Decline actions per request

---

### D4 — Match Suggestions

**Scope:** System-recommended recipients ranked by proximity and item fit.

- Powered by the Geo-Matching Engine (see I1)
- Displayed as ranked cards on Donor Dashboard and `/donor/matches`
- Shows: requester name, distance, match score, item requested

---

### D5 — Pickup Coordination

**Scope:** Agree on handover method, date, and location with matched recipient.

#### Backend
- `PATCH /matches/{id}/schedule` — sets `handover_at (datetime), handover_location (text)`
- `POST /matches/{id}/confirm-handover` — both donor and recipient must call this; when both confirmed, sets `match.status = completed`, creates `impact_events` record, triggers `karma_events` record, triggers reputation recalculation Celery task

#### Frontend
- In-match view: proposed time/location from either party; confirm/counter-propose flow
- "Handover Complete" one-tap button — disabled until both parties confirm
- Option to reschedule (reopens coordination) or reassign to next match if pickup falls through

---

### D6 — Donation History

**Scope:** Full log of past donations with status.

#### Backend
- `GET /donations/history/my` — paginated, newest first, includes status, recipient type, date

#### Frontend
- `/donor/history` — sortable table; filter by status and date range; expandable row shows item details and recipient (post-match)

---

### D7 — Impact Summary

**Scope:** Personal stats — total items donated, people helped, NGOs served.

#### Backend
- `GET /impact/my` — aggregates from `impact_events` for authenticated donor
- Returns: `total_items, recipients_helped, ngos_served, co2_saved_kg, kg_diverted`

#### Frontend
- `/donor/impact` — stat cards + badge wall; CO₂ saved displayed as a callout counter (lime-400 text, 28px+, lime-500 allowed at this size per brand rules)

---

### D8 — Verified Impact Certificate

**Scope:** Auto-generated PDF + shareable social card on delivery confirmation.

#### Backend
- Triggered by confirmed handover: `app/services/impact_service.py::generate_certificate(match_id)`
- PDF contains: donor name, item(s), recipient name or NGO name, date, platform branding
- Stored in Cloudinary (private URL for donor access only)
- `GET /impact/certificate/{match_id}` — returns signed Cloudinary download URL

#### Frontend
- Post-handover screen: "Download Certificate" button + "Share to social" button (generates Open Graph image card)
- Social card: "I helped donate X items on GiveCircle this month" — shareable link, no PII of recipient

#### Security Requirements
- Certificate URL is a time-limited Cloudinary signed URL (expires 1 hour); regenerated on each request
- Recipient's full name shown only on donor's own certificate — never on public social card

#### Tests
- `tests/test_impact_service.py`: certificate generation, correct content, Cloudinary URL signing

---

### D9 — Karma & Badge System

**Scope:** Karma points and badges rewarding donor behaviour.

#### Backend
- `karma_events` table: `id, user_id, event_type (enum), points, created_at`
- Karma awarded on: listing creation (+5), confirmed handover (+20), fast response to match (+10 if < 2 hours), festival drive participation (+15)
- `karma_score` computed column on `users`: sum of all `karma_events.points`
- Badges (awarded once per lifetime condition met):
  - `first_donation` — first confirmed handover
  - `ten_items_given` — 10 confirmed handovers
  - `fast_responder` — 3 consecutive fast-response matches
  - `festival_hero` — participate in a seasonal drive
  - `one_year_donor` — account > 365 days with ≥1 donation

#### Frontend
- Karma widget on Donor Dashboard: current score + next badge progress bar (olive-500 → lime-500 gradient fill)
- Badge wall on `/profile` — earned badges in lime-400, unearned in text-muted

---

## Section 3 — Individual Recipient Features

### R1 — Browse Donations

Same as S5 (Search & Filters) from the Recipient perspective. All item PII (donor name, exact address) hidden until match is confirmed.

---

### R2 — Item Request

#### Backend
- `POST /requests` — body: `item_id, note (optional, max 200 chars)`
- One open request per item per recipient (duplicate blocked with 409)
- `requests` table: `id, item_id, requester_id, note, status (pending|matched|rejected|cancelled), created_at`

#### Frontend
- "Request This Item" button on item detail page; optional note textarea
- Success state: request status card appears in `/recipient/requests`

---

### R3 — Request Status Tracker

#### Backend
- `GET /requests/my` — all recipient's requests with current status

#### Frontend
- `/recipient/requests` — status cards per request: item thumbnail, status chip, donor info (post-match only), estimated handover date

---

### R4 — Wishlist

**Scope:** Save item preferences so donors can find and offer matches proactively.

#### Backend
- `wishlists` table: `id, user_id, category, subcategory (nullable), condition_min (Good|Fair|Worn), max_distance_km, created_at`
- `POST /wishlist` — create preference entry
- `GET /wishlist/my` — list entries
- `DELETE /wishlist/{id}` — remove entry
- Geo-matching engine checks `wishlists` on every new item listing (see I1)

#### Frontend
- `/recipient/wishlist` — list of saved preferences; add new entry form; instant push/SMS alert toggle per entry

---

### R5 — Pickup Scheduling

Same as D5 from the Recipient perspective.

---

### R6 — Received Items History

#### Backend
- `GET /impact/received` — all completed matches where `recipient_id = current_user.id`

#### Frontend
- `/recipient/history` — log with date, donor display name (post-match), item details

---

### R7 — Feedback on Received Items

Same as S6 from the Recipient's post-handover perspective.

---

### R8 — Saved Listings

#### Backend
- `saved_listings` table: `id, user_id, item_id, created_at`
- `POST /saved-listings` — bookmark item; `DELETE /saved-listings/{item_id}` — remove
- `GET /saved-listings/my` — paginated list

#### Frontend
- Bookmark icon on every item card (toggle, optimistic update)
- `/recipient/saved` — saved items grid

---

### R9 — Need Urgency Flag

#### Backend
- `requests.is_urgent (bool)` — settable by recipient on `PATCH /requests/{id}/urgency`
- Urgent requests surface higher in donor's match suggestion score

#### Frontend
- "Mark as Urgent" toggle on request detail view; urgent requests display a subtle amber dot (never combined with lime on the same card element)

---

## Section 4 — NGO Features

### N1 — Verified NGO Badge

- Granted by Admin on NGO profile approval (see A1)
- `ngo_profiles.verification_status` transitions: `pending → approved | rejected`
- Approved badge unlocks all N2–N10 features; badge displayed on NGO public profile and all request cards
- Rejection triggers email to NGO contact via Resend with reason

---

### N2 — Bulk Item Requests

#### Backend
- `POST /ngo/requests/bulk` — body: `[{category, subcategory, condition_min, quantity_min, quantity_max, priority (bool)}]`
- Each entry creates a `requests` record linked to the NGO user; `is_bulk = true`
- Priority-flagged entries weight higher in matching engine

#### Frontend
- `/ngo/requests/new` — multi-row form; add/remove rows dynamically; priority toggle per row
- Submits all rows in a single API call

---

### N3 — Wishlist / Needs Board

Same mechanism as R4 (Wishlist), surfaced publicly on the NGO's profile page as "Current Needs Board" — visible without login.

---

### N4 — Request Status Tracker (NGO)

Same as R3, scoped to NGO's requests. Bulk requests show aggregate fulfilment progress (e.g., "14 / 30 items matched").

---

### N5 — Pickup & Logistics Coordination

Same as D5, but NGO may coordinate with multiple donors simultaneously per bulk request. Admin can view coordination state for dispute purposes.

---

### N6 — Received Items Log

#### Backend
- `GET /ngo/inventory` — all items received, filterable by category, date, donor
- Response includes donor display name and contact (full detail — see N10)

#### Frontend
- `/ngo/inventory` — sortable table; export to CSV button (see N9)

---

### N7 — Analytics Dashboard

#### Backend
- `GET /ngo/analytics/demand-gap` — category-level supply vs. demand chart data (count of open requests vs. available items per category in service area)
- `GET /ngo/analytics/trends` — historical category trend over last 12 months (monthly buckets)
- `GET /ngo/analytics/sla` — pickup SLA compliance: % of matches confirmed within 48h

#### Frontend
- `/ngo/analytics` — demand vs. supply bar chart (Recharts, olive-500 → lime-500 bars); category trend line chart; SLA compliance ring chart
- "Most needed right now" ranked list surfaced as data feed to donor listing wizard

---

### N8 — AI Demand Forecasting

#### Backend
- Celery Beat task: daily at 06:00 IST, runs `app/services/ai_service.py::forecast_ngo_demand(ngo_id)`
- Passes last 90 days of `requests` + `impact_events` data as structured text to `google/gemma-3-27b-it:free` (OpenRouter)
- LLM output: JSON `{category: string, predicted_shortage_severity: 'high'|'medium'|'low', next_month_shortfall_estimate: int}`
- Validate against schema before storing; trigger proactive donor drive alert if `severity = 'high'`

#### Frontend
- Forecast card on `/ngo/analytics`: "Predicted shortages next month" — category chips with severity badges

#### Security Requirements
- AI output never written to DB without schema validation; default to no alert on invalid/unexpected response

---

### N9 — Impact Report Export

#### Backend
- `GET /ngo/reports/export?format=pdf|csv&from=YYYY-MM-DD&to=YYYY-MM-DD`
- PDF: platform-branded, contains items received, estimated value, families helped, CO₂ saved, donors engaged
- CSV: raw tabular data for corporate partners
- Generated synchronously for MVP (file streamed back); move to async Celery + download URL for large date ranges

#### Security Requirements
- Report download restricted to authenticated NGO user of that profile
- Cloudinary private URLs used for stored report assets

#### Frontend
- `/ngo/reports` — date range picker; "Export PDF" and "Export CSV" buttons; download triggers immediately

---

### N10 — Donor Transparency Feed

#### Backend
- `GET /ngo/donors` — full donor name and profile for every completed donation received by the NGO

#### Frontend
- `/ngo/donors` — donor card list with name, avatar, total items donated to this NGO, last donation date

---

### N11 — Collection Drive Management

#### Backend
- `drives` table: `id, ngo_id, title, date, area_pincode, dropoff_address, capacity, status (upcoming|active|completed)`
- `drive_rsvps` table: `id, drive_id, donor_id, created_at`
- `POST /ngo/drives` — create drive; triggers Celery task to notify donors in area
- `GET /ngo/drives` — list NGO's drives
- `POST /drives/{id}/rsvp` — donor RSVPs; returns RSVP count
- `DELETE /drives/{id}/rsvp` — cancel RSVP
- Post-drive: `app/services/drive_service.py::generate_drive_summary(drive_id)` — auto-generates summary record for impact log

#### Frontend
- `/ngo/drives` — drive management panel: upcoming drives, RSVP count, logistics overview
- `/drives/{id}` — public drive detail page (Server Component); RSVP button for authenticated donors

---

## Section 5 — Admin Features

### A1 — NGO Verification

#### Backend
- `GET /admin/ngo-queue` — pending NGO applications sorted by submission date (oldest first)
- `POST /admin/ngo/{id}/approve` — sets `verification_status = approved`, grants NGO badge, sends approval email via Resend (Celery task)
- `POST /admin/ngo/{id}/reject` — body: `{reason: string}`, sets status = `rejected`, sends rejection email with reason

#### Frontend
- `/admin/ngo-verification` — application cards with: org name, contact, service area, submitted docs (Cloudinary private URL viewer), approve/reject buttons (reject requires reason text)
- Document viewer: iframe/PDF embed for uploaded NGO certificates

---

### A2 — User Management

#### Backend
- `GET /admin/users` — all users, filterable by role/status/city
- `POST /admin/users/{id}/suspend` — sets `is_active = false`, invalidates all active refresh tokens (Redis `blocklist:*` for user)
- `POST /admin/users/{id}/reinstate` — re-activates account
- `DELETE /admin/users/{id}` — hard delete with 30-day PII anonymisation pipeline

#### Security Requirements
- Admin endpoints prefixed `/admin/*` enforce `require_admin` guard on every route
- Admin actions logged in `admin_audit_log` table: `admin_id, action, target_user_id, reason, created_at`

#### Frontend
- `/admin/users` — filterable user table; row actions: View Profile, Suspend, Reinstate, Delete

---

### A3 — Item Category Management

#### Backend
- `categories` table: `id, name, parent_id (nullable), is_active`
- `GET /admin/categories`, `POST /admin/categories`, `PATCH /admin/categories/{id}`, `DELETE /admin/categories/{id}` (soft-delete: `is_active = false`)

#### Frontend
- `/admin/categories` — tree view of categories; add/edit/deprecate inline

---

### A4 — Flagged Content Moderation

#### Backend
- `flags` table: `id, reporter_id, target_type (item|user|match), target_id, reason, status (open|resolved), admin_note, created_at`
- `POST /flags` — any authenticated user can flag
- `GET /admin/flags` — open flags queue
- `POST /admin/flags/{id}/resolve` — body: `{action: warn|suspend|remove_listing|ban, note}`
- Admin can view chat transcript for flagged match via `GET /admin/matches/{id}/chat`

#### Security Requirements
- Chat transcript access restricted to `require_admin` only; logged in `admin_audit_log`

#### Frontend
- `/admin/disputes` — flag list with filter by type (item/user/match); expandable row shows chat transcript viewer and item photos; action dropdown

---

### A5 — Platform-wide Analytics

#### Backend
- `GET /admin/analytics` — returns:
  - DAU (distinct active users last 24h)
  - Items listed today
  - Handovers completed today
  - Active matches count
  - Match success rate (completed / total matches, 30-day rolling)
  - City-level breakdown

#### Frontend
- `/admin/dashboard` — stat cards for platform health; city heatmap (Leaflet); category supply/demand chart (Recharts); top donors leaderboard this month

---

### A6 — Geospatial Heatmap (Admin)

- `GET /admin/heatmap` — GeoJSON FeatureCollection of donation density by neighbourhood
- Rendered via react-leaflet + heatmap layer on `/admin/dashboard`

---

### A7 — Seasonal Surge Mode

#### Backend
- Surge config stored in Redis: key `feature:surge:{city}` (or `feature:surge:global`), value: `{active: bool, headline: string, featured_categories: [], template: string}`
- `POST /admin/surge` — set surge config
- `GET /public/surge` — no auth; returns active surge config for current user's city (used by frontend to render banner)

#### Frontend
- `/admin/surge` — toggle per city; headline text input; category multi-select; pre-built templates: Diwali, Eid, Christmas, New Year
- Surge banner auto-renders on landing page and all dashboards when `active = true` for user's city

---

## Section 6 — Backend Infrastructure Features

### I1 — Geospatial Matching Engine

**Scope:** Ranks donor items to recipient/NGO pairs by proximity and fit.

#### Implementation
- PostGIS `ST_DWithin` for radius filter; `ST_Distance` for proximity score
- `geoalchemy2` for SQLAlchemy integration
- Matching logic in `app/services/matching_engine.py`
- Triggered as Celery task: `app/workers/matching.py::run_geo_match(item_id)` — fires on every new item listing and every new listing resume

#### Matching Algorithm
1. New item listed → Celery task fires with `item_id`
2. Query `wishlists` for matching `category + condition_min` within configurable radius (default 25km)
3. Query open `requests` for matching item type and area
4. Score each candidate: `score = (1/distance_km * 40) + (condition_match * 35) + (recency_score * 15) + (urgency_flag * 10)`
5. Top 3 matches → insert `matches` records with `status = suggested`
6. Trigger in-app + push/SMS notification to matched recipient/NGO
7. Bundle pickup suggestion: if multiple donors in same neighbourhood targeting same recipient/NGO, surface as multi-donor bundle

#### Security Requirements
- Exact donor address never exposed until match is accepted by donor
- Only city + approximate distance shown to recipients during browse

#### Tests
- `tests/test_matching_engine.py`: radius filter, score ranking, wishlist alert trigger, bundle detection

---

### I2 — Async Notification Pipeline

**Scope:** Event-driven alert system with retry logic and delivery guarantees.

#### Implementation
- All notification sends dispatched as Celery tasks — never inline in request handlers
- Celery configured with exponential retry: max 3 retries, backoff 60s → 300s → 900s
- Delivery failures logged to `notification_failures` table for admin visibility
- Celery Beat scheduled tasks:
  - Daily 08:00 IST: demand gap email to all active NGOs
  - Daily 06:00 IST: AI demand forecast per NGO
  - Hourly: wishlist alert checks for new items posted in last 60 minutes
  - Every 5 minutes: impact counter aggregation for public dashboard

#### Tests
- `tests/test_notification_service.py`: retry behaviour, channel dispatch per preference, Beat task scheduling

---

## Section 7 — Cross-Cutting Features

### CC1 — In-App Encrypted Chat

#### Backend
- `chat_messages` table: `id, match_id, sender_id, content (text), sent_at, read_at (nullable)`
- FastAPI WebSocket endpoint: `ws://host/ws/chat/{match_id}`
- `ConnectionManager` class: manages active WS connections, uses Redis pub/sub for multi-instance message delivery
- Chat available only after `match.status = accepted`
- Chat auto-expires 30 days post confirmed handover: Celery Beat task purges `chat_messages` where `match.confirmed_at < NOW() - 30 days`
- Admin can access chat transcript for flagged match (read-only, logged)

#### Security Requirements
- WS connection requires JWT auth (token as query param on handshake); reject with code 4001 if invalid
- Messages stored as plaintext but access-controlled: only match participants and admin can read
- Rate limit: max 60 messages per user per minute on chat endpoint

#### Frontend
- `/messages` — chat list (all active match conversations)
- `/messages/{match_id}` — message thread: message list (auto-scroll to latest), input bar, online indicator (green dot when counterpart WS is active)
- Optimistic message send; roll back on WS error

#### Tests
- `tests/test_chat_service.py`: message delivery, WS auth rejection, expiry purge

---

### CC2 — Public Impact Dashboard

#### Backend
- `GET /public/impact` — no auth; returns aggregate stats + heatmap GeoJSON
- Stats: `items_donated (int), families_helped (int), kg_diverted_from_landfill (float), co2_saved_kg (float)`
- `ws://host/ws/impact` — broadcasts counter update to all connected clients on each confirmed handover
- Social share: `GET /public/share/{user_id}` — returns donor's personal stats formatted for OG card

#### Frontend
- `/impact` — public Server Component page (SEO-optimised); live counters with `translateY(12px→0) + opacity(0→1) · 800ms ease-out` tick animation; Leaflet heatmap; "Share My Impact" button
- Counter widget embedded in landing page hero

---

### CC3 — Multilingual Support

- Framework: `next-intl`
- Supported languages: English (en), Hindi (hi), Bengali (bn), Tamil (ta)
- Translation files: `frontend/messages/{en,hi,bn,ta}.json` — all user-facing strings
- Auto-detects device language on first visit; user can override in Settings → Language
- All core flows (registration, listing wizard, request flow, chat) must be available in all four languages
- RTL not required for current language set

---

### CC4 — Offline-First Architecture

- Item listing wizard drafts to `localStorage` key `draft:listing` after each step
- Wishlist entries and saved items cached via TanStack Query `persistQueryClient` (IndexedDB)
- On reconnect: draft syncs automatically; banner dismisses
- Service Worker (next-pwa) caches shell assets and static pages for offline access
- Critical for tier 2/3 cities with low-connectivity users

---

## Section 8 — Later Add-On (Post-MVP)

### L1 — Fraud & Abuse Detection Agent

**Type:** ML + LLM (Agentic) — out of scope for MVP

#### Description
- ML layer flags anomalous behaviour patterns (e.g., multiple accounts same phone, high listing + no handover rate, rapid flagging patterns)
- LLM agent (GPT-4-class, not free-tier) queries additional context from `admin_audit_log`, `feedback`, and `chat_messages`
- Agent writes structured escalation report and optionally triggers auto-suspension pending admin review
- All auto-suspension decisions logged with full reasoning trace; admin can reinstate with one click

**Implementation note:** Design all data models with this feature in mind — `admin_audit_log`, `flags`, and `reputation_score` tables already support it.

---

## Section 9 — Security Requirements (Consolidated)

> These requirements apply platform-wide and must be enforced in every endpoint and component.

| Requirement | Implementation |
|-------------|----------------|
| JWT access token expiry | 15 minutes; `python-jose` |
| Refresh token rotation | 7-day expiry; JTI blocklist in Redis |
| OTP rate limiting | 5 attempts / phone / 15 min via `slowapi` |
| Listing creation rate limit | 10 / user / hour via `slowapi` |
| Chat message rate limit | 60 messages / user / minute |
| File uploads | Cloudinary signed upload only; no buffering on backend |
| NGO documents | Cloudinary private delivery URLs; time-limited signed access |
| Input sanitisation | Pydantic v2 validators on all text fields: strip HTML, enforce max lengths, validate phone `+91XXXXXXXXXX` |
| PII exposure | Donor exact address hidden until match accepted; recipient name hidden on public social share cards |
| WebSocket auth | JWT as query param on handshake; reject with code 4001 if invalid |
| Never log | Tokens, passwords, OTP codes |
| Admin actions | All logged to `admin_audit_log` with `admin_id, action, target, reason, created_at` |
| AI output | Never written to DB without schema validation and sanitisation |
| Secrets | All in `.env`; never hardcoded; `.env.example` with placeholders; `.env` gitignored |
| Migrations | Alembic only; never `Base.metadata.create_all()` in production paths |
| Security audit | `bandit -r backend/app` (no high-severity findings) + `npm audit` (no critical findings) before each release |

---

## Section 10 — API Contract Summary

### Public Endpoints (No Auth)
```
GET  /health
GET  /public/impact
GET  /public/share/{user_id}
GET  /public/surge
GET  /drives/{id}
WS   /ws/impact
```

### Auth Endpoints
```
POST /auth/register/donor
POST /auth/register/recipient
POST /auth/register/ngo
POST /auth/login
POST /auth/otp/send
POST /auth/otp/verify
POST /auth/refresh
POST /auth/logout
```

### Donor Endpoints (require_donor)
```
GET/POST         /donations/items
GET/PATCH/DELETE /donations/items/{id}
PATCH            /donations/items/{id}/pause
PATCH            /donations/items/{id}/resume
GET              /donations/items/my
GET              /donations/items/{id}/requests
POST             /matches
PATCH            /matches/{id}/schedule
POST             /matches/{id}/confirm-handover
GET              /donations/history/my
GET              /impact/my
GET              /impact/certificate/{match_id}
POST             /drives/{id}/rsvp
DELETE           /drives/{id}/rsvp
```

### Recipient Endpoints (require_recipient)
```
GET              /donations/items           (browse/filter)
POST             /requests
GET              /requests/my
PATCH            /requests/{id}/urgency
POST/GET/DELETE  /wishlist, /wishlist/{id}
GET              /wishlist/my
POST/DELETE/GET  /saved-listings, /saved-listings/{item_id}, /saved-listings/my
GET              /impact/received
POST             /matches/{id}/confirm-handover
```

### NGO Endpoints (require_ngo + verification_status=approved)
```
POST             /ngo/requests/bulk
GET              /ngo/requests
GET              /ngo/inventory
GET              /ngo/analytics/demand-gap
GET              /ngo/analytics/trends
GET              /ngo/analytics/sla
GET              /ngo/reports/export
GET              /ngo/donors
POST/GET         /ngo/drives
```

### Admin Endpoints (require_admin)
```
GET              /admin/ngo-queue
POST             /admin/ngo/{id}/approve
POST             /admin/ngo/{id}/reject
GET              /admin/users
POST             /admin/users/{id}/suspend
POST             /admin/users/{id}/reinstate
DELETE           /admin/users/{id}
GET/POST/PATCH/DELETE /admin/categories
GET              /admin/flags
POST             /admin/flags/{id}/resolve
GET              /admin/matches/{id}/chat
GET              /admin/analytics
GET              /admin/heatmap
POST             /admin/surge
```

### Shared Endpoints (any authenticated user)
```
GET/PATCH        /users/me
POST             /users/me/photo
DELETE           /users/me
GET              /users/{id}/public
GET              /users/{id}/feedback
POST             /feedback
GET              /notifications/my
PATCH            /notifications/{id}/read
POST             /notifications/read-all
GET/PATCH        /notifications/preferences
POST             /flags
WS               /ws/chat/{match_id}
WS               /ws/notifications/{user_id}
```

---

## Section 11 — Frontend Navigation Matrix

| Page | Route | Role(s) | Component Type |
|------|-------|---------|---------------|
| Landing | `/` | Public | Server |
| Public Impact | `/impact` | Public | Server |
| Register (role select) | `/register` | Public | Client |
| Donor Registration | `/register/donor` | Public | Client |
| Recipient Registration | `/register/recipient` | Public | Client |
| NGO Registration | `/register/ngo` | Public | Client |
| OTP Verify | `/register/verify` | Public | Client |
| Login | `/login` | Public | Client |
| Donor Dashboard | `/donor` | Donor | Client |
| New Listing Wizard | `/donate/new` | Donor | Client |
| My Listings | `/donor/listings` | Donor | Client |
| Request Inbox | `/donor/requests` | Donor | Client |
| Donation History | `/donor/history` | Donor | Client |
| Donor Impact | `/donor/impact` | Donor | Client |
| Recipient Dashboard | `/recipient` | Recipient | Client |
| Browse Donations | `/browse` | Recipient, NGO | Client |
| My Requests | `/recipient/requests` | Recipient | Client |
| Wishlist | `/recipient/wishlist` | Recipient | Client |
| Saved Listings | `/recipient/saved` | Recipient | Client |
| NGO Dashboard | `/ngo` | NGO | Client |
| Bulk Request | `/ngo/requests/new` | NGO | Client |
| NGO Drives | `/ngo/drives` | NGO | Client |
| NGO Analytics | `/ngo/analytics` | NGO | Client |
| NGO Reports | `/ngo/reports` | NGO | Client |
| NGO Inventory | `/ngo/inventory` | NGO | Client |
| NGO Donors | `/ngo/donors` | NGO | Client |
| Admin Dashboard | `/admin` | Admin | Client |
| NGO Verification | `/admin/ngo-verification` | Admin | Client |
| User Management | `/admin/users` | Admin | Client |
| Disputes | `/admin/disputes` | Admin | Client |
| Surge Config | `/admin/surge` | Admin | Client |
| Category Management | `/admin/categories` | Admin | Client |
| Messages (list) | `/messages` | All | Client |
| Chat Thread | `/messages/{match_id}` | All | Client |
| Public Profile | `/profile/{id}` | Public | Server |
| My Profile | `/profile` | All | Client |
| Notifications | `/notifications` | All | Client |
| Settings | `/settings` | All | Client |
| Drive Detail | `/drives/{id}` | Public | Server |

---

## Section 12 — Feature Count Summary

| Layer | Count |
|-------|-------|
| Shared | 7 |
| Donor | 9 (D1–D9) |
| Individual Recipient | 9 (R1–R9) |
| NGO | 11 (N1–N11) |
| Admin | 7 (A1–A7) |
| Backend Infrastructure | 2 (I1–I2) |
| Cross-Cutting | 4 (CC1–CC4) |
| Later Add-On | 1 (L1) |
| **Total** | **50** |

---

*Build GiveCircle. Follow this spec. Cross-reference AGENTS.md for implementation rules. Cross-reference tech-stack.md for library choices. Cross-reference brand-guidelines.md for every UI decision.*
*Last updated: April 2026 | Platform: GiveCircle — Community Donation Platform*
