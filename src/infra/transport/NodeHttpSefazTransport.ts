import { request as httpsRequest } from 'node:https';
import { URL } from 'node:url';
import { SefazTransport, SefazRequest, SefazResponse } from '@core/contracts/SefazTransport';
import { DFeError } from '@core/shared/errors/DFeError';

export class NodeHttpSefazTransport implements SefazTransport {
  private readonly timeout: number;
  private readonly rejectUnauthorized: boolean;

  constructor(options?: { timeout?: number; rejectUnauthorized?: boolean }) {
    this.timeout = options?.timeout ?? 30000;
    this.rejectUnauthorized = options?.rejectUnauthorized ?? false;
  }

  async send(req: SefazRequest): Promise<SefazResponse> {
    return new Promise((resolve, reject) => {
      const url = new URL(req.url);

      // Garante UTF-8 limpo: remove BOM e re-encoda via Buffer
      const cleanXml = req.xml.replace(/^\uFEFF/, '');
      const utf8Buffer = Buffer.from(cleanXml, 'utf-8');

      const httpReq = httpsRequest(
        {
          hostname: url.hostname,
          port: url.port || 443,
          path: url.pathname + url.search,
          method: 'POST',
          headers: {
            'Content-Type': 'text/xml; charset=UTF-8',
            'SOAPAction': req.soapAction,
            'Content-Length': utf8Buffer.byteLength
          },
          pfx: req.pfx,
          passphrase: req.password,
          rejectUnauthorized: this.rejectUnauthorized,
          timeout: this.timeout
        },
        (res) => {
          const chunks: Buffer[] = [];

          res.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
          });

          res.on('end', () => {
            const body = Buffer.concat(chunks).toString('utf-8');
            const statusCode = res.statusCode ?? 0;

            if (statusCode < 200 || statusCode >= 300) {
              reject(
                new DFeError(`Erro HTTP ${statusCode} ao comunicar com SEFAZ: ${body.slice(0, 500)}`)
              );
              return;
            }

            resolve({ xml: body, statusCode });
          });

          res.on('error', (err) => {
            reject(
              new DFeError(
                `Erro ao ler resposta da SEFAZ: ${err.message}`,
                err
              )
            );
          });
        }
      );

      httpReq.on('timeout', () => {
        httpReq.destroy();
        reject(new DFeError('Timeout ao comunicar com SEFAZ'));
      });

      httpReq.on('error', (err) => {
        reject(
          new DFeError(
            `Erro de conexao com SEFAZ: ${err.message}`,
            err
          )
        );
      });

      httpReq.write(utf8Buffer);
      httpReq.end();
    });
  }
}
