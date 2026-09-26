import { execFileSync } from 'node:child_process';
import { X509Certificate } from 'node:crypto';
import { CertificateInfo } from '@core/contracts/CertificateProvider';
import { CertificateError } from '@core/shared/errors/CertificateError';

const MS_POR_DIA = 24 * 60 * 60 * 1000;

/**
 * Extrai o certificado do cliente de um arquivo PFX/P12, em PEM.
 */
export function extractCertPem(pfx: Buffer, password: string): string {
  const output = execFileSync(
    'openssl',
    ['pkcs12', '-clcerts', '-nokeys', '-passin', `pass:${password}`],
    { input: pfx, stdio: ['pipe', 'pipe', 'pipe'] }
  ).toString();

  const match = output.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/);

  if (!match) {
    throw new CertificateError('Certificado nao encontrado no arquivo PFX');
  }

  return match[0];
}

/**
 * Le um campo do subject/issuer no formato do node (`CN=...` por linha).
 */
function readField(dn: string, field: string): string | undefined {
  for (const line of dn.split('\n')) {
    const [key, ...rest] = line.split('=');
    if (key.trim() === field) return rest.join('=').trim();
  }
  return undefined;
}

/**
 * Dados de um certificado A1 ja carregado em PEM.
 *
 * Nos certificados ICP-Brasil o CN do titular vem como `NOME:DOCUMENTO` — dai
 * saem `titular` e `documento` (CNPJ com 14 digitos, CPF com 11).
 */
export function parseCertificateInfo(certPem: string): CertificateInfo {
  const cert = new X509Certificate(certPem);
  const cn = readField(cert.subject, 'CN') ?? '';
  const match = cn.match(/^(.*?):(\d{11}|\d{14})$/);

  const documento = match?.[2];
  const notAfter = new Date(cert.validTo);
  const notBefore = new Date(cert.validFrom);
  const agora = new Date();

  return {
    titular: match ? match[1] : cn,
    documento,
    tipoDocumento: documento ? (documento.length === 14 ? 'CNPJ' : 'CPF') : undefined,
    emissor: readField(cert.issuer, 'CN') ?? cert.issuer,
    notBefore,
    notAfter,
    numeroSerie: cert.serialNumber,
    diasParaVencer: Math.floor((notAfter.getTime() - agora.getTime()) / MS_POR_DIA),
    expirado: notAfter < agora
  };
}

/**
 * Dados do certificado A1 sem carrega-lo para uso: titular, documento, emissor
 * e validade. Ao contrario do `A1CertificateProvider`, nao rejeita certificado
 * vencido — a ideia e justamente poder inspecionar um.
 */
export function certInfo(pfx: Buffer, password: string): CertificateInfo {
  try {
    return parseCertificateInfo(extractCertPem(pfx, password));
  } catch (error) {
    if (error instanceof CertificateError) throw error;

    const message = error instanceof Error ? error.message : String(error);
    throw new CertificateError(
      `Falha ao ler certificado A1: ${message}`,
      error instanceof Error ? error : undefined
    );
  }
}
