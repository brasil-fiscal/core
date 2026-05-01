import { DFeError } from './DFeError';

export class CertificateError extends DFeError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'CertificateError';
  }
}
