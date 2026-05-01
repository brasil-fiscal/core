# @brasil-fiscal/core

Infraestrutura compartilhada para documentos fiscais eletronicos brasileiros. Certificado digital, assinatura XML, transporte mTLS, helpers e constantes — tudo que NFe, CTe e MDFe tem em comum.

## Para que serve?

Este pacote eh a base dos projetos `@brasil-fiscal/*`. Ele contem a logica que eh **identica** entre NFe, CTe e MDFe:

- Carregar certificado digital A1 (.pfx/.p12)
- Assinar XML com XMLDSig (RSA-SHA1)
- Comunicar com a SEFAZ via HTTPS com mTLS
- Canonicalizacao C14N de XML
- Gerar chave de acesso (44 digitos)
- Validar CNPJ e CPF
- Codigos IBGE das UFs
- Classes de erro base

**Voce provavelmente nao precisa instalar este pacote diretamente.** Ele eh uma dependencia dos pacotes de documento fiscal:

| Pacote | Documento |
|--------|-----------|
| [`@brasil-fiscal/nfe`](https://github.com/brasil-fiscal/nfe) | NFe / NFC-e (Nota Fiscal Eletronica) |
| [`@brasil-fiscal/cte`](https://github.com/brasil-fiscal/cte) | CTe (Conhecimento de Transporte) |
| [`@brasil-fiscal/mdfe`](https://github.com/brasil-fiscal/mdfe) | MDFe (Manifesto de Documentos Fiscais) |

## Instalacao

Se voce esta construindo um pacote que depende do core:

```bash
npm install @brasil-fiscal/core
```

## API

### Certificado Digital

```typescript
import { A1CertificateProvider } from '@brasil-fiscal/core';

const provider = new A1CertificateProvider(pfxBuffer, 'senha');
const cert = await provider.load();
// cert.privateKey, cert.certPem, cert.pfx, cert.password, cert.notAfter
```

### Assinatura XML

```typescript
import { DefaultXmlSigner } from '@brasil-fiscal/core';

const signer = new DefaultXmlSigner();
const xmlAssinado = signer.sign(xml, certificateData);
```

O signer detecta automaticamente o tipo de documento (`infNFe`, `infCte`, `infMDFe`, `infEvento`, `infInut`) e assina corretamente.

### Transporte mTLS

```typescript
import { NodeHttpSefazTransport } from '@brasil-fiscal/core';

const transport = new NodeHttpSefazTransport({ timeout: 30000 });
const response = await transport.send({
  url: 'https://nfe.sefaz.mt.gov.br/...',
  soapAction: '...',
  xml: envelopeXml,
  pfx: cert.pfx,
  password: cert.password
});
```

### Helpers XML

```typescript
import { tag, tagGroup, formatDate, escapeXml, padLeft } from '@brasil-fiscal/core';

tag('CNPJ', '12345678000195');           // <CNPJ>12345678000195</CNPJ>
tag('xNome', undefined);                  // '' (omite tags vazias)
tagGroup('emit', tag('CNPJ', '123'));     // <emit><CNPJ>123</CNPJ></emit>
formatDate(new Date(), '-03:00');         // '2024-04-28T10:00:00-03:00'
```

### SOAP

```typescript
import { extractSoapBody, extractTag } from '@brasil-fiscal/core';

const body = extractSoapBody(soapResponseXml);  // conteudo dentro de <soap:Body>
const cStat = extractTag(body, 'cStat');         // conteudo de <cStat>
```

### Chave de Acesso

```typescript
import { generateAccessKey, generateNumericCode } from '@brasil-fiscal/core';

const chave = generateAccessKey({
  uf: '51',
  dataEmissao: new Date(),
  cnpj: '12345678000195',
  modelo: '55',     // 55=NFe, 57=CTe, 58=MDFe, 65=NFCe
  serie: 1,
  numero: 1,
  tipoEmissao: 1,
  codigoNumerico: generateNumericCode()
});
// 44 digitos com digito verificador
```

### Validacao de Documentos

```typescript
import { isValidCnpj, isValidCpf, formatCnpj, formatCpf } from '@brasil-fiscal/core';

isValidCnpj('11222333000181');  // true
isValidCpf('52998224725');      // true
formatCnpj('11222333000181');   // '11.222.333/0001-81'
formatCpf('52998224725');       // '529.982.247-25'
```

### Constantes

```typescript
import { UF_CODES } from '@brasil-fiscal/core';

UF_CODES['MT'];  // '51'
UF_CODES['SP'];  // '35'
```

### Erros

```typescript
import { DFeError, CertificateError, SefazRejectError } from '@brasil-fiscal/core';

// DFeError — erro base de todos os documentos fiscais
// CertificateError — falha no certificado digital
// SefazRejectError — SEFAZ rejeitou o documento (cStat + xMotivo)
// SchemaValidationError — XML invalido contra XSD
```

## Contratos (Interfaces)

O core define contratos que podem ser implementados por qualquer pacote:

| Contrato | Responsabilidade | Implementacao padrao |
|----------|-----------------|---------------------|
| `CertificateProvider` | Carregar certificados digitais | `A1CertificateProvider` |
| `SefazTransport` | Comunicacao HTTP com a SEFAZ | `NodeHttpSefazTransport` |
| `XmlSigner` | Assinar XML com certificado | `DefaultXmlSigner` |
| `SchemaValidator` | Validar XML contra XSD | (implementado em cada pacote) |

### Criando um provider customizado

```typescript
import type { CertificateProvider, CertificateData } from '@brasil-fiscal/core';

export class MyCertificateProvider implements CertificateProvider {
  async load(): Promise<CertificateData> {
    // Sua logica (vault, HSM, banco de dados, etc.)
    return { pfx, password, notAfter, privateKey, certPem };
  }
}
```

## Arquitetura

```
src/
  contracts/        Interfaces (CertificateProvider, SefazTransport, XmlSigner, SchemaValidator)
  infra/
    certificate/    A1CertificateProvider (carrega .pfx/.p12 via openssl)
    xml/            DefaultXmlSigner, canonicalize (C14N), xml-helper (tag, escapeXml)
    transport/      NodeHttpSefazTransport (mTLS), soap-helper (extractSoapBody)
  shared/
    errors/         DFeError, CertificateError, SefazRejectError, SchemaValidationError
    helpers/        CNPJ, CPF, mod11, access-key
    constants/      UF_CODES (codigos IBGE)
```

### Principios

- **Zero dependencias em runtime** — apenas `node:crypto`, `node:https`, `node:child_process`
- **Contratos primeiro** — toda integracao externa eh uma interface
- **Falhar rapido** — erros claros com classes tipadas
- **DI manual** — sem containers, providers injetados via construtores

## Requisitos

- Node.js >= 18
- OpenSSL instalado (para carregar certificados A1)

## Desenvolvimento

```bash
git clone https://github.com/brasil-fiscal/core.git
cd core
npm install
npm run build
npm test
```

## Contribuindo

Contribuicoes sao bem-vindas! Veja [CONTRIBUTING.md](CONTRIBUTING.md).

### Code Style

- TypeScript strict mode, return types explicitos
- Single quotes, semicolons, sem trailing commas, 100 chars por linha
- Path alias: `@core/*` mapeia para `src/*`
- Interfaces sem prefixo `I` (`CertificateProvider`, nao `ICertificateProvider`)

## Ecossistema @brasil-fiscal

| Pacote | Status | Descricao |
|--------|--------|-----------|
| **@brasil-fiscal/core** | Estavel | Infraestrutura compartilhada (este pacote) |
| [@brasil-fiscal/nfe](https://github.com/brasil-fiscal/nfe) | Estavel | NFe e NFC-e |
| [@brasil-fiscal/cte](https://github.com/brasil-fiscal/cte) | Em desenvolvimento | CTe |
| [@brasil-fiscal/mdfe](https://github.com/brasil-fiscal/mdfe) | Em desenvolvimento | MDFe |
| [@brasil-fiscal/sped-fiscal](https://github.com/brasil-fiscal/sped-fiscal) | Em desenvolvimento | EFD ICMS/IPI (SPED Fiscal) |
| [@brasil-fiscal/sped-contribuicoes](https://github.com/brasil-fiscal/sped-contribuicoes) | Em desenvolvimento | EFD Contribuicoes (PIS/COFINS) |
| [@brasil-fiscal/sintegra](https://github.com/brasil-fiscal/sintegra) | Em desenvolvimento | SINTEGRA |

## Licenca

[MIT](LICENSE)
