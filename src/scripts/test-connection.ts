import { connect } from '@kiltprotocol/sdk-js';
import { ApiPromise, WsProvider } from '@polkadot/api';
import dotenv from 'dotenv';
import { KiltDidResolver } from '../services/KiltDidResolver';

dotenv.config();

async function testConnection() {
  try {
    const nodeUrl = process.env.KILT_NODE_URL;
    if (!nodeUrl) {
      throw new Error('KILT_NODE_URL environment variable is not set');
    }

    console.log('Connecting to KILT node:', nodeUrl);
    
    // Connect using polkadot API directly for chain information
    const provider = new WsProvider(nodeUrl);
    const api = await ApiPromise.create({ provider });

    // Connect KILT SDK
    await connect(nodeUrl);
    
    // Get chain information
    const [chain, nodeName, nodeVersion] = await Promise.all([
      api.rpc.system.chain(),
      api.rpc.system.name(),
      api.rpc.system.version()
    ]);
    
    console.log('🟢 Connected successfully!');
    console.log('Chain:', chain.toString());
    console.log('Node name:', nodeName.toString());
    console.log('Node version:', nodeVersion.toString());

    // Test with "kit" web3 name DID
    const web3nameDid = 'did:kilt:4qZSoAZFjW4MqfNUpkCb2N2qYyxwZC9Fu6vxAbdp4DxuKJnh';
    console.log('\nTrying to resolve the w3n:kit test DID:', web3nameDid);
    const resolver = await KiltDidResolver.getInstance();
    const resolved = await resolver.resolveKiltDid(web3nameDid);
    
    if (resolved) {
      console.log('Resolved DID document:', JSON.stringify(resolved, null, 2));
      console.log('\nVerification methods:', resolved.verificationMethod?.length || 0);
      console.log('Services:', resolved.service?.length || 0);
    } else {
      console.log('DID not found or could not be resolved');
    }

    await api.disconnect();
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    process.exit(0);
  }
}

testConnection();