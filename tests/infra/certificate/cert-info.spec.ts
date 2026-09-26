import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { certInfo, parseCertificateInfo, extractCertPem } from '@core/infra/certificate/cert-info';
import { A1CertificateProvider } from '@core/infra/certificate/A1CertificateProvider';
import { CertificateError } from '@core/shared/errors/CertificateError';
import { generateTestCertificate } from '../../helpers/generate-test-certificate';

describe('certInfo', () => {
  it('deve ler titular, emissor e validade do certificado', () => {
    const { pfx, password } = generateTestCertificate({ cn: 'EMPRESA TESTE LTDA' });

    const info = certInfo(pfx, password);

    assert.equal(info.titular, 'EMPRESA TESTE LTDA');
    assert.equal(info.emissor, 'EMPRESA TESTE LTDA'); // autoassinado
    assert.equal(info.expirado, false);
    assert.ok(info.diasParaVencer > 300);
    assert.ok(info.notAfter > info.notBefore);
    assert.ok(info.numeroSerie.length > 0);
  });

  it('deve separar o CNPJ do nome no padrao ICP-Brasil', () => {
    const { pfx, password } = generateTestCertificate({
      cn: 'EMPRESA TESTE LTDA:11222333000181'
    });

    const info = certInfo(pfx, password);

    assert.equal(info.titular, 'EMPRESA TESTE LTDA');
    assert.equal(info.documento, '11222333000181');
    assert.equal(info.tipoDocumento, 'CNPJ');
  });

  it('deve identificar CPF de e-CPF', () => {
    const { pfx, password } = generateTestCertificate({
      cn: 'RAPHAEL SERAFIM:52998224725'
    });

    const info = certInfo(pfx, password);

    assert.equal(info.titular, 'RAPHAEL SERAFIM');
    assert.equal(info.documento, '52998224725');
    assert.equal(info.tipoDocumento, 'CPF');
  });

  it('deve reportar certificado vencido em vez de lancar erro', () => {
    const { pfx, password } = generateTestCertificate({ days: 1, cn: 'VENCIDO' });

    // Avanca o relogio 2 anos para o certificado ficar vencido.
    const OriginalDate = globalThis.Date;
    const futureMs = OriginalDate.now() + 2 * 365 * 24 * 60 * 60 * 1000;
    globalThis.Date = class extends OriginalDate {
      constructor(...args: unknown[]) {
        if (args.length === 0) {
          super(futureMs);
        } else {
          // @ts-expect-error - forwarding constructor args
          super(...args);
        }
      }

      static override now(): number {
        return futureMs;
      }
    } as DateConstructor;

    try {
      const info = certInfo(pfx, password);

      assert.equal(info.expirado, true);
      assert.ok(info.diasParaVencer < 0);
    } finally {
      globalThis.Date = OriginalDate;
    }
  });

  it('deve lancar CertificateError com senha errada', () => {
    const { pfx } = generateTestCertificate();

    assert.throws(() => certInfo(pfx, 'senha-errada'), CertificateError);
  });

  it('deve expor as mesmas informacoes no load do provider', async () => {
    const { pfx, password } = generateTestCertificate({ cn: 'EMPRESA TESTE:11222333000181' });

    const data = await new A1CertificateProvider(pfx, password).load();

    assert.equal(data.info.documento, '11222333000181');
    assert.equal(data.info.notAfter.getTime(), data.notAfter.getTime());
    assert.deepEqual(data.info, parseCertificateInfo(extractCertPem(pfx, password)));
  });
});
