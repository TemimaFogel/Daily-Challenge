# Daily Challenge – Server

Spring Boot backend for the Daily Challenge app.

## Local setup

Set the following environment variables before running the server. Do not commit real values to the repository.

- **DB_PASSWORD** – PostgreSQL password for the `dailychallenge` user.
- **JWT_SECRET** – Secret used to sign JWT tokens (e.g. 256-bit value).
- **MAIL_USERNAME** – SMTP username (e.g. Gmail address) for sending password reset and group invitation emails.
- **MAIL_PASSWORD** – SMTP password (e.g. Gmail app password). No default; must be set for email to work.

With `dev` profile active, the app also uses `application-dev.yml` for datasource and JPA settings.
