export interface StoredCode {
  id: string;
  code: string;
  normalized: string;
  createdAt: number;
}

export interface IgnoredItem {
  text: string;
  reason: 'serial_number' | 'unrelated_text' | 'empty' | 'too_short' | 'url_or_email';
}

export interface ParseResult {
  candidateCodes: string[];
  ignoredItems: IgnoredItem[];
  duplicateInInput: string[];
}

export interface DetectionResult {
  newCodes: string[];
  newRecords: StoredCode[];
  alreadyInDbCodes: string[];
  alreadyInDbCount: number;
  duplicateInInputCount: number;
  duplicateInInputCodes: string[];
  ignoredCount: number;
  ignoredItems: IgnoredItem[];
  totalSavedCount: number;
  processedAt: number;
}

export type ActiveTab = 'detector' | 'saved';
