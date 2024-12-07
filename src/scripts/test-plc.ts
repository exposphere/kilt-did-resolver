import { KiltDidResolver } from '../services/KiltDidResolver';
import { DidResolver } from '../services/DidResolver';

async function testPlcResolution() {
  try {
    const kiltResolver = new KiltDidResolver();
    const resolver = new DidResolver(kiltResolver);
    
    // Test with your PLC DID
    const did = 'did:plc:ewvi7nxzyoun6zhxrhs64oiz';
    console.log('Resolving DID:', did);
    
    const result = await resolver.resolveDid(did);
    console.log('Resolution result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testPlcResolution();