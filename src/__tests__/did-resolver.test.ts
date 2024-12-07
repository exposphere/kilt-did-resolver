import nock from 'nock';
import { DidResolver } from '../services/DidResolver';
import { KiltDidResolver } from '../services/KiltDidResolver';
import { config } from '../config';

describe('DID Resolver', () => {
  let resolver: DidResolver;
  const mockPlcDid = 'did:plc:12345';

  beforeEach(() => {
    nock.cleanAll(); // Clear all Nock interceptors
    const kiltResolver = new KiltDidResolver('wss://mock-node');
    resolver = new DidResolver(kiltResolver);
  });

  describe('PLC Resolution', () => {
    test('should resolve PLC DIDs', async () => {
      const mockPlcDoc = {
        id: mockPlcDid,
        verificationMethod: [],
        authentication: [],
        assertionMethod: [],
        capabilityInvocation: [],
        capabilityDelegation: [],
        keyAgreement: [],
        service: [],
        alsoKnownAs: []
      };

      // Mock PLC resolver response
      nock(config.plcResolver)
        .get(`/${mockPlcDid}`)
        .reply(200, mockPlcDoc);

      const result = await resolver.resolveDid(mockPlcDid);
      expect(result).toEqual(mockPlcDoc);
    });

    test('should handle PLC not found', async () => {
      nock(config.plcResolver)
        .get(`/${mockPlcDid}`)
        .reply(404);

      await expect(resolver.resolveDid(mockPlcDid))
        .rejects
        .toThrow('DID not found');
    });

    test('should handle PLC resolution failures', async () => {
      nock(config.plcResolver)
        .get(`/${mockPlcDid}`)
        .reply(500);

      await expect(resolver.resolveDid(mockPlcDid))
        .rejects
        .toThrow('PLC resolution failed');
    });
  });
});
