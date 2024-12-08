// src/services/__tests__/cache-manager.test.ts
import { DidCache } from '../services/CacheManager';
import { PlcDidDocument } from '../types';

describe('Cache Manager', () => {
  let cache: DidCache;

  beforeEach(() => {
    cache = new DidCache(60); // 60 second TTL
  });

  afterEach(async () => {
    await cache.clear();
    await cache.disconnect();
  });

  describe('Basic Operations', () => {
    const mockDoc: PlcDidDocument = {
      id: 'did:test:123',
      alsoKnownAs: [],
      verificationMethod: [],
      authentication: [],
      assertionMethod: [],
      capabilityInvocation: [],
      capabilityDelegation: [],
      keyAgreement: [],
      service: []
    };

    test('should set and get value', async () => {
      await cache.set('test-key', mockDoc);
      const result = await cache.get('test-key');
      expect(result).toEqual(mockDoc);
    });

    test('should return null for non-existent key', async () => {
      const result = await cache.get('non-existent');
      expect(result).toBeNull();
    });

    test('should delete value', async () => {
      await cache.set('test-key', mockDoc);
      await cache.del('test-key');
      const result = await cache.get('test-key');
      expect(result).toBeNull();
    });

    test('should clear all values', async () => {
      await cache.set('key1', mockDoc);
      await cache.set('key2', mockDoc);
      await cache.clear();
      
      const result1 = await cache.get('key1');
      const result2 = await cache.get('key2');
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });

    test('should respect TTL', async () => {
      const shortCache = new DidCache(0.1); // 100ms TTL
      await shortCache.set('test-key', mockDoc);
      
      // Should exist immediately
      let result = await shortCache.get('test-key');
      expect(result).toEqual(mockDoc);
      
      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should be null after expiry
      result = await shortCache.get('test-key');
      expect(result).toBeNull();

      await shortCache.disconnect();
    });
  });

  describe('Error Handling', () => {
    test('should handle uninitialized cache', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockCache = new DidCache();
      // @ts-ignore - Forcefully break cache for testing
      mockCache.cache = undefined;
      
      const result = await mockCache.get('key');
      expect(result).toBeNull();
      
      consoleErrorSpy.mockRestore();
    });

    test('should handle set operation errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockCache = new DidCache();
      // @ts-ignore - Forcefully break cache for testing
      mockCache.cache = {
        set: () => Promise.reject(new Error('Set failed'))
      };
      
      await expect(mockCache.set('key', {} as PlcDidDocument))
        .resolves
        .not
        .toThrow();
      
      consoleErrorSpy.mockRestore();
    });

    test('should handle delete operation errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockCache = new DidCache();
      // @ts-ignore - Forcefully break cache for testing
      mockCache.cache = {
        del: () => Promise.reject(new Error('Delete failed'))
      };
      
      await expect(mockCache.del('key'))
        .resolves
        .not
        .toThrow();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Initialization', () => {
    test('should initialize with custom TTL', async () => {
      const customTTLCache = new DidCache(120);
      const mockDoc: PlcDidDocument = {
        id: 'did:test:123',
        alsoKnownAs: [],
        verificationMethod: [],
        authentication: [],
        assertionMethod: [],
        capabilityInvocation: [],
        capabilityDelegation: [],
        keyAgreement: [],
        service: []
      };

      await customTTLCache.set('test-key', mockDoc);
      const result = await customTTLCache.get('test-key');
      expect(result).toEqual(mockDoc);

      await customTTLCache.disconnect();
    });
  });
});