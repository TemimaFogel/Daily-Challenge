# Daily Challenge – Server

Spring Boot backend for the Daily Challenge application.

For full project documentation, setup instructions, and architecture, see the [root README](../README.md).

## Quick start

1. Set environment variables (see root README):
   - `DB_PASSWORD` – PostgreSQL password for user `dailychallenge`
   - `JWT_SECRET` – JWT signing secret (min 256 bits for HS256)
   - Optional: `MAIL_USERNAME`, `MAIL_PASSWORD`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `HF_TOKEN`

2. Run with dev profile:
   ```bash
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
   ```

3. API: http://localhost:8080  
   Swagger UI: http://localhost:8080/swagger-ui.html

Do not commit real secrets; use placeholders or local env only.
