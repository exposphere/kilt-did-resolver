import request from 'supertest';
import nock from 'nock';
import type { Express } from 'express';
import { KiltDidResolver, ServerError } from '../services/KiltDidResolver';
import { DidResolver } from '../services/DidResolver';
import { createApp } from '../index';
import { config } from '../config';

// Mock KILT SDK
jest.mock('@kiltprotocol/did', () => ({
  resolve: jest.fn(),
}));

import { resolve } from '@kiltprotocol/did';

describe('KILT DID Resolver', () => {
  let kiltResolver: KiltDidResolver;
  let resolver: DidResolver;
  let app: Express;
  let consoleErrorSpy: jest.SpyInstance;

  const mockKiltDid = 'did:kilt:4sGYUHba7eKksK2izguJsEanMjuu9ne3BsWDG6Vf9MTTt8Db';
  const mockPlcDid = 'did:plc:ewvi7nxzyoun6zhxrhs64oiz';
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

  beforeAll(async () => {
    kiltResolver = new KiltDidResolver('wss://mock-node');
    resolver = new DidResolver(kiltResolver);
    app = createApp(resolver);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (resolve as jest.Mock).mockResolvedValue({ didDocument: mockKiltDocument });
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('DID Resolution', () => {
    test('should return 400 for invalid DID format', async () => {
      const response = await request(app).get('/invalid-did');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid DID format');
      expect(response.body.message).toBe('DID must start with did:kilt: or did:plc:');
    });

    test('should return 404 when KILT DID is not found', async () => {
      (resolve as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get(`/${mockKiltDid}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('DID not found');
    });

    test('should return transformed PLC document for valid KILT DID', async () => {
      const response = await request(app).get(`/${mockKiltDid}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: mockKiltDid,
        verificationMethod: expect.arrayContaining([
          expect.objectContaining({
            type: 'Multikey',
            controller: mockKiltDid,
            publicKeyMultibase: expect.any(String),
          }),
        ]),
      });
    });

    test('should handle PLC DID resolution', async () => {
      const mockPlcDoc = {
        id: mockPlcDid,
        verificationMethod: [],
        authentication: [],
        assertionMethod: [],
        capabilityInvocation: [],
        capabilityDelegation: [],
        keyAgreement: [],
        service: [],
        alsoKnownAs: [],
      };

      nock(config.plcResolver)
        .get(`/${mockPlcDid}`)
        .reply(200, mockPlcDoc);

      const response = await request(app).get(`/${mockPlcDid}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPlcDoc);
    });

    test('should handle server errors gracefully', async () => {
      (resolve as jest.Mock).mockImplementation(() => {
        throw new ServerError('KILT node error');
      });

      const response = await request(app).get(`/${mockKiltDid}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
    });

    test('should handle PLC resolution errors', async () => {
      nock(config.plcResolver).get(`/${mockPlcDid}`).reply(500);

      const response = await request(app).get(`/${mockPlcDid}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
    });
  });
});
