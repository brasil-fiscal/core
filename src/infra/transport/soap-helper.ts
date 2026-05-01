import { DFeError } from '@core/shared/errors/DFeError';

/**
 * Extrai o conteudo dentro de <soap12:Body> ou <soapenv:Body>.
 */
export function extractSoapBody(soapXml: string): string {
  const match = soapXml.match(/<(?:soap12|soapenv|soap):Body[^>]*>([\s\S]*?)<\/(?:soap12|soapenv|soap):Body>/i);
  if (!match) {
    throw new DFeError('Resposta SOAP invalida: Body nao encontrado');
  }
  return match[1].trim();
}

/**
 * Extrai o conteudo de uma tag XML simples.
 */
export function extractTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return match ? match[1] : null;
}
