import { CertificateData } from './CertificateProvider';

export interface XmlSigner {
  sign(xml: string, certificate: CertificateData): string;
}
