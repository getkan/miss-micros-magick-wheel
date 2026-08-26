import 'server-only';

import { google, type sheets_v4 } from 'googleapis';
import type { WheelEntry } from '@/lib/wheelTypes';

export type { WheelEntry };

export type WheelDataResult =
    | { status: 'ok'; entries: WheelEntry[] }
    | { status: 'empty'; entries: [] }
    | { status: 'not-configured'; message: string }
    | { status: 'error'; message: string };

const DEFAULT_RANGE = 'Wheel!A2:C';
const WEIGHT_MULTIPLIER = 20;
const DEFAULT_WEIGHT = 1;

// Accepts a bare id or a full spreadsheet URL pasted from the browser.
function parseSpreadsheetId(value: string | undefined): string | undefined {
    const trimmed = value?.trim();
    if (!trimmed) return undefined;

    return trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1] ?? trimmed;
}

function readConfig() {
    const spreadsheetId = parseSpreadsheetId(process.env.GOOGLE_SHEETS_SPREADSHEET_ID);
    const range = process.env.GOOGLE_SHEETS_RANGE?.trim() || DEFAULT_RANGE;
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY?.trim();
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL?.trim();
    // Newlines survive .env files as literal "\n", so restore them before use.
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n').trim();

    return { spreadsheetId, range, apiKey, clientEmail, privateKey };
}

function createClient(config: ReturnType<typeof readConfig>): sheets_v4.Sheets | null {
    if (config.clientEmail && config.privateKey) {
        const auth = new google.auth.JWT({
            email: config.clientEmail,
            key: config.privateKey,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
        });

        return google.sheets({ version: 'v4', auth });
    }

    if (config.apiKey) {
        return google.sheets({ version: 'v4', auth: config.apiKey });
    }

    return null;
}

function toText(cell: unknown): string {
    if (typeof cell === 'string') return cell.trim();
    if (typeof cell === 'number') return String(cell);

    return '';
}

function toWeight(cell: unknown): number {
    const parsed = typeof cell === 'number' ? cell : Number.parseFloat(toText(cell).replace(',', '.'));

    if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_WEIGHT;

    // The sheet stores a fractional share; the wheel needs a whole number of slices.
    return Math.max(DEFAULT_WEIGHT, Math.round(parsed * WEIGHT_MULTIPLIER));
}

function slugify(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

/** Column A = recommendation, B = recommender, C = weight. Rows without a title are skipped. */
function normalizeRows(rows: unknown[][]): WheelEntry[] {
    const entries: WheelEntry[] = [];

    rows.forEach((row, rowIndex) => {
        const title = toText(row?.[0]);
        if (!title) return;

        const recommender = toText(row?.[1]);

        entries.push({
            // Duplicate title/recommender pairs are valid, so the row index keeps ids unique.
            id: `${rowIndex}-${slugify(`${title}-${recommender}`)}`,
            title,
            recommender,
            weight: toWeight(row?.[2])
        });
    });

    return entries;
}

export async function getWheelEntries(): Promise<WheelDataResult> {
    const config = readConfig();

    if (!config.spreadsheetId) {
        return {
            status: 'not-configured',
            message: 'GOOGLE_SHEETS_SPREADSHEET_ID is not set. See docs/GOOGLE_SHEETS_SETUP.md.'
        };
    }

    const sheets = createClient(config);

    if (!sheets) {
        return {
            status: 'not-configured',
            message:
                'No Google credentials found. Set GOOGLE_SHEETS_API_KEY, or GOOGLE_SHEETS_CLIENT_EMAIL and GOOGLE_SHEETS_PRIVATE_KEY. See docs/GOOGLE_SHEETS_SETUP.md.'
        };
    }

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: config.spreadsheetId,
            range: config.range,
            majorDimension: 'ROWS',
            // Weights are formula results, so read raw numbers rather than display strings.
            valueRenderOption: 'UNFORMATTED_VALUE'
        });

        const entries = normalizeRows(response.data.values ?? []);

        if (entries.length === 0) {
            return { status: 'empty', entries: [] };
        }

        return { status: 'ok', entries };
    } catch (error) {
        // Google errors can embed the request URL and key, so only the message is surfaced.
        const message = error instanceof Error ? error.message : 'Unknown Google Sheets error.';
        console.error('[googleSheets] Failed to read spreadsheet range', message);

        return {
            status: 'error',
            message: 'The wheel could not read the Google Sheet.'
        };
    }
}
