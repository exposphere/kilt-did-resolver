# API Documentation

## DID Resolution

### Resolve DID
```http
GET /:did
```

Direct DID resolution endpoint that matches PLC directory's format. Supports both KILT and PLC DIDs.

#### Examples

KILT DID:
```bash
curl http://localhost:3000/did:kilt:4sGYUHba7eKksK2izguJsEanMjuu9ne3BsWDG6Vf9MTTt8Db
```

PLC DID:
```bash
curl http://localhost:3000/did:plc:ewvi7nxzyoun6zhxrhs64oiz
```

#### Response Format
```typescript
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/multikey/v1"
  ],
  "id": "did:...",
  "verificationMethod": [{
    "id": "did:...#key-1",
    "type": "Multikey",
    "controller": "did:...",
    "publicKeyMultibase": "z..."
  }],
  "authentication": ["did:...#key-1"],
  "service": [{
    "id": "#service-1",
    "type": "ServiceType",
    "serviceEndpoint": "https://..."
  }],
  "alsoKnownAs": ["at://..."]
}
```

#### Error Responses

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

Server Error (500):
```json
{
  "error": "Internal server error",
  "message": "An error occurred while processing the request"
}
```

## Integration with AT Protocol

### Client Configuration
Use this resolver as a direct replacement for PLC directory:

```typescript
const client = new AtpClient({
  service: {
    didResolver: 'https://your-resolver.com'  // No path needed
  }
});
```

### Environment Configuration
```env
# KILT Network (choose one)
KILT_NODE_URL=wss://spiritnet.kilt.io        # KILT mainnet (Spiritnet)
KILT_NODE_URL=wss://peregrine.kilt.io        # KILT testnet (Peregrine)

# PLC Resolver (for proxying PLC DIDs)
PLC_RESOLVER=https://plc.directory

# Server Configuration
PORT=3000
```
