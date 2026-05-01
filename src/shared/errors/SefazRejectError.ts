import { DFeError } from './DFeError';

export class SefazRejectError extends DFeError {
  constructor(
    public readonly cStat: string,
    public readonly xMotivo: string,
    public readonly uf?: string
  ) {
    super(`SEFAZ rejeitou o documento: [${cStat}] ${xMotivo}`);
    this.name = 'SefazRejectError';
  }
}
