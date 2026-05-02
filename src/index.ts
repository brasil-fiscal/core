// Contracts
export type {
  CertificateProvider,
  CertificateData
} from './contracts/CertificateProvider';
export type { SefazTransport, SefazRequest, SefazResponse } from './contracts/SefazTransport';
export type { XmlSigner } from './contracts/XmlSigner';
export type {
  SchemaValidator,
  ValidationResult,
  ValidationError
} from './contracts/SchemaValidator';

// Infrastructure
export { A1CertificateProvider } from './infra/certificate/A1CertificateProvider';
export { DefaultXmlSigner } from './infra/xml/DefaultXmlSigner';
export type { SignableElementConfig } from './infra/xml/DefaultXmlSigner';
export { canonicalize } from './infra/xml/canonicalize';
export {
  escapeXml,
  sanitizeXmlChars,
  tag,
  tagGroup,
  formatNumber,
  formatDate,
  padLeft
} from './infra/xml/xml-helper';
export { NodeHttpSefazTransport } from './infra/transport/NodeHttpSefazTransport';
export { extractSoapBody, extractTag } from './infra/transport/soap-helper';

// Errors
export { DFeError } from './shared/errors/DFeError';
export { CertificateError } from './shared/errors/CertificateError';
export { SefazRejectError } from './shared/errors/SefazRejectError';
export { SchemaValidationError } from './shared/errors/SchemaValidationError';
export type { FieldError } from './shared/errors/SchemaValidationError';

// Helpers
export {
  calcMod11,
  isValidCnpj,
  formatCnpj,
  cleanCnpj,
  isValidCpf,
  formatCpf,
  cleanCpf,
  generateAccessKey,
  generateNumericCode
} from './shared/helpers';
export type { AccessKeyParams } from './shared/helpers';

// Constants
export { UF_CODES } from './shared/constants';
