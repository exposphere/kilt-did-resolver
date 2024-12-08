# KILT-to-PLC DID Resolver

A permissionless extension to the AT Protocol ecosystem that enables KILT DIDs in AT Protocol services. Acts as a drop-in replacement for PLC directory, resolving both KILT and PLC DIDs.

## Features

- Drop-in replacement for PLC directory
- Resolves both KILT DIDs (`did:kilt:`) and PLC DIDs (`did:plc:`)
- Matches PLC directory's URL format exactly
- Maintains AT Protocol compatibility
- Supports KILT mainnet (Spiritnet) and testnet (Peregrine)
- No modifications required to AT Protocol servers or clients
- Built-in security features:
  - Rate limiting
  - Security headers
  - Cross-origin protection
- In-memory caching
- Health monitoring
- Fully typed TypeScript implementation

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cat > .env << EOL
KILT_NODE_URL=wss://spiritnet.kilt.io
PLC_RESOLVER=https://plc.directory
PORT=3000
CACHE_TTL_SECONDS=3600
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOL

# Start the server
npm run dev

# Test KILT resolution
curl http://localhost:3000/did:kilt:4sGYUHba7eKksK2izguJsEanMjuu9ne3BsWDG6Vf9MTTt8Db | jq . 

# Test PLC resolution
curl http://localhost:3000/did:plc:ewvi7nxzyoun6zhxrhs64oiz | jq . 
```

## Network Configuration

### KILT Networks

#### Spiritnet (Mainnet)
- WebSocket URL: `wss://spiritnet.kilt.io/parachain-public-ws`
- Block Explorer: [KILT Spiritnet](https://spiritnet.subscan.io/)
- Status: Production network
- Usage: Real DIDs and credentials

#### Peregrine (Testnet)
- WebSocket URL: `wss://peregrine.kilt.io/parachain-public-ws`
- Block Explorer: [KILT Peregrine](https://peregrine.subscan.io/)
- Faucet: [Peregrine Faucet](https://faucet.peregrine.kilt.io/)
- Status: Test network
- Usage: Development and testing

### PLC Configuration
- Default Resolver: `https://plc.directory`
- Status: Production service
- Usage: AT Protocol DID resolution

## Development

```bash
# Testing
npm test                  # Run all tests
npm run test:coverage     # Run tests with coverage
npm run test:watch        # Watch mode for tests

# Server
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server

# Diagnostics
npm run test:connection  # Test KILT node connectivity
npm run test:plc         # Test PLC resolver connectivity
npm run list-dids        # List available DIDs on KILT chain
```

## Documentation

- [API Documentation](docs/api.md)
- [KILT to PLC DID Conversion](docs/kilt-plc-did-conversion.md)

## Docker

Supports both ARM64 and x86_64 architectures.

### Build and Run Locally

```bash
# Build for your current platform
docker build -t kilt-did-resolver .

# Run container with resource limits
docker run -d \
  --name kilt-did-resolver \
  --restart unless-stopped \
  --cpus 1 \
  --memory 1g \
  -p 3000:3000 \
  -e KILT_NODE_URL=wss://spiritnet.kilt.io \
  -e PLC_RESOLVER=https://plc.directory \
  kilt-did-resolver
```

### Multi-arch Build

Build for multiple architectures using Docker BuildKit:

```bash
# Create builder instance
docker buildx create --name multiarch --driver docker-container --use

# Build and push multi-arch images
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t your-registry/kilt-did-resolver:latest \
  --push \
  .

# Or build locally without pushing
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t kilt-did-resolver:latest \
  --load \
  .
```

### Check Image Details
```bash
# View supported architectures
docker manifest inspect your-registry/kilt-did-resolver:latest
```

## License

MIT
