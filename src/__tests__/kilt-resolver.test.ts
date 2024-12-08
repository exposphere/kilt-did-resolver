// src/__tests__/kilt-resolver.test.ts
import { KiltDidResolver, ServerError, ResolutionError } from '../services/KiltDidResolver';
import { resolve } from '@kiltprotocol/did';

jest.mock('@kiltprotocol/did', () => ({
  resolve: jest.fn(),
}));

describe('KiltDidResolver', () => {
  let resolver: KiltDidResolver;
  const mockKiltDid = 'did:kilt:4sGYUHba7eKksK2izguJsEanMjuu9ne3BsWDG6Vf9MTTt8Db';
  const mockKiltDocument = {
    alsoKnownAs: [],
    verificationMethod: [
      {
        id: `${mockKiltDid}#key-1`,
        type: 'Multikey',
        controller: mockKiltDid,
        publicKeyMultibase: 'z12345',
      },
    ],
    authentication: [`${mockKiltDid}#key-1`],
    assertionMethod: [],
    capabilityInvocation: [],
    capabilityDelegation: [],
    keyAgreement: [],
    service: [],
  };

  beforeEach(() => {
    resolver = new KiltDidResolver('wss://mock-node');
    (resolve as jest.Mock).mockReset();
  });

  test('should resolve KILT DID', async () => {
    (resolve as jest.Mock).mockResolvedValue({ didDocument: mockKiltDocument });
    
    const result = await resolver.resolveKiltDid(mockKiltDid);
    expect(result).toMatchObject({
      id: mockKiltDid,
      verificationMethod: expect.arrayContaining([
        expect.objectContaining({
          type: 'Multikey',
          controller: mockKiltDid,
        }),
      ]),
    });
  });

  test('should throw ResolutionError when DID not found', async () => {
    (resolve as jest.Mock).mockResolvedValue(null);
    
    await expect(resolver.resolveKiltDid(mockKiltDid))
      .rejects
      .toThrow(ResolutionError);
  });

  test('should throw ServerError on resolution failure', async () => {
    (resolve as jest.Mock).mockRejectedValue(new Error('KILT node error'));
    
    await expect(resolver.resolveKiltDid(mockKiltDid))
      .rejects
      .toThrow(ServerError);
  });

  test('should convert KILT document to PLC format', async () => {
    (resolve as jest.Mock).mockResolvedValue({
      didDocument: {
        id: mockKiltDid,
        authenticationKey: '0x1234',
        keyAgreementKeys: ['0x5678'],
        publicKeys: {
          '0x1234': {
            key: {
              PublicVerificationKey: {
                Sr25519: '0xabcd'
              }
            }
          }
        }
      }
    });

    const result = await resolver.resolveKiltDid(mockKiltDid);
    expect(result).toMatchObject({
      id: mockKiltDid,
      verificationMethod: expect.any(Array),
      authentication: expect.any(Array),
    });
  });
});
