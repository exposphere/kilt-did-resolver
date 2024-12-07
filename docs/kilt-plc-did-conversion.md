# KILT to PLC DID Conversion Rules

## Overview
This document describes the rules for converting KILT DIDs to PLC-compatible DIDs. The conversion maintains the cryptographic material while adapting it to the PLC format used by the AT Protocol.

## DID Document Formats

### KILT DID Document Structure
```typescript
{
  authenticationKey: string;        // Key for authentication
  keyAgreementKeys: string[];      // Keys for encryption
  delegationKey?: string;          // Optional key for delegation
  attestationKey?: string;         // Optional key for attestation
  publicKeys: {
    [keyId: string]: {
      key: {
        PublicVerificationKey?: {
          Sr25519: string;
          Ed25519: string;
        };
        PublicEncryptionKey?: {
          X25519: string;
        };
      };
    };
  };
}
```

### PLC DID Document Structure
```typescript
{
  id: string;                      // Full DID URL
  alsoKnownAs: string[];          // Alternative identifiers
  verificationMethod: Array<{      // All public keys
    id: string;                    // Key identifier
    type: string;                  // Always "Multikey" for PLC
    controller: string;            // DID that controls this key
    publicKeyMultibase: string;    // Key in multibase format
  }>;
  authentication: string[];        // References to auth keys
  assertionMethod: string[];       // References to assertion keys
  capabilityInvocation: string[]; 
  capabilityDelegation: string[]; 
  keyAgreement: string[];         // References to encryption keys
  service: Array<{                // Service endpoints
    id: string;
    type: string;
    serviceEndpoint: string;
  }>;
}
```

## Conversion Rules

### 1. DID Identifier
- KILT DID format: `did:kilt:<address>`
- PLC DID format: `did:kilt:<address>` (unchanged)
- Example:
  ```
  did:kilt:4sGYUHba7eKksK2izguJsEanMjuu9ne3BsWDG6Vf9MTTt8Db
  ```

### 2. Verification Methods
Each KILT key is converted to a verification method with:
- ID: `{did}#{purpose}`, where purpose is one of:
  - `auth` for authentication keys
  - `key-{index}` for key agreement keys
  - `delegation` for delegation keys
  - `attestation` for attestation keys
- Type: Always `"Multikey"` in PLC format
- Controller: Set to the DID itself
- Public Key: Converted to multibase format with 'z' prefix

Example:
```typescript
// KILT Format
{
  authenticationKey: "0xd91c11b7...",
  publicKeys: {
    "0xd91c11b7...": {
      key: {
        PublicVerificationKey: {
          Sr25519: "0xc08ee9dc..."
        }
      }
    }
  }
}

// Converts to PLC Format
{
  verificationMethod: [{
    id: "did:kilt:4sGY...#auth",
    type: "Multikey",
    controller: "did:kilt:4sGY...",
    publicKeyMultibase: "zc08ee9dc..."
  }]
}
```

### 3. Key Relationships
KILT keys are mapped to PLC relationships:
- `authenticationKey` → `authentication[]`
- `keyAgreementKeys` → `keyAgreement[]`
- `delegationKey` → `capabilityDelegation[]`
- `attestationKey` → `assertionMethod[]`

Each relationship references the corresponding verification method by ID.

### 4. Key Type Mapping
KILT's key types are converted to PLC's Multikey format:
- `Sr25519` → `Multikey`
- `Ed25519` → `Multikey`
- `X25519` → `Multikey`

### 5. Public Key Format
- KILT format: Hex string with optional '0x' prefix
- PLC format: Multibase string with 'z' prefix
- Conversion: Remove '0x' prefix (if present) and add 'z' prefix

Example:
```
KILT:  "0x1234abcd..."
PLC:   "z1234abcd..."
```

## Usage Example
```typescript
// Original KILT DID Document
{
  authenticationKey: "0xd91c11b7...",
  keyAgreementKeys: ["0x80aeda96..."],
  publicKeys: {
    "0xd91c11b7...": {
      key: {
        PublicVerificationKey: {
          Sr25519: "0xc08ee9dc..."
        }
      }
    },
    "0x80aeda96...": {
      key: {
        PublicEncryptionKey: {
          X25519: "0x78777c8d..."
        }
      }
    }
  }
}

// Converted PLC DID Document
{
  id: "did:kilt:4sGY...",
  alsoKnownAs: [],
  verificationMethod: [
    {
      id: "did:kilt:4sGY...#auth",
      type: "Multikey",
      controller: "did:kilt:4sGY...",
      publicKeyMultibase: "zc08ee9dc..."
    },
    {
      id: "did:kilt:4sGY...#key-0",
      type: "Multikey",
      controller: "did:kilt:4sGY...",
      publicKeyMultibase: "z78777c8d..."
    }
  ],
  authentication: ["did:kilt:4sGY...#auth"],
  keyAgreement: ["did:kilt:4sGY...#key-0"],
  assertionMethod: [],
  capabilityInvocation: [],
  capabilityDelegation: [],
  service: []
}
```

## Validation Rules
1. All KILT keys must be valid hex strings
2. Key references must exist in the publicKeys object
3. Key types must be supported (Sr25519, Ed25519, X25519)
4. Generated DID document must conform to PLC format requirements
