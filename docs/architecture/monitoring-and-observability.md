# Monitoring and Observability

## Monitoring Stack

- **Frontend Monitoring:** Sentry for React
- **Backend Monitoring:** Convex built-in logging + Sentry
- **Error Tracking:** Sentry with source maps
- **Performance Monitoring:** Web Vitals + Sentry Performance

## Key Metrics

**Frontend Metrics:**
- Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- JavaScript errors per session
- API response times
- User interactions (clicks, form submissions)

**Backend Metrics:**
- Request rate by function
- Error rate by function
- Response time p50/p95/p99
- Database query performance
- AI generation time and success rate
