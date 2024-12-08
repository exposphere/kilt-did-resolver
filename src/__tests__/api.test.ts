// src/__tests__/api.test.ts
import request from 'supertest';
import nock from 'nock';
import { Express } from 'express';
import { KiltDidResolver } from '../services/KiltDidResolver';
import { DidResolver } from '../services/DidResolver';
import { createApp } from '../index';
import { config } from '../config';
import { PlcDidDocument } from '../types';

describe('API Integration', () => {
  let app: Express;
  
  beforeAll(async () => {
    const kiltResolver = new KiltDidResolver('wss://mock-node');
    const resolver = new DidResolver(kiltResolver);
    app = createApp(resolver);
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  test('should return 400 for invalid DID format', async () => {
    const response = await request(app).get('/invalid-did');
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid DID format');
  });

  test('should handle successful KILT resolution', async () => {
    const mockDoc: PlcDidDocument = {
      id: 'did:kilt:4sGYUHba7eKksK2izguJsEanMjuu9ne3BsWDG6Vf9MTTt8Db',
      alsoKnownAs: [],
      verificationMethod: [{
        id: 'did:kilt:4sGYUHba7eKksK2izguJsEanMjuu9ne3BsWDG6Vf9MTTt8Db#key-1',
        type: 'Multikey',
        controller: 'did:kilt:4sGYUHba7eKksK2izguJsEanMjuu9ne3BsWDG6Vf9MTTt8Db',
        publicKeyMultibase: 'z12345'
      }],
      authentication: ['did:kilt:4sGYUHba7eKksK2izguJsEanMjuu9ne3BsWDG6Vf9MTTt8Db#key-1'],
      assertionMethod: [],
      capabilityInvocation: [],
      capabilityDelegation: [],
      keyAgreement: [],
      service: []
    };

    jest.spyOn(KiltDidResolver.prototype, 'resolveKiltDid').mockResolvedValue(mockDoc);

    const response = await request(app)
      .get('/did:kilt:4sGYUHba7eKksK2izguJsEanMjuu9ne3BsWDG6Vf9MTTt8Db');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockDoc);
  });

  test('should handle successful PLC resolution', async () => {
    const mockDoc: PlcDidDocument = {
      id: 'did:plc:123',
      alsoKnownAs: [],
      verificationMethod: [{
        id: 'did:plc:123#key-1',
        type: 'Multikey',
        controller: 'did:plc:123',
        publicKeyMultibase: 'z12345'
      }],
      authentication: ['did:plc:123#key-1'],
      assertionMethod: [],
      capabilityInvocation: [],
      capabilityDelegation: [],
      keyAgreement: [],
      service: []
    };

    nock(config.plcResolver)
      .get('/did:plc:123')
      .reply(200, mockDoc);

    const response = await request(app).get('/did:plc:123');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockDoc);
  });

  test('should return 404 for non-existent DID', async () => {
    nock(config.plcResolver)
      .get('/did:plc:nonexistent')
      .reply(404);

    const response = await request(app).get('/did:plc:nonexistent');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('DID not found');
  });

  test('should return 500 for server errors', async () => {
    nock(config.plcResolver)
      .get('/did:plc:error')
      .replyWithError('Internal error');

    const response = await request(app).get('/did:plc:error');
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal server error');
  });
});
