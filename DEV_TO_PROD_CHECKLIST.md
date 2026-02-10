# Development to Production Migration Checklist

This document outlines all development-only features and configurations that must be replaced, secured, or removed before deploying to production.

## ⚠️ CRITICAL - Security & Authentication

### 1. Mock Authentication System
**Location:** `server/src/controllers/authController.ts`, `client/src/pages/LoginPage.tsx`

**Current State (DEV):**
- Mock authentication accepts any username/role combination
- No password verification
- No real identity provider integration
- Returns `authMode: 'mock'` in session responses (line 107)

**Required for Production:**
- [ ] Integrate with IDAM (Microsoft Entra ID / Azure AD B2C)
- [ ] Implement OAuth2/OIDC authentication flow
- [ ] Add multi-factor authentication (MFA)
- [ ] Remove mock auth endpoints entirely
- [ ] Change `authMode` to production identity provider name
- [ ] Implement proper session invalidation
- [ ] Add session timeout mechanisms

**Files to Replace:**
- `server/src/controllers/authController.ts` - Replace entire auth logic
- `client/src/pages/LoginPage.tsx` - Replace with IDAM redirect flow
- `server/src/services/sessionService.ts` - Add production session security

### 2. Hardcoded Court Assignment
**Location:** `client/src/pages/LoginPage.tsx:44`

**Current State:**
```typescript
const courtAssignment = role === 'HMCTS_CASE_OFFICER' ? 'Family Court at Brighton' : undefined;
```

**Required for Production:**
- [ ] Remove hardcoded 'Family Court at Brighton' value
- [ ] Fetch court assignment from IDAM claims/user profile
- [ ] Validate court assignments against authoritative court registry
- [ ] Implement court assignment management UI for admins

---

## 🗄️ Data Storage & Persistence

### 3. In-Memory Data Storage
**Location:** `server/src/repositories/caseRepository.ts:18-21`, `server/src/repositories/documentRepository.ts`

**Current State:**
```typescript
const cases: Map<string, Case> = new Map();
const assignments: Map<string, CaseAssignment> = new Map();
const auditLogs: Map<string, AuditLogEntry[]> = new Map();
```

**Required for Production:**
- [ ] Replace all Map-based storage with PostgreSQL queries
- [ ] Implement database migrations (files exist in `server/migrations/`)
- [ ] Run migrations: `npm run migrate:up --workspace=server`
- [ ] Add database connection pooling configuration
- [ ] Implement proper transaction handling
- [ ] Add database query logging for audit
- [ ] Configure database backups and retention policies
- [ ] Test data recovery procedures

**Files to Rewrite:**
- `server/src/repositories/caseRepository.ts` - Use pg queries instead of Map
- `server/src/repositories/documentRepository.ts` - Implement database persistence

### 4. Local File Storage
**Location:** `server/src/config/storage.ts:13-40`

**Current State:**
- Documents stored in local `./uploads` directory
- No encryption at rest
- No disaster recovery

**Required for Production:**
- [ ] Switch to `AzureBlobStorageAdapter` (already implemented, lines 42-83)
- [ ] Configure Azure Storage Account connection string
- [ ] Set environment variable: `AZURE_STORAGE_CONNECTION_STRING`
- [ ] Set environment variable: `AZURE_STORAGE_CONTAINER_NAME`
- [ ] Enable encryption at rest in Azure Storage
- [ ] Configure geo-redundant storage (GRS) for disaster recovery
- [ ] Implement storage lifecycle policies (retention, archival)
- [ ] Configure storage firewall rules

**Environment Variables:**
```bash
STORAGE_TYPE=azure  # Change from 'local'
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=..."
AZURE_STORAGE_CONTAINER_NAME="adoption-documents"
```

### 5. Redis Queue Configuration
**Location:** `server/src/config/queue.ts:10-13`

**Current State:**
```typescript
redis: {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
}
```

**Required for Production:**
- [ ] Provision Azure Cache for Redis
- [ ] Configure TLS/SSL connection
- [ ] Set `REDIS_HOST` to Azure Redis hostname
- [ ] Set `REDIS_PASSWORD` for authentication
- [ ] Enable Redis persistence (AOF or RDB)
- [ ] Configure connection timeouts and retry strategies
- [ ] Monitor queue depth and processing times

---

## 🔒 Security Hardening

### 6. Session Configuration
**Location:** `server/src/middleware/sessionMiddleware.ts`

**Review Required:**
- [ ] Ensure `SESSION_SECRET` is cryptographically random (32+ bytes)
- [ ] Set `cookie.secure: true` (HTTPS only)
- [ ] Set `cookie.sameSite: 'strict'` or 'lax'
- [ ] Configure appropriate `cookie.maxAge` (current: 24 hours)
- [ ] Use Redis for session store (not in-memory)
- [ ] Enable session rotation on privilege elevation

### 7. CORS Configuration
**Location:** `server/src/config/index.ts:11`

**Current State:**
```typescript
corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000']
```

**Required for Production:**
- [ ] Set `CORS_ORIGINS` to production domain only
- [ ] Example: `https://adoption.service.gov.uk`
- [ ] Remove localhost from allowed origins
- [ ] Validate origin header on all requests
- [ ] Consider disabling CORS if client and server share same domain

### 8. Content Security Policy
**Location:** `server/src/app.ts:32-44`

**Current State:**
- Allows `'unsafe-inline'` and `'unsafe-eval'` for scripts

**Required for Production:**
- [ ] Remove `'unsafe-inline'` and `'unsafe-eval'` from `scriptSrc`
- [ ] Use nonce-based CSP for inline scripts
- [ ] Restrict `connectSrc` to specific API endpoints
- [ ] Add report-uri for CSP violation monitoring
- [ ] Test all pages with strict CSP before deployment

### 9. Mock Services
**Location:** `server/src/config/antivirus.ts:5-21`

**Current State:**
```typescript
class MockAntivirusService implements AntivirusService {
  async scanFile(filePath: string): Promise<ScanResult> {
    return { isClean: true, threats: [] }; // ALWAYS CLEAN - NOT SAFE
  }
}
```

**Required for Production:**
- [ ] Replace with real ClamAV implementation
- [ ] Configure ClamAV daemon connection
- [ ] Set `CLAMAV_HOST` and `CLAMAV_PORT` environment variables
- [ ] Implement file quarantine procedures
- [ ] Add alerting for detected threats
- [ ] Test virus detection with EICAR test file

---

## 🧪 Development Tools to Remove

### 10. Prototype Annotator
**Location:** `server/src/app.ts:100-190`, `client/vite.config.ts:4-25`

**Current State:**
- Annotator overlay injected in all HTML responses
- SQLite database for annotations in `./prototype-annotator/`
- API routes at `/__prototype-annotator/*`

**Required for Production:**
- [ ] Remove annotator middleware from `server/src/app.ts`
- [ ] Remove annotator plugin from `client/vite.config.ts`
- [ ] Delete `packages/prototype-annotator` directory
- [ ] Remove from CSP `scriptSrc` and `connectSrc`
- [ ] Remove `ANNOTATION_ENABLED` environment variable

**Files to Modify:**
- `server/src/app.ts` - Remove lines 100-190 (annotator setup)
- `client/vite.config.ts` - Remove lines 4-25 (annotator plugin)

### 11. Mock Auth Warning Banners
**Location:** Multiple pages

**Files to Clean:**
- `client/src/pages/DashboardPage.tsx:217-225` - Remove mock auth banner
- `client/src/pages/MyCasesPage.tsx:155-163` - Remove mock auth banner
- `client/src/pages/LoginPage.tsx:76-82` - Remove warning text

---

## 📊 Monitoring & Observability

### 12. Logging
**Current State:**
- Console.log statements only
- No structured logging
- No log aggregation

**Required for Production:**
- [ ] Implement structured logging (Winston, Pino, or Azure App Insights)
- [ ] Configure log levels (ERROR, WARN, INFO, DEBUG)
- [ ] Send logs to Azure Application Insights
- [ ] Add correlation IDs for request tracing
- [ ] Log all authentication events
- [ ] Log all case status changes
- [ ] Redact sensitive data from logs (PII, passwords)
- [ ] Configure log retention policies

### 13. Application Monitoring
**Required for Production:**
- [ ] Enable Azure Application Insights
- [ ] Configure custom metrics (case creation rate, login failures)
- [ ] Set up availability tests (synthetic monitoring)
- [ ] Create alerts for error rates, response times
- [ ] Monitor database connection pool exhaustion
- [ ] Track API endpoint performance
- [ ] Monitor Redis queue depth

---

## 🌍 Environment Configuration

### 14. Environment Variables
**Current Development Defaults:**
```bash
NODE_ENV=development
DATABASE_URL=postgresql://adoption:adoption@localhost:5432/adoption
REDIS_HOST=localhost
CORS_ORIGINS=http://localhost:3000
```

**Production Environment Variables Required:**
```bash
# Core
NODE_ENV=production
APP_ENV=PROD
PORT=8080

# Database
PROD_DATABASE_URL=postgresql://user:pass@prod-db.postgres.database.azure.com:5432/adoption?sslmode=require

# Redis
REDIS_HOST=prod-redis.redis.cache.windows.net
REDIS_PORT=6380
REDIS_PASSWORD=<secret>
REDIS_TLS=true

# Storage
STORAGE_TYPE=azure
AZURE_STORAGE_CONNECTION_STRING=<secret>
AZURE_STORAGE_CONTAINER_NAME=adoption-documents

# Security
SESSION_SECRET=<cryptographically-random-32-byte-value>
CORS_ORIGINS=https://adoption.service.gov.uk

# Virus Scanning
CLAMAV_HOST=clamav-service
CLAMAV_PORT=3310

# Monitoring
APPLICATIONINSIGHTS_CONNECTION_STRING=<secret>

# Feature Flags
ANNOTATION_ENABLED=false
```

### 15. Database Migrations
**Location:** `server/migrations/*.sql`

**Required for Production:**
- [ ] Review all migration files
- [ ] Test migrations on staging database
- [ ] Run migrations: `npm run migrate:up --workspace=server`
- [ ] Verify data integrity after migrations
- [ ] Create migration rollback plan
- [ ] Document migration order and dependencies

---

## 🔐 Secrets Management

### 16. Azure Key Vault Integration
**Currently:** Secrets in environment variables

**Required for Production:**
- [ ] Create Azure Key Vault
- [ ] Store all secrets in Key Vault:
  - Database connection strings
  - Redis password
  - Azure Storage connection string
  - Session secret
  - Application Insights instrumentation key
- [ ] Configure App Service to reference Key Vault
- [ ] Use Managed Identity for Key Vault access
- [ ] Rotate secrets regularly
- [ ] Audit secret access

**Example Key Vault Reference:**
```bash
DATABASE_URL=@Microsoft.KeyVault(VaultName=cft-adoption-vault;SecretName=prod-database-url)
```

---

## 🧪 Testing Before Production

### 17. Pre-Production Checklist
- [ ] Run all unit tests: `npm test`
- [ ] Run all integration tests
- [ ] Perform security scanning (OWASP ZAP, SonarQube)
- [ ] Load testing (Apache JMeter, k6)
- [ ] Penetration testing by security team
- [ ] Accessibility audit (WCAG 2.1 AA compliance)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness testing
- [ ] Session timeout testing
- [ ] Database failover testing
- [ ] Backup and restore testing

---

## 📋 Summary by Priority

### P0 - Must Fix Before Production (Security Critical)
1. ✅ Replace mock authentication with IDAM
2. ✅ Replace in-memory storage with PostgreSQL
3. ✅ Configure production session secrets
4. ✅ Enable HTTPS-only cookies
5. ✅ Replace mock antivirus with real ClamAV
6. ✅ Remove prototype annotator
7. ✅ Switch to Azure Blob Storage

### P1 - Must Fix Before Production (Operational)
8. ✅ Configure production CORS origins
9. ✅ Set up Application Insights monitoring
10. ✅ Configure Redis with TLS
11. ✅ Run database migrations
12. ✅ Remove hardcoded court assignment

### P2 - Should Fix Before Production (Best Practices)
13. ✅ Implement structured logging
14. ✅ Tighten Content Security Policy
15. ✅ Set up Azure Key Vault
16. ✅ Remove mock auth warning banners

---

## 🚀 Deployment Steps

1. **Staging Environment:** Deploy with production-like config, run full test suite
2. **Security Review:** Have security team review authentication, authorization, data protection
3. **Performance Testing:** Load test to verify scalability
4. **Blue-Green Deployment:** Deploy to production with zero-downtime strategy
5. **Monitoring:** Watch Application Insights for errors in first 24 hours
6. **Rollback Plan:** Document rollback procedure and test it

---

## 📞 Support Contacts

- **Azure Support:** [Azure Portal Support](https://portal.azure.com)
- **IDAM/Authentication:** [Contact IDAM team]
- **Database Admin:** [Contact DBA team]
- **Security Team:** [Contact security team]

---

**Last Updated:** 2026-02-10  
**Document Owner:** Development Team  
**Review Frequency:** Before each production deployment
