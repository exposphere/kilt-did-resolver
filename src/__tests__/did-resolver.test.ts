// src/__tests__/did-resolver.test.ts
import { DidResolver } from '../services/DidResolver';
import { KiltDidResolver } from '../services/KiltDidResolver';
import nock from 'nock';
import { config } from '../config';
import { PlcDidDocument } from '../types';

describe('DID Resolver', () => {
  let resolver: DidResolver;
  let kiltResolver: KiltDidResolver;
  const mockPlcDid = 'did:plc:12345';
  const mockKiltDid = 'did:kilt:4rrkUrY8XFKtxFqyznYpNrUw7a6vjbPrfdxmQgqKiruNyUdi';

  beforeEach(() => {
    nock.cleanAll();
    kiltResolver = new KiltDidResolver('wss://mock-node');
    resolver = new DidResolver(kiltResolver);
  });

  afterEach(async () => {
    await resolver.disconnect();
  });

  test('should delegate KILT DIDs to KILT resolver', async () => {
    const mockDoc: PlcDidDocument = {
      id: mockKiltDid,
      alsoKnownAs: [],
      verificationMethod: [{
        id: `${mockKiltDid}#key-1`,
        type: 'Multikey',
        controller: mockKiltDid,
        publicKeyMultibase: 'z12345'
      }],
      authentication: [`${mockKiltDid}#key-1`],
      assertionMethod: [],
      capabilityInvocation: [],
      capabilityDelegation: [],
      keyAgreement: [],
      service: []
    };
    
    jest.spyOn(kiltResolver, 'resolveKiltDid').mockResolvedValue(mockDoc);

    const result = await resolver.resolveDid(mockKiltDid);
    expect(result).toEqual(mockDoc);
    expect(kiltResolver.resolveKiltDid).toHaveBeenCalledWith(mockKiltDid);
  });

  test('should resolve PLC DIDs directly', async () => {
    const mockDoc: PlcDidDocument = {
      id: mockPlcDid,
      alsoKnownAs: [],
      verificationMethod: [{
        id: `${mockPlcDid}#key-1`,
        type: 'Multikey',
        controller: mockPlcDid,
        publicKeyMultibase: 'z12345'
      }],
      authentication: [`${mockPlcDid}#key-1`],
      assertionMethod: [],
      capabilityInvocation: [],
      capabilityDelegation: [],
      keyAgreement: [],
      service: []
    };

    nock(config.plcResolver)
      .get(`/${mockPlcDid}`)
      .reply(200, mockDoc);

    const result = await resolver.resolveDid(mockPlcDid);
    expect(result).toEqual(mockDoc);
  });

  test('should reject invalid DID methods', async () => {
    await expect(resolver.resolveDid('did:invalid:123'))
      .rejects
      .toThrow('Unsupported DID method');
  });
});
