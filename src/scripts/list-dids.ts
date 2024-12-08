import { connect } from '@kiltprotocol/sdk-js';
import { ApiPromise, WsProvider } from '@polkadot/api';
import dotenv from 'dotenv';

dotenv.config();

async function listDids() {
  try {
    const nodeUrl = process.env.KILT_NODE_URL;
    if (!nodeUrl) {
      throw new Error('KILT_NODE_URL environment variable is not set');
    }

    console.log('Connecting to KILT node:', nodeUrl);
    
    const provider = new WsProvider(nodeUrl);
    const api = await ApiPromise.create({ provider });
    await connect(nodeUrl);
    
    console.log('\nQuerying DIDs...');
    const didEntries = await api.query.did.did.entries();
    
    console.log('\nFound DIDs on chain:');
    for (const [key, value] of didEntries.slice(0, 10)) {
      const didIdentifier = key.args[0].toString();
      console.log(`DID: did:kilt:${didIdentifier}`);
      console.log('Details:', JSON.stringify(value.toHuman(), null, 2));
      console.log('---');
    }

    console.log(`\nTotal DIDs found: ${didEntries.length}`);
    await api.disconnect();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

listDids();
