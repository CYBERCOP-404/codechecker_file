import { ParseResult, IgnoredItem } from '../types';

/**
 * Common non-code words and headers to ignore
 */
const UNRELATED_WORDS = new Set([
  'CODE', 'CODES', 'SERIAL', 'SERIALS', 'NUMBER', 'NUMBERS', 'NO', 'SL', 'INDEX',
  'STATUS', 'VALID', 'INVALID', 'EXPIRED', 'USED', 'AVAILABLE', 'REDEEMED',
  'CLAIMED', 'ACTIVE', 'INACTIVE', 'DATE', 'TIME', 'NAME', 'NOTE', 'NOTES',
  'SUCCESS', 'FAIL', 'FAILED', 'PENDING', 'RESULT', 'TOTAL', 'LIST', 'GIFT',
  'CARD', 'VOUCHER', 'COUPON', 'KEY', 'PROMO', 'PROMOTION', 'DISCOUNT', 'FREE',
  'TEST', 'DEMO', 'USER', 'PASS', 'PASSWORD', 'EMAIL', 'PHONE', 'URL', 'LINK',
  'TRUE', 'FALSE', 'NULL', 'UNDEFINED', 'YES', 'NO', 'OK', 'ERROR', 'WARNING'
]);

/**
 * Pattern for detecting serial numbers / bullet prefixes at start of line
 * e.g. "1.", "1)", "[1]", "#01:", "SL: 1", "No. 1", "001 -"
 */
const SERIAL_PREFIX_REGEX = /^\s*(?:#?\d+[\.\)\:\-\/]\s*|\[\d+\]\s*|\(\d+\)\s*|(?:sl|no|serial|index|item)\.?\s*#?\d+[\:\.\-\s]*)/i;

/**
 * Labels to strip if directly preceding the code
 * e.g. "Code: ABCD", "Voucher -> 1234"
 */
const LABEL_PREFIX_REGEX = /^(?:code|key|voucher|promo|coupon|gift|serial|token|card|pin)[\s\:\-\>\=]+/i;

/**
 * Parses raw pasted text, extracts clean unique candidate codes,
 * and categorizes serial numbers, duplicates, and unrelated noise.
 */
export function parseRawInput(rawText: string): ParseResult {
  const candidateCodes: string[] = [];
  const ignoredItems: IgnoredItem[] = [];
  const duplicateInInput: string[] = [];
  const seenUpperInInput = new Set<string>();

  if (!rawText || !rawText.trim()) {
    return { candidateCodes, ignoredItems, duplicateInInput };
  }

  // Split into lines first
  const rawLines = rawText.split(/\r?\n/);

  for (const rawLine of rawLines) {
    const lineTrimmed = rawLine.trim();

    if (!lineTrimmed) {
      continue;
    }

    // Check if entire line is a URL or Email
    if (/^https?:\/\//i.test(lineTrimmed) || /^www\./i.test(lineTrimmed) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lineTrimmed)) {
      ignoredItems.push({ text: lineTrimmed, reason: 'url_or_email' });
      continue;
    }

    // Strip serial prefix at start of line (e.g. "1. ", "01) ", "#5 - ")
    let cleanedLine = lineTrimmed.replace(SERIAL_PREFIX_REGEX, '').trim();

    // If removing the serial prefix left the line empty, it was pure serial number line
    if (!cleanedLine) {
      ignoredItems.push({ text: lineTrimmed, reason: 'serial_number' });
      continue;
    }

    // If the line had table pipes or commas, inspect segments
    // Example: "1 | ABCD-1234 | Valid" or "ABCD-1234, EFGH-5678"
    const segments = cleanedLine.includes('|')
      ? cleanedLine.split('|').map(s => s.trim()).filter(Boolean)
      : cleanedLine.includes(';')
      ? cleanedLine.split(';').map(s => s.trim()).filter(Boolean)
      : cleanedLine.includes(',')
      ? cleanedLine.split(',').map(s => s.trim()).filter(Boolean)
      : [cleanedLine];

    for (const segment of segments) {
      let token = segment.trim();

      // Strip common label prefixes like "Code: " or "Key - "
      token = token.replace(LABEL_PREFIX_REGEX, '').trim();

      // Clean outer punctuation/brackets: quotes, parentheses, brackets, colons
      token = token.replace(/^["'`(\[{<]+/, '').replace(/["'`)\]}>;,:.]+$/, '').trim();

      if (!token) continue;

      // Check if token is purely a serial / sequential number
      // e.g. "1", "002", "9999" (without letters, length < 8)
      if (/^\d+$/.test(token) && token.length <= 7) {
        ignoredItems.push({ text: token, reason: 'serial_number' });
        continue;
      }

      // Check if token is a known unrelated word or label
      const upperToken = token.toUpperCase();
      if (UNRELATED_WORDS.has(upperToken)) {
        ignoredItems.push({ text: token, reason: 'unrelated_text' });
        continue;
      }

      // Check if it's too short to be a meaningful code (e.g., < 4 chars)
      if (token.length < 4) {
        ignoredItems.push({ text: token, reason: 'too_short' });
        continue;
      }

      // Check if it's just a sentence of ordinary English words (space separated words)
      // If it contains spaces, let's see if it's multiple codes or a sentence
      if (token.includes(' ')) {
        const words = token.split(/\s+/);
        // If it looks like a sentence of standard words
        if (words.length > 3) {
          ignoredItems.push({ text: token, reason: 'unrelated_text' });
          continue;
        }
        // If it's 2 or 3 tokens, re-process each word
        for (const subWord of words) {
          processSingleCodeToken(subWord, candidateCodes, ignoredItems, duplicateInInput, seenUpperInInput);
        }
        continue;
      }

      processSingleCodeToken(token, candidateCodes, ignoredItems, duplicateInInput, seenUpperInInput);
    }
  }

  return {
    candidateCodes,
    ignoredItems,
    duplicateInInput,
  };
}

function processSingleCodeToken(
  rawToken: string,
  candidateCodes: string[],
  ignoredItems: IgnoredItem[],
  duplicateInInput: string[],
  seenUpperInInput: Set<string>
) {
  let token = rawToken.replace(/^["'`(\[{<]+/, '').replace(/["'`)\]}>;,:.]+$/, '').trim();
  if (!token) return;

  // Pure digits <= 7 length is serial
  if (/^\d+$/.test(token) && token.length <= 7) {
    ignoredItems.push({ text: token, reason: 'serial_number' });
    return;
  }

  const upper = token.toUpperCase();
  if (UNRELATED_WORDS.has(upper)) {
    ignoredItems.push({ text: token, reason: 'unrelated_text' });
    return;
  }

  if (token.length < 4) {
    ignoredItems.push({ text: token, reason: 'too_short' });
    return;
  }

  // A valid code should have reasonable character composition (alphanumeric, dashes, underscores)
  // Must contain at least one alphanumeric character
  if (!/[a-zA-Z0-9]/.test(token)) {
    ignoredItems.push({ text: token, reason: 'unrelated_text' });
    return;
  }

  // Deduplicate within the same input (case-insensitive)
  if (seenUpperInInput.has(upper)) {
    duplicateInInput.push(token);
    return;
  }

  seenUpperInInput.add(upper);
  candidateCodes.push(token);
}

/**
 * Formats copied codes with the required brand header
 * Code From > CYBER COP-404
 * CODE1
 * CODE2
 */
export function formatOutputForClipboard(codes: string[]): string {
  const header = 'Code From > CYBER COP-404';
  if (!codes || codes.length === 0) {
    return header;
  }
  return `${header}\n${codes.join('\n')}`;
}
