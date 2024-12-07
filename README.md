# KILT-to-PLC DID Resolver

A permissionless extension to the AT Protocol ecosystem that enables interoperability between KILT and AT Protocol services. This resolver acts as a direct drop-in replacement for PLC directory, supporting both KILT and PLC DIDs.

## Features

- Drop-in replacement for PLC directory
- Resolves both KILT DIDs (`did:kilt:`) and PLC DIDs (`did:plc:`)
- Matches PLC directory's URL format exactly
- Maintains AT Protocol compatibility
- Supports KILT mainnet (Spiritnet) and testnet (Peregrine)
- No modifications required to AT Protocol servers or clients
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
# Run tests
npm test

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Documentation

- [API Documentation](docs/api.md) - API endpoints and integration guide
- [KILT to PLC DID Conversion](docs/kilt-plc-did-conversion.md) - Technical details about DID conversion

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

MIT
