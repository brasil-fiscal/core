import { describe, it } from 'node:test';
import assert from 'node:assert';
import { extractSoapBody, extractTag } from '@core/infra/transport/soap-helper';
import { DFeError } from '@core/shared/errors/DFeError';

describe('soap-helper', () => {
  describe('extractSoapBody', () => {
    it('deve extrair conteudo do Body soap12', () => {
      const soap =
        '<soap12:Envelope><soap12:Body><retEnviNFe><cStat>100</cStat></retEnviNFe></soap12:Body></soap12:Envelope>';
      const body = extractSoapBody(soap);
      assert.ok(body.includes('<cStat>100</cStat>'));
    });

    it('deve extrair conteudo do Body soapenv', () => {
      const soap =
        '<soapenv:Envelope><soapenv:Body><response>OK</response></soapenv:Body></soapenv:Envelope>';
      const body = extractSoapBody(soap);
      assert.ok(body.includes('OK'));
    });

    it('deve lancar DFeError quando Body nao encontrado', () => {
      assert.throws(
        () => extractSoapBody('<invalid>xml</invalid>'),
        (error: unknown) => {
          assert.ok(error instanceof DFeError);
          return true;
        }
      );
    });
  });

  describe('extractTag', () => {
    it('deve extrair conteudo de uma tag', () => {
      const xml = '<retEnviNFe><cStat>100</cStat><xMotivo>Autorizado</xMotivo></retEnviNFe>';
      assert.strictEqual(extractTag(xml, 'cStat'), '100');
      assert.strictEqual(extractTag(xml, 'xMotivo'), 'Autorizado');
    });

    it('deve retornar null quando tag nao existe', () => {
      const xml = '<retEnviNFe><cStat>100</cStat></retEnviNFe>';
      assert.strictEqual(extractTag(xml, 'nProt'), null);
    });
  });
});
