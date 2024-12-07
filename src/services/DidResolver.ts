import axios, { AxiosError } from 'axios';
import { config } from '../config';
import { KiltDidResolver, PlcDidDocument } from './KiltDidResolver';

interface PlcResponse {
  "@context": string[];
  id: string;
  alsoKnownAs?: string[];
  verificationMethod?: Array<{
    id: string;
    type: string;
    controller: string;
    publicKeyMultibase: string;
  }>;
  service?: Array<{
    id: string;
    type: string;
    serviceEndpoint: string;
  }>;
}

export class DidResolver {
  constructor(private kiltResolver: KiltDidResolver) {}

  async resolveDid(did: string): Promise<PlcDidDocument> {
    if (did.startsWith('did:plc:')) {
      try {
        console.log(`Resolving PLC DID: ${did}`);
        // Use the direct URL format without /api/v1/did/
        const response = await axios.get(`${config.plcResolver}/${did}`, {
          headers: {
            'Accept': 'application/json'
          }
        });

        const data = response.data as PlcResponse;
        console.log('PLC resolver response:', JSON.stringify(data, null, 2));

        const plcDoc: PlcDidDocument = {
          id: data.id,
          alsoKnownAs: data.alsoKnownAs ?? [],
          verificationMethod: data.verificationMethod ?? [],
          authentication: data.verificationMethod?.map(vm => vm.id) ?? [],
          assertionMethod: [],
          capabilityInvocation: [],
          capabilityDelegation: [],
          keyAgreement: [],
          service: data.service ?? []
        };

        return plcDoc;
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
          
          throw new Error(`PLC resolution failed: ${axiosError.message}`);
        }
        throw new Error(`Unexpected error during PLC resolution: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    if (did.startsWith('did:kilt:')) {
      return this.kiltResolver.resolveKiltDid(did);
    }

    throw new Error('Unsupported DID method');
  }
}