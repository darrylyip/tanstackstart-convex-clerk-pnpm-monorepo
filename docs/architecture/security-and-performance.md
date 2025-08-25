# Security and Performance

## Security Requirements

**Frontend Security:**
- CSP Headers: `default-src 'self'; script-src 'self' 'unsafe-inline' clerk.com convex.cloud`
- XSS Prevention: React's automatic escaping + input sanitization
- Secure Storage: Sensitive data only in httpOnly cookies

**Backend Security:**
- Input Validation: Zod schemas on all Convex functions
- Rate Limiting: Cloudflare Workers rate limiting (100 req/min per IP)
- CORS Policy: Restricted to *.vectr0.com origins

**Authentication Security:**
- Token Storage: Clerk handles secure token management
- Session Management: 7-day sliding sessions with refresh
- Password Policy: Enforced by Clerk (min 8 chars, complexity requirements)

## Performance Optimization

**Frontend Performance:**
- Bundle Size Target: < 200KB initial JS
- Loading Strategy: Code splitting by route, lazy loading for charts
- Caching Strategy: Service worker for offline schedule viewing

**Backend Performance:**
- Response Time Target: < 100ms p95 for queries
- Database Optimization: Convex indexes on all query patterns
- Caching Strategy: Convex automatic query caching
