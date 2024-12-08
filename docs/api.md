# API Documentation

## DID Resolution

### Resolve DID
```http
GET /:did
```

Direct DID resolution endpoint that matches PLC directory's format exactly. Supports both KILT and PLC DIDs with efficient caching.

### Examples

```bash
# KILT DID Resolution
curl -v http://localhost:3000/did:kilt:4sGYUHba7eKksK2izguJsEanMjuu9ne3BsWDG6Vf9MTTt8Db

# PLC DID Resolution
curl -v http://localhost:3000/did:plc:ewvi7nxzyoun6zhxrhs64oiz

# Health Check
curl -v http://localhost:3000/health
```

### Response Format
```typescript
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/multikey/v1"
  ],
  "id": "did:...",
  "alsoKnownAs": [],
  "verificationMethod": [{
    "id": "did:...#key-1",
    "type": "Multikey",
    "controller": "did:...",
    "publicKeyMultibase": "z..."
  }],
  "authentication": ["did:...#key-1"],
  "assertionMethod": [],
  "capabilityInvocation": [],
  "capabilityDelegation": [],
  "keyAgreement": [],
  "service": [{
    "id": "#service-1",
    "type": "ServiceType",
    "serviceEndpoint": "https://..."
  }]
}
```

### Error Responses

Invalid DID (400):
```json
{
  "error": "Invalid DID format",
  "message": "DID must start with did:kilt: or did:plc:"
}
```

DID Not Found (404):
```json
{
  "error": "DID not found",
  "message": "The specified DID could not be resolved"
}
```

Rate Limit Exceeded (429):
```json
{
  "error": "Too many requests",
  "message": "Please try again later"
}
```

Server Error (500):
```json
{
  "error": "Internal server error",
  "message": "An error occurred while processing the request"
}
```

## Security Features

### Rate Limiting
- Default: 100 requests per 15-minute window per IP
- Configurable via environment variables
- Returns 429 status code when exceeded
- Includes standard rate limit headers:
  - `RateLimit-Limit`
  - `RateLimit-Remaining`
  - `RateLimit-Reset`

### Security Headers
All responses include secure headers configured via Helmet:
- Content Security Policy (CSP)
- Cross-Origin protections
- DNS prefetch control
- Frame protection (deny)
- HSTS
- XSS protection
- And more...

### Monitoring

#### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "ok"
}
```
