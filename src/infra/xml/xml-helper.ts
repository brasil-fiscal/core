/**
 * Helper para construir XML sem dependencias externas.
 * Gera strings XML validas com escape de caracteres especiais.
 */

export function escapeXml(value: string): string {
  return sanitizeXmlChars(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Remove caracteres invalidos em XML 1.0.
 * Permitidos: #x9 | #xA | #xD | [#x20-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]
 * Isso elimina C0 controls (exceto tab/LF/CR), DEL, C1 controls (U+0080-009F),
 * e os codepoints U+FFFE/U+FFFF que causam rejeicao 402 na SEFAZ.
 */
export function sanitizeXmlChars(value: string): string {
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\x80-\x9F\uFFFE\uFFFF]/g, '');
}

export function tag(name: string, value: string | number | undefined, attrs?: string): string {
  if (value === undefined || value === null || value === '') return '';
  const escaped = typeof value === 'string' ? escapeXml(value) : String(value);
  const attrStr = attrs ? ` ${attrs}` : '';
  return `<${name}${attrStr}>${escaped}</${name}>`;
}

export function tagGroup(name: string, content: string, attrs?: string): string {
  if (!content) return '';
  const attrStr = attrs ? ` ${attrs}` : '';
  return `<${name}${attrStr}>${content}</${name}>`;
}

export function formatNumber(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

export function formatDate(date: Date, utcOffset: string = '-03:00'): string {
  const sign = utcOffset.startsWith('+') ? 1 : -1;
  const [h, m] = utcOffset.replace(/[+-]/, '').split(':').map(Number);
  const offsetMs = sign * (h * 60 + m) * 60 * 1000;

  const local = new Date(date.getTime() + offsetMs);

  const yyyy = local.getUTCFullYear();
  const MM = String(local.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(local.getUTCDate()).padStart(2, '0');
  const hh = String(local.getUTCHours()).padStart(2, '0');
  const mm = String(local.getUTCMinutes()).padStart(2, '0');
  const ss = String(local.getUTCSeconds()).padStart(2, '0');

  return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}${utcOffset}`;
}

export function padLeft(value: number | string, length: number): string {
  return String(value).padStart(length, '0');
}
