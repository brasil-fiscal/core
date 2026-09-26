/**
 * Dados descritivos do certificado digital: quem e o titular, quem emitiu e ate
 * quando vale. Util para tela de configuracao e alerta de vencimento.
 */
export type CertificateInfo = {
  /** Nome do titular (CN sem o documento). */
  readonly titular: string;
  /** CNPJ (14 digitos) ou CPF (11) do titular, quando presente no CN. */
  readonly documento?: string;
  readonly tipoDocumento?: 'CNPJ' | 'CPF';
  /** CN da autoridade certificadora emissora. */
  readonly emissor: string;
  readonly notBefore: Date;
  readonly notAfter: Date;
  readonly numeroSerie: string;
  /** Dias restantes ate o vencimento. Negativo se ja venceu. */
  readonly diasParaVencer: number;
  readonly expirado: boolean;
};

export type CertificateData = {
  readonly pfx: Buffer;
  readonly password: string;
  readonly notAfter: Date;
  readonly privateKey: string;
  readonly certPem: string;
  /**
   * Opcional para nao quebrar providers customizados — o `A1CertificateProvider`
   * sempre preenche, e quem consome pode derivar de `certPem` com
   * `parseCertificateInfo`.
   */
  readonly info?: CertificateInfo;
};

export interface CertificateProvider {
  load(): Promise<CertificateData>;
}
