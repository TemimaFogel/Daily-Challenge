# Daily Challenge

A full-stack web application for creating, joining, and tracking daily challenges—individually or with groups. Users can register, log in (email/password or Google), create and join challenges, complete them daily, invite others to groups, and view history and statistics.

---

## Project Overview

**Daily Challenge** helps users build habits and stay accountable by committing to small, repeatable goals (e.g. “eat 100g protein”, “run 2km”) every day. Challenges can be personal, shared with a group, or public. The system supports:

- **Authentication** (email/password, Google OAuth, JWT)
- **Daily challenges** with join/complete flows and optional AI-generated images
- **Groups** for team challenges and invitations
- **Invitations** (in-app and external email invites for non-users)
- **History** and calendar view of completions
- **Profile management** and optional account deletion (soft-delete)
- **Password reset** via email
- **Comments** on challenges
- **Gamification** (streaks, completion rates, dashboard KPIs)

---

## Main Features

| Feature | Description |
|--------|-------------|
| **Authentication** | Register and sign in with email/password; optional “Continue with Google” (OAuth2). JWT issued for API access. |
| **Daily challenges** | Create challenges with title, description, visibility (Personal / Group / Public), optional image (upload or AI-generated). Join and mark complete per day. |
| **Challenge history** | Calendar and list view of past completions; daily summaries and per-challenge stats. |
| **Groups** | Create groups, invite members by email, manage membership. Group challenges visible only to members. |
| **Invitations** | Accept or decline group invites; external invites (email to non-registered users) with sign-up link. |
| **Notifications** | In-app notification bell for invites and relevant updates. |
| **Profile management** | Update name, timezone; upload profile image; view and manage account. |
| **Password reset** | Forgot-password flow: request reset email, set new password via token link. |
| **Comments** | Post and view comments on challenges. |
| **Gamification** | Personal dashboard: total completions, current streak, completion rate; “today’s top challenge” preview. |
| **Account deletion** | User can soft-delete their own account (irreversible from UI; data retained with `deleted_at`). |

---

## Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Backend** | Java 17+, Spring Boot, Spring Security (JWT + OAuth2), Spring Data JPA, Flyway, OpenAPI/Swagger |
| **Frontend** | React 18, TypeScript, Vite, React Router, TanStack Query (React Query), Tailwind CSS |
| **Database** | PostgreSQL |
| **Auth** | JWT (access token), optional Google OAuth2 (sign-in only; JWT issued after success) |
| **Tools** | Maven (backend), npm (frontend), Hugging Face Inference API (optional AI challenge images) |

---

## Architecture Overview

- **Backend**: REST API under `/api/*`. Stateless JWT auth; optional OAuth2 login with Google redirects to frontend with token. Controllers → Services → Repositories; DTOs for request/response; global exception handler returns consistent error payloads.
- **Frontend**: SPA (Vite). Auth state and token stored in memory + persistence (e.g. localStorage); React Query for server state; protected routes via `RequireAuth`.
- **Database**: PostgreSQL; schema and migrations managed by Flyway. Soft-deletes for users and groups (`deleted_at`).
- **API communication**: JSON over HTTP; `Authorization: Bearer <token>` for protected endpoints. CORS configured for the frontend origin.
- **JWT**: Issued on login, register, and after Google OAuth success. Short-lived; validated on each request; user id/email in claims; deleted users rejected.

---

## Setup Instructions

### Prerequisites

- **Java 17+** (backend)
- **Node.js 18+** and **npm** (frontend)
- **PostgreSQL** (e.g. 14+)
- **Maven** (or use wrapper `./mvnw`)

### 1. Clone and open project

```bash
git clone <repository-url>
cd DailyChallenge
```

### 2. Database setup

Create a database and user, e.g.:

```sql
CREATE DATABASE daily_challenge;
CREATE USER dailychallenge WITH PASSWORD '<your-password>';
GRANT ALL PRIVILEGES ON DATABASE daily_challenge TO dailychallenge;
```

Run Flyway migrations automatically on first backend start (default: `classpath:db/migration`).

### 3. Backend setup

```bash
cd server
```

Set environment variables (see [Environment Variables](#environment-variables--configuration) below). Example:

```bash
# Database
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/daily_challenge
export SPRING_DATASOURCE_USERNAME=dailychallenge
export SPRING_DATASOURCE_PASSWORD=your_db_password

# Flyway (optional - defaults to datasource)
export SPRING_FLYWAY_URL=jdbc:postgresql://localhost:5432/daily_challenge
export SPRING_FLYWAY_USER=dailychallenge
export SPRING_FLYWAY_PASSWORD=your_db_password

# Security
export JWT_SECRET=your_jwt_secret_at_least_32_chars

# Optional integrations
export MAIL_USERNAME=your_email
export MAIL_PASSWORD=your_email_password
export GOOGLE_CLIENT_ID=your_google_client_id
export GOOGLE_CLIENT_SECRET=your_google_client_secret
export HF_TOKEN=your_huggingface_token

```

Run the server:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Default: **http://localhost:8080**. The `dev` profile uses `application-dev.yml` (e.g. local DB URL, optional `show-sql`).

### 4. Frontend setup

```bash
cd client
npm install
```

Create `.env` if needed (see [Environment Variables](#environment-variables--configuration)):

```bash
VITE_API_BASE_URL=http://localhost:8080
```

Run the dev server:

```bash
npm run dev
```

Default: **http://localhost:5173**.

### 5. Verify

- Open http://localhost:5173 and register or log in.
- Open http://localhost:8080/swagger-ui.html to explore the API.

---

## Environment Variables / Configuration

Use environment variables or `application.yml` placeholders. **Do not commit real secrets.**

| Variable | Required | Description |
|----------|----------|-------------|
| `SPRING_DATASOURCE_URL` | Yes | JDBC URL for PostgreSQL |
| `SPRING_DATASOURCE_USERNAME` | Yes | Database username |
| `SPRING_DATASOURCE_PASSWORD` | Yes | Database password |
| `SPRING_FLYWAY_URL` | No | Flyway DB URL (defaults to datasource) |
| `SPRING_FLYWAY_USER` | No | Flyway DB user |
| `SPRING_FLYWAY_PASSWORD` | No | Flyway DB password |
| `JWT_SECRET` | Yes | Secret for signing JWTs |
| `MAIL_USERNAME` | No | SMTP username |
| `MAIL_PASSWORD` | No | SMTP password |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth secret |
| `HF_TOKEN` | No | Hugging Face token |
| `VITE_API_BASE_URL` | No (frontend) | Backend base URL |

Backend config (e.g. `app.frontend.base-url`, `app.uploads.dir`, `app.password-reset.base-url`) can be overridden in `application.yml` or profile-specific files.

---

## API / Swagger

- **Swagger UI**: When the backend is running, open **http://localhost:8080/swagger-ui.html**.
- **OpenAPI JSON**: **http://localhost:8080/v3/api-docs**.
- All `/api/*` endpoints (except auth login/register and public docs) require `Authorization: Bearer <JWT>`.

Use Swagger to try endpoints and inspect request/response schemas.

---

## Key User Flows

1. **Register / Login**  
   Register with email, name, password (timezone is inferred). Or sign in with email/password. Or use “Continue with Google”; after success, backend redirects to frontend with a JWT; frontend stores token and loads user.

2. **Join challenge**  
   Browse challenges (filter by All / Public / Group / Personal), open a challenge, click Join. Only one join per challenge per day (by design).

3. **Complete challenge**  
   On the challenge detail page, mark “Complete” for today. Completions are stored with timestamp and feed history/dashboard.

4. **Create group**  
   Groups → Create group (name, optional description). Then invite members by email (registered users or external emails).

5. **Invite user**  
   From group management: add by email. If the user is not registered, they receive an email with a link; after sign-up they can accept the invite. Pending invites appear in Invitations.

6. **External invite email flow**  
   Invitation email contains a link to the frontend (e.g. sign-up or login + invite ID). User registers or logs in, then can approve/decline the invite from the Invitations page.

7. **Forgot password**  
   On login page: “Forgot password?” → enter email. If the account exists, an email is sent with a reset link. User opens link, sets new password; then can log in.

8. **Delete account**  
   Settings → Danger zone → Delete account. Confirmation required. Account is soft-deleted (`deleted_at` set); user cannot log in again; data retained for referential integrity.

9. **History / calendar**  
   History page shows a calendar and list of completions; daily summaries and per-challenge stats. Users can open a challenge from a given day.

---

## Project Structure

### Backend (`server/`)

```
src/main/java/com/dailychallenge/
├── config/          # Security, CORS, OpenAPI, app beans (e.g. PasswordEncoder)
├── controller/      # REST controllers (auth, challenges, dashboard, groups, invites, users, history)
├── dto/             # Request/response DTOs by domain (auth, challenge, dashboard, group, user, history)
├── entity/          # JPA entities (User, Challenge, Group, etc.)
├── exception/       # Custom exceptions and global exception handler
├── mapper/          # Entity ↔ DTO mappers
├── repository/      # Spring Data JPA repositories
├── security/        # JWT filter, token provider, OAuth2 success handler
└── service/         # Business logic (auth, challenges, groups, invites, dashboard, etc.)
src/main/resources/
├── application.yml       # Main config (profiles, JPA, Flyway, mail, app.*, OAuth2, Hugging Face)
├── application-dev.yml   # Dev profile (DB URL, JWT default, show-sql)
└── db/migration/         # Flyway SQL migrations
```

### Frontend (`client/`)

```
src/
├── api/             # Shared HTTP client, auth API, user API, dashboard API
├── auth/            # Auth context, auth store (token, current user)
├── components/      # Shared UI: layout (navbar, app layout), auth (RequireAuth), design system, ui primitives
├── features/        # Feature modules: challenges, dashboard, groups, invitations, history, settings
│   ├── challenges/  # List, detail, create, hooks, API, types, components (cards, filters, comments)
│   ├── dashboard/   # Dashboard page, KPIs, create challenge card, hooks
│   ├── groups/      # Groups list, detail, manage, create dialog, invite picker, API, hooks
│   ├── invitations/ # Invitations page, approve/decline, preview dialog
│   ├── history/     # History page, calendar, day details, API, mapper
│   └── settings/    # Settings page, profile, account, danger zone, API
├── hooks/           # useCurrentUser, etc.
├── lib/             # utils, URLs, image processing, page titles
└── pages/           # Login, Register, Forgot/Reset password, OAuth success, Demo, Placeholder
public/              # Static assets (favicon, logo, hero image)
```

---

## Future Improvements

- **Email verification** on sign-up.
- **Refresh tokens** for longer sessions without re-login.
- **Push notifications** (e.g. for invites and reminders).
- **Mobile app** (React Native or native) reusing the same API.
- **More OAuth providers** (e.g. GitHub, Microsoft).
- **Challenge templates** and categories.
- **Export** of history/completions (CSV, PDF).
- **Rate limiting** and security hardening on sensitive endpoints.
- **E2E tests** (Playwright/Cypress) for critical flows.

---

## Notes for Reviewers / Submission

- **Run backend**: From `server/`, set the required environment variables (see table above, especially `SPRING_DATASOURCE_*` and `JWT_SECRET`),
   then run:
  `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev`, then `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev`. Ensure PostgreSQL is running and the database exists; Flyway will apply migrations.
- **Run frontend**: From `client/`, run `npm install` then `npm run dev`. Set `VITE_API_BASE_URL=http://localhost:8080` if the API is on another host.
- **Evaluate**: Use the app at http://localhost:5173 (register, create/join challenges, create groups, invite, use history and settings). Use http://localhost:8080/swagger-ui.html to exercise the API. Both backend (`mvn compile`, `mvn test`) and frontend (`npm run build`) should build without errors.
- **Credentials**: No real secrets are committed; use placeholders or local env vars as described above.

This project is suitable for academic submission or portfolio use; the README and codebase reflect the implemented features only.
