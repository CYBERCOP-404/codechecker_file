import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Persistent Database File Storage
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'codes_db.json');

export interface StoredCode {
  id: string;
  code: string;
  normalized: string;
  createdAt: number;
}

// In-memory store backed by persistent JSON file for high-concurrency (1,000+ visitors)
let codesMap = new Map<string, StoredCode>();
let isWriting = false;
let pendingSave = false;

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load database from file
function loadDatabase(): void {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed: StoredCode[] = JSON.parse(data);
      codesMap = new Map();
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && item.code && item.normalized) {
            codesMap.set(item.normalized, item);
          }
        }
      }
      console.log(`[DB] Successfully loaded ${codesMap.size} unique codes from disk.`);
    } else {
      // Initialize with empty database
      fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
      console.log('[DB] Initialized new empty database file.');
    }
  } catch (err) {
    console.error('[DB] Error loading database file:', err);
    codesMap = new Map();
  }
}

// Atomic save to disk to prevent corruption under load
async function persistDatabase(): Promise<void> {
  if (isWriting) {
    pendingSave = true;
    return;
  }
  isWriting = true;
  pendingSave = false;

  try {
    const list = Array.from(codesMap.values());
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    await fs.promises.writeFile(tempFile, JSON.stringify(list, null, 2), 'utf-8');
    await fs.promises.rename(tempFile, DB_FILE);
  } catch (err) {
    console.error('[DB] Error persisting database:', err);
  } finally {
    isWriting = false;
    if (pendingSave) {
      persistDatabase();
    }
  }
}

// Initialize DB
loadDatabase();

// API Endpoints
// 1. Get all saved unique codes (or filter by search query)
app.get('/api/codes', (req: Request, res: Response) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim().toUpperCase() : '';
    let codes = Array.from(codesMap.values()).sort((a, b) => b.createdAt - a.createdAt);

    if (q) {
      codes = codes.filter(item => item.normalized.includes(q));
    }

    res.json({
      success: true,
      total: codesMap.size,
      count: codes.length,
      codes: codes,
    });
  } catch (err) {
    console.error('Error fetching codes:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve codes' });
  }
});

// 2. Check and save newly detected unique codes
// Compares case-insensitively with all previously saved codes
app.post('/api/codes/check-and-save', async (req: Request, res: Response) => {
  try {
    const { codes } = req.body;
    if (!Array.isArray(codes)) {
      return res.status(400).json({ success: false, error: 'Expected an array of codes' });
    }

    const newlyAdded: StoredCode[] = [];
    const alreadyInDb: string[] = [];
    const duplicateInInput: string[] = [];
    const seenInInput = new Set<string>();

    for (const raw of codes) {
      if (typeof raw !== 'string') continue;
      const trimmed = raw.trim();
      if (!trimmed) continue;
      const normalized = trimmed.toUpperCase();

      if (seenInInput.has(normalized)) {
        duplicateInInput.push(trimmed);
        continue;
      }
      seenInInput.add(normalized);

      if (codesMap.has(normalized)) {
        alreadyInDb.push(trimmed);
      } else {
        const newRecord: StoredCode = {
          id: `code_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          code: trimmed,
          normalized: normalized,
          createdAt: Date.now(),
        };
        codesMap.set(normalized, newRecord);
        newlyAdded.push(newRecord);
      }
    }

    if (newlyAdded.length > 0) {
      persistDatabase();
    }

    res.json({
      success: true,
      newCodes: newlyAdded.map(item => item.code),
      newRecords: newlyAdded,
      alreadyInDbCount: alreadyInDb.length,
      alreadyInDbCodes: alreadyInDb,
      duplicateInInputCount: duplicateInInput.length,
      totalSavedCount: codesMap.size,
    });
  } catch (err) {
    console.error('Error saving codes:', err);
    res.status(500).json({ success: false, error: 'Failed to process codes' });
  }
});

// 3. Delete an individual code by ID
app.delete('/api/codes/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let foundNormalized: string | null = null;

    for (const [norm, item] of codesMap.entries()) {
      if (item.id === id) {
        foundNormalized = norm;
        break;
      }
    }

    if (!foundNormalized) {
      return res.status(404).json({ success: false, error: 'Code not found' });
    }

    codesMap.delete(foundNormalized);
    persistDatabase();

    res.json({
      success: true,
      message: 'Code deleted successfully',
      totalSavedCount: codesMap.size,
    });
  } catch (err) {
    console.error('Error deleting code:', err);
    res.status(500).json({ success: false, error: 'Failed to delete code' });
  }
});

// 4. Clear all codes (with optional confirmation)
app.delete('/api/codes', async (req: Request, res: Response) => {
  try {
    codesMap.clear();
    persistDatabase();
    res.json({
      success: true,
      message: 'All codes have been cleared',
      totalSavedCount: 0,
    });
  } catch (err) {
    console.error('Error clearing codes:', err);
    res.status(500).json({ success: false, error: 'Failed to clear codes' });
  }
});

// 5. System stats
app.get('/api/stats', (req: Request, res: Response) => {
  res.json({
    success: true,
    totalUniqueCodes: codesMap.size,
    status: 'online',
    timestamp: Date.now(),
  });
});

// Mount Vite or static server
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[CYBER COP-404 Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
