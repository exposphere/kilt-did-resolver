import axios, { AxiosError } from 'axios';
import { config } from '../config';
import { KiltDidResolver } from './KiltDidResolver';
import { DidCache } from './CacheManager';
import { PlcDidDocument } from '../types';

export class DidResolver {
  private cache: DidCache;

  constructor(
    private kiltResolver: KiltDidResolver,
    ttlSeconds: number = 10 // Default TTL of 10 seconds
  ) {
    this.cache = new DidCache(ttlSeconds);
  }

  async resolveDid(did: string): Promise<PlcDidDocument> {
    // Try cache first
    const cached = await this.cache.get(did);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, resolve and cache
    const result = await this._resolveDid(did);
    await this.cache.set(did, result);
    return result;
  }

  private async _resolveDid(did: string): Promise<PlcDidDocument> {
    if (did.startsWith('did:plc:')) {
      try {
        const response = await axios.get<PlcDidDocument>(`${config.plcResolver}/${did}`, {
          headers: {
            'Accept': 'application/json'
          }
        });

        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const axiosError = err as AxiosError;
          console.error('PLC resolver error:', {
            status: axiosError.response?.status,
            statusText: axiosError.response?.statusText,
            data: axiosError.response?.data
          });
          
          if (axiosError.response?.status === 404) {
            throw new Error('DID not found');
          }
          throw new Error(`PLC resolution failed: ${err.message}`);
        }
        throw new Error(`Unexpected error during PLC resolution: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    if (did.startsWith('did:kilt:')) {
      return this.kiltResolver.resolveKiltDid(did);
    }

    throw new Error('Unsupported DID method');
  }

  async disconnect(): Promise<void> {
    await this.cache.disconnect();
  }
}
