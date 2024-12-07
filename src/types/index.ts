export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyMultibase: string;
}

export interface Service {
  id: string;
  type: string;
  serviceEndpoint: string;
}

export interface PlcDidDocument {
  id: string;
  alsoKnownAs?: string[];
  verificationMethod: VerificationMethod[];
  service?: Service[];
}
