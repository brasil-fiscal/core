# Roadmap — @brasil-fiscal/core

Infraestrutura compartilhada entre todos os pacotes (@brasil-fiscal/nfe, cte, mdfe, nfse).

---

## Concluido

- [x] `NodeHttpSefazTransport` — comunicacao HTTPS com mTLS
- [x] `A1CertificateProvider` — carregamento de certificado .pfx/.p12
- [x] `DefaultXmlSigner` — assinatura XMLDSig (RSA-SHA1) com canonicalizacao C14N
- [x] Helpers XML (tag, tagGroup, escapeXml, formatNumber, formatDate)
- [x] Helpers de chave de acesso (geracao, digito verificador)
- [x] Validadores CNPJ/CPF
- [x] Classes de erro base (DFeError)
- [x] Sanitizacao UTF-8 no transport (BOM removal, normalizacao Unicode NFC)

---

## Fase 1: Resiliencia e Contingencia

**Status:** Pendente

**Objetivo:** Infraestrutura de transport resiliente que todos os DFe (NFe, CTe, MDFe) possam usar.

- [ ] Consulta Status SEFAZ — contrato e helper generico para `StatusServico` (cada pacote define suas URLs)
- [ ] Transport com retry e fallback — retry automatico com backoff, fallback para URL alternativa (SVC-AN/SVC-RS)
- [ ] Deteccao de indisponibilidade — cache de status por autorizador para evitar requests repetidos a SEFAZ fora

**Criterio de conclusao:** Transport resiliente funcionando com fallback automatico.

---

## Fase 2: Dados Compartilhados

**Status:** Pendente

**Objetivo:** Centralizar dados fiscais que todos os pacotes precisam.

- [ ] Tabela cStat completa — codigos de retorno SEFAZ (100-999) com descricao e tipo (sucesso/erro)
- [ ] Codigos IBGE completos — todos os municipios do Brasil (hoje so tem UFs)
- [ ] Protocolacao generica — helper para juntar XML assinado com retorno SEFAZ (procNFe, procCTe, procMDFe, procEvento, procInut)

**Criterio de conclusao:** Dados compartilhados acessiveis por todos os pacotes.

---

## Como acompanhar

Mudancas no core impactam todos os pacotes. Versionar com cuidado e manter backward compatibility.
