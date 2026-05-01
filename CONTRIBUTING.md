# Contributing to @brasil-fiscal/core

Obrigado por considerar contribuir! Este guia explica como participar do projeto.

## Como contribuir

### Reportando bugs

1. Verifique se ja existe uma [issue](https://github.com/brasil-fiscal/core/issues) aberta
2. Crie uma nova issue com:
   - Descricao clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs. real
   - Versao do Node.js e da lib

### Sugerindo features

1. Abra uma issue com a tag `feature`
2. Descreva o caso de uso (por que voce precisa disso)
3. Se possivel, sugira uma API (como voce usaria)

### Enviando codigo

1. Fork o repositorio
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Faca suas alteracoes seguindo o code style
4. Escreva testes para o que voce adicionou/alterou
5. Rode `npm test` e `npm run lint`
6. Commit seguindo o padrao de commits
7. Abra um PR para `main`

## Code Style

### TypeScript

- **Strict mode** sempre ativado
- **Explicit return types** em todas as funcoes
- **Single quotes**, **semicolons**, **no trailing comma**, **100 chars** por linha
- Path alias: `@core/*` mapeia para `src/*`

### Naming

| Elemento | Convencao | Exemplo |
|----------|-----------|---------|
| Arquivos de classe | PascalCase | `DefaultXmlSigner.ts` |
| Arquivos de helper | kebab-case | `access-key.ts` |
| Interfaces | PascalCase, sem prefixo `I` | `CertificateProvider` |
| Erros | PascalCase + `Error` | `DFeError` |
| Constantes | UPPER_SNAKE_CASE | `UF_CODES` |
| Testes | mesmo nome + `.spec.ts` | `cnpj.spec.ts` |

### Arquitetura

- **Nao** adicione dependencias de runtime sem discussao previa em uma issue
- **Nao** adicione funcionalidades especificas de NFe, CTe ou MDFe — essas pertencem aos pacotes individuais
- Apenas codigo **generico e reutilizavel** pertence ao core

### Commits

Padrao: `tipo: descricao curta`

Tipos:
- `feat:` nova funcionalidade
- `fix:` correcao de bug
- `docs:` documentacao
- `refactor:` refatoracao sem mudanca de comportamento
- `test:` adicao ou correcao de testes
- `chore:` configuracao, CI, dependencias

### Testes

- Use o test runner nativo do Node.js (`node:test`)
- Nomeie testes descritivamente
- Testes ficam em `tests/` espelhando a estrutura de `src/`

## Duvidas?

Abra uma issue com a tag `question` ou inicie uma discussao no GitHub.
