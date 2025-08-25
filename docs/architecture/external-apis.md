# External APIs

## OpenAI GPT-4o-mini API
- **Purpose:** Production constraint satisfaction scheduling after MVP
- **Documentation:** https://platform.openai.com/docs/api-reference
- **Base URL(s):** https://api.openai.com/v1
- **Authentication:** Bearer token (API key)
- **Rate Limits:** 500 RPM, 10,000 RPD

**Key Endpoints Used:**
- `POST /chat/completions` - Generate schedule with constraints

**Integration Notes:** Structured output mode for reliable JSON responses, implement retry logic with exponential backoff

## Google Gemini 1.5 Flash API
- **Purpose:** Free tier AI scheduling for MVP and development
- **Documentation:** https://ai.google.dev/gemini-api/docs
- **Base URL(s):** https://generativelanguage.googleapis.com/v1
- **Authentication:** API key
- **Rate Limits:** 15 RPM (free tier), 1000 RPD

**Key Endpoints Used:**
- `POST /models/gemini-1.5-flash:generateContent` - Generate schedule with constraints

**Integration Notes:** Use free tier during MVP, structure prompts for consistent JSON output

## Google Calendar API
- **Purpose:** Sync staff schedules to Google Calendar
- **Documentation:** https://developers.google.com/calendar/api/v3/reference
- **Base URL(s):** https://www.googleapis.com/calendar/v3
- **Authentication:** OAuth 2.0 with offline access
- **Rate Limits:** 1,000,000 requests/day

**Key Endpoints Used:**
- `POST /calendars` - Create VECTR0 calendar
- `POST /calendars/{calendarId}/events` - Create shift events
- `PUT /calendars/{calendarId}/events/{eventId}` - Update shift events
- `DELETE /calendars/{calendarId}/events/{eventId}` - Remove cancelled shifts

**Integration Notes:** Batch API for bulk operations, use push notifications for bi-directional sync

## Clerk Authentication API
- **Purpose:** User authentication and organization management
- **Documentation:** https://clerk.com/docs/reference/backend-api
- **Base URL(s):** https://api.clerk.com/v1
- **Authentication:** Secret key
- **Rate Limits:** Based on plan (10K MAU free tier)

**Key Endpoints Used:**
- Handled via Clerk SDK, no direct API calls needed

**Integration Notes:** Use Clerk React hooks for frontend, Convex integration for backend validation

## Uploadthing API
- **Purpose:** Profile photo upload and optimization
- **Documentation:** https://docs.uploadthing.com
- **Base URL(s):** Handled via SDK
- **Authentication:** API key
- **Rate Limits:** 2GB storage free tier

**Key Endpoints Used:**
- SDK handles all operations

**Integration Notes:** Client-side uploads with automatic image optimization

## Google Ad Manager
- **Purpose:** Serve targeted advertisements to healthcare staff audience
- **Documentation:** https://developers.google.com/ad-manager
- **Base URL(s):** Handled via GPT tags
- **Authentication:** Publisher ID
- **Rate Limits:** N/A

**Key Endpoints Used:**
- Client-side GPT tags for ad serving

**Integration Notes:** Implement lazy loading for better performance, use responsive ad units
