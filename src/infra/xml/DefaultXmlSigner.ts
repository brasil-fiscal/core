import { createSign, createHash } from 'node:crypto';
import { XmlSigner } from '@core/contracts/XmlSigner';
import { CertificateData } from '@core/contracts/CertificateProvider';
import { canonicalize } from './canonicalize';

const SIGNATURE_NS = 'http://www.w3.org/2000/09/xmldsig#';
const C14N_ALGORITHM = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';
const ENVELOPED_SIGNATURE = 'http://www.w3.org/2000/09/xmldsig#enveloped-signature';
const SHA1_ALGORITHM = 'http://www.w3.org/2000/09/xmldsig#sha1';
const RSA_SHA1_ALGORITHM = 'http://www.w3.org/2000/09/xmldsig#rsa-sha1';

export type SignableElementConfig = {
  readonly elementName: string;
  readonly parentElement: string;
};

/**
 * Configuracao padrao para NFe. Outros DFe podem adicionar configs proprias.
 */
const DEFAULT_SIGNABLE_ELEMENTS: SignableElementConfig[] = [
  { elementName: 'infNFe', parentElement: 'NFe' },
  { elementName: 'infCte', parentElement: 'CTe' },
  { elementName: 'infMDFe', parentElement: 'MDFe' },
  { elementName: 'infEvento', parentElement: 'evento' },
  { elementName: 'infInut', parentElement: 'inutNFe' }
];

export class DefaultXmlSigner implements XmlSigner {
  private readonly signableElements: SignableElementConfig[];

  constructor(signableElements?: SignableElementConfig[]) {
    this.signableElements = signableElements ?? DEFAULT_SIGNABLE_ELEMENTS;
  }

  sign(xml: string, certificate: CertificateData): string {
    const { elementName, elementContent, id, parentElement } =
      this.findSignableElement(xml);

    const referenceUri = `#${id}`;
    const canonicalized = canonicalize(elementContent);

    const digest = createHash('sha1').update(canonicalized).digest('base64');

    const signedInfo =
      `<SignedInfo xmlns="${SIGNATURE_NS}">` +
      `<CanonicalizationMethod Algorithm="${C14N_ALGORITHM}"/>` +
      `<SignatureMethod Algorithm="${RSA_SHA1_ALGORITHM}"/>` +
      `<Reference URI="${referenceUri}">` +
      '<Transforms>' +
      `<Transform Algorithm="${ENVELOPED_SIGNATURE}"/>` +
      `<Transform Algorithm="${C14N_ALGORITHM}"/>` +
      '</Transforms>' +
      `<DigestMethod Algorithm="${SHA1_ALGORITHM}"/>` +
      `<DigestValue>${digest}</DigestValue>` +
      '</Reference>' +
      '</SignedInfo>';

    const signedInfoCanonicalized = canonicalize(signedInfo);

    const signer = createSign('RSA-SHA1');
    signer.update(signedInfoCanonicalized);
    const signatureValue = signer.sign(certificate.privateKey, 'base64');

    const x509Content = certificate.certPem
      .replace(/-----BEGIN CERTIFICATE-----/g, '')
      .replace(/-----END CERTIFICATE-----/g, '')
      .replace(/\s/g, '');

    const signature =
      `<Signature xmlns="${SIGNATURE_NS}">` +
      signedInfo +
      `<SignatureValue>${signatureValue}</SignatureValue>` +
      '<KeyInfo>' +
      '<X509Data>' +
      `<X509Certificate>${x509Content}</X509Certificate>` +
      '</X509Data>' +
      '</KeyInfo>' +
      '</Signature>';

    return xml.replace(
      `</${elementName}></${parentElement}>`,
      `</${elementName}>${signature}</${parentElement}>`
    );
  }

  private findSignableElement(xml: string): {
    elementName: string;
    elementContent: string;
    id: string;
    parentElement: string;
  } {
    for (const config of this.signableElements) {
      const match = xml.match(
        new RegExp(`<${config.elementName}[^>]*>[\\s\\S]*<\\/${config.elementName}>`)
      );
      if (match) {
        const idMatch = match[0].match(/Id="([^"]+)"/);
        if (!idMatch) {
          throw new Error(`Atributo Id nao encontrado em <${config.elementName}>`);
        }
        const element = this.propagateNamespaces(xml, match[0], config.elementName);
        return {
          elementName: config.elementName,
          elementContent: element,
          id: idMatch[1],
          parentElement: config.parentElement
        };
      }
    }

    const names = this.signableElements.map((c) => c.elementName).join(', ');
    throw new Error(
      `Nenhum elemento assinavel encontrado no XML. Esperado: ${names}`
    );
  }

  /**
   * Propaga namespaces herdados do elemento pai para o elemento filho.
   * Necessario para C14N: o digest deve incluir namespaces efetivos.
   */
  private propagateNamespaces(xml: string, element: string, tagName: string): string {
    const nsRegex = /xmlns(?::[\w]+)?="[^"]+"/g;

    const parentNs: string[] = [];
    const parentMatch = xml.match(new RegExp(`<[^>]*>(?=\\s*<${tagName})`)) ||
      xml.match(new RegExp(`<[^>]*>(?=[\\s\\S]*<${tagName})`));
    if (parentMatch) {
      let m: RegExpExecArray | null;
      while ((m = nsRegex.exec(parentMatch[0])) !== null) {
        parentNs.push(m[0]);
      }
    }

    if (parentNs.length === 0) return element;

    const elementOpenMatch = element.match(new RegExp(`^<${tagName}([^>]*)>`));
    if (!elementOpenMatch) return element;

    const existingAttrs = elementOpenMatch[1];
    const missingNs = parentNs.filter((ns) => !existingAttrs.includes(ns));

    if (missingNs.length === 0) return element;

    return element.replace(
      new RegExp(`^<${tagName}`),
      `<${tagName} ${missingNs.join(' ')}`
    );
  }
}
