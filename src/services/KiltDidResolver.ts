import { connect } from '@kiltprotocol/sdk-js';
import { resolve } from '@kiltprotocol/did';
import { config } from '../config';

// PLC DID Document types
export interface PlcVerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyMultibase: string;
}

export interface PlcService {
  id: string;
  type: string;
  serviceEndpoint: string;
}

export interface PlcDidDocument {
  id: string;
  alsoKnownAs: string[];
  verificationMethod: PlcVerificationMethod[];
  authentication: string[];
  assertionMethod: string[];
  capabilityInvocation: string[];
  capabilityDelegation: string[];
  keyAgreement: string[];
  service: PlcService[];
}

export class ResolutionError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'ResolutionError';
  }
}

export class ServerError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'ServerError';
  }
}

export class KiltDidResolver {
  private static instance: KiltDidResolver;
  private isConnected = false;

  constructor(private nodeUrl: string = config.kiltNode) {}

  static async getInstance(): Promise<KiltDidResolver> {
    if (!KiltDidResolver.instance) {
      KiltDidResolver.instance = new KiltDidResolver();
      await KiltDidResolver.instance.connect();
    }
    return KiltDidResolver.instance;
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 10000);
    });

    try {
      await Promise.race([
        connect(this.nodeUrl),
        timeoutPromise
      ]);
      this.isConnected = true;
      console.log('Successfully connected to KILT node.');
    } catch (error) {
      throw new ServerError('Failed to connect to KILT node', error as Error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Test resolution of a known DID
      await this.resolveKiltDid('did:kilt:4qZSoAZFjW4MqfNUpkCb2N2qYyxwZC9Fu6vxAbdp4DxuKJnh');
      return true;
    } catch {
      return false;
    }
  }

  async resolveKiltDid(didUri: string): Promise<PlcDidDocument> {
    try {
      // Cast the string to the correct type for compatibility
      const resolutionResult = await resolve(didUri as any);

      if (!resolutionResult || !resolutionResult.didDocument) {
        throw new ResolutionError('DID not found');
      }

      return this.convertToPlcDocument(resolutionResult.didDocument, didUri);
    } catch (err) {
      if (err instanceof ResolutionError) {
        throw err;
      }
      throw new ServerError(`Server error while resolving DID: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  private convertToPlcDocument(didDoc: any, did: string): PlcDidDocument {
    const plcDoc: PlcDidDocument = {
      id: did,
      alsoKnownAs: didDoc.alsoKnownAs || [],
      verificationMethod: [],
      authentication: [],
      assertionMethod: [],
      capabilityInvocation: [],
      capabilityDelegation: [],
      keyAgreement: [],
      service: [],
    };

    // Map verification methods
    if (Array.isArray(didDoc.verificationMethod)) {
      didDoc.verificationMethod.forEach((method: any) => {
        plcDoc.verificationMethod.push({
          id: method.id,
          type: method.type,
          controller: method.controller,
          publicKeyMultibase: method.publicKeyMultibase,
        });
      });
    }

    // Populate relationships
    plcDoc.authentication = didDoc.authentication || [];
    plcDoc.assertionMethod = didDoc.assertionMethod || [];
    plcDoc.capabilityInvocation = didDoc.capabilityInvocation || [];
    plcDoc.capabilityDelegation = didDoc.capabilityDelegation || [];
    plcDoc.keyAgreement = didDoc.keyAgreement || [];

    // Map services
    if (Array.isArray(didDoc.service)) {
      didDoc.service.forEach((service: any) => {
        plcDoc.service.push({
          id: service.id,
          type: service.type,
          serviceEndpoint: service.serviceEndpoint,
        });
      });
    }

    return plcDoc;
  }
}
