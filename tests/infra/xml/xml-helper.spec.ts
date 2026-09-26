import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { escapeXml, sanitizeXmlChars, formatDateOnly } from '@core/infra/xml/xml-helper';

describe('sanitizeXmlChars', () => {
  it('deve preservar caracteres validos em XML 1.0', () => {
    const valid = 'Texto normal com acentos: àáâãéêíóôõúüç ÀÁÂÃÉÊÍÓÔÕÚÜÇ';
    assert.equal(sanitizeXmlChars(valid), valid);
  });

  it('deve preservar tab, LF e CR', () => {
    assert.equal(sanitizeXmlChars('a\tb\nc\rd'), 'a\tb\nc\rd');
  });

  it('deve remover C0 controls (exceto tab/LF/CR)', () => {
    assert.equal(sanitizeXmlChars('abc\x00\x01\x08def'), 'abcdef');
    assert.equal(sanitizeXmlChars('abc\x0B\x0C\x0E\x1Fdef'), 'abcdef');
  });

  it('deve remover DEL (0x7F)', () => {
    assert.equal(sanitizeXmlChars('abc\x7Fdef'), 'abcdef');
  });

  it('deve remover C1 controls (U+0080-U+009F)', () => {
    // Esses bytes em Windows-1252 seriam chars como euro, smart quotes, etc.
    // Mas em Unicode sao controles invalidos em XML 1.0
    assert.equal(sanitizeXmlChars('abc\x80\x85\x9Fdef'), 'abcdef');
  });

  it('deve remover U+FFFE e U+FFFF', () => {
    assert.equal(sanitizeXmlChars('abc\uFFFE\uFFFFdef'), 'abcdef');
  });

  it('deve preservar emojis e caracteres Unicode validos', () => {
    const withEmoji = 'Produto \u{1F4E6} entregue';
    assert.equal(sanitizeXmlChars(withEmoji), withEmoji);
  });
});

describe('escapeXml', () => {
  it('deve escapar entidades XML e sanitizar chars invalidos', () => {
    // C1 control \x85 deve ser removido, & deve ser escapado
    assert.equal(escapeXml('A\x85&B'), 'A&amp;B');
  });

  it('deve escapar todos os 5 caracteres especiais XML', () => {
    assert.equal(escapeXml('<tag attr="val" & \'x\'>'), '&lt;tag attr=&quot;val&quot; &amp; &apos;x&apos;&gt;');
  });
});

describe('formatDateOnly', () => {
  it('deve formatar como AAAA-MM-DD', () => {
    assert.equal(formatDateOnly(new Date('2026-04-28T10:00:00')), '2026-04-28');
  });

  it('deve usar a data local, sem deslocar o dia', () => {
    // Meia-noite local: com getters UTC o dia voltaria para 27 em fusos negativos.
    assert.equal(formatDateOnly(new Date('2026-04-28T00:00:00')), '2026-04-28');
  });

  it('deve preencher mes e dia com zero a esquerda', () => {
    assert.equal(formatDateOnly(new Date('2026-01-05T12:00:00')), '2026-01-05');
  });
});
