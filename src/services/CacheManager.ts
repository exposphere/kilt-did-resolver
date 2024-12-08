// src/services/CacheManager.ts
import { createCache } from 'cache-manager';
import { Keyv } from 'keyv';
import { PlcDidDocument } from '../types';

// Infer the cache type from createCache return value
type CacheInstance = Awaited<ReturnType<typeof createCache>>;

export class DidCache {
  private cache: CacheInstance | undefined;
  
  constructor(ttlSeconds: number = 3600) {
    this.initCache(ttlSeconds);
  }

  private async initCache(ttlSeconds: number): Promise<void> {
    // Create a memory-based Keyv store
    const memoryStore = new Keyv();
    
    // Create cache manager instance
    this.cache = await createCache({
      ttl: ttlSeconds * 1000,
      stores: [memoryStore]
    });
  }

  async get(did: string): Promise<PlcDidDocument | null> {
    try {
      if (!this.cache) {
        await this.waitForCache();
      }
      return await this.cache!.get<PlcDidDocument>(did);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(did: string, document: PlcDidDocument): Promise<void> {
    try {
      if (!this.cache) {
        await this.waitForCache();
      }
      await this.cache!.set(did, document);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(did: string): Promise<void> {
    try {
      if (!this.cache) {
        await this.waitForCache();
      }
      await this.cache!.del(did);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      if (!this.cache) {
        await this.waitForCache();
      }
      await this.cache!.clear();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  private async waitForCache(timeout: number = 5000): Promise<void> {
    const start = Date.now();
    while (!this.cache && Date.now() - start < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (!this.cache) {
      throw new Error('Cache initialization timeout');
    }
  }

  // Clean up resources
  async disconnect(): Promise<void> {
    if (this.cache) {
      await this.cache.disconnect();
    }
  }
}
