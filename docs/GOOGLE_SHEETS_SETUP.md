# Connect Your Google Sheet

This guide connects Miss Micro's Magick Wheel to a Google Sheet that holds the book
recommendations. Pick **Option A** for a sheet you are happy to make link-viewable, or
**Option B** if the sheet must stay private.

## 1. Prepare the sheet

1. Create a Google Sheet (or open the existing one).
2. Put one recommendation per row:

   | A (Recommendation)        | B (Recommender) | C (Weight)  |
   | ------------------------- | --------------- | ----------- |
   | White Sands by Geoff Dyer | Nick            | 1.5         |
   | A Canticle for Leibowitz  | Josh            | 2.5         |

   Row 1 is treated as a header and skipped by the default range `Wheel!A2:C`.

   - **Column A** is required. Rows with an empty column A are skipped, so a
     recommender who has not picked yet can still hold a row.
   - **Column B** is optional and shown alongside the title.
   - **Column C** is the recommender's share of the wheel. It is multiplied by 15 and
     rounded to the nearest whole number to get how many slices the recommendation
     occupies, with a minimum of 1. A weight of `1.5` becomes 23 slices, `2.5` becomes
     38. Formulas are fine - the raw computed number is read, not the displayed string.
     A missing, non-numeric, or non-positive weight falls back to 1 slice.
   - Duplicate rows are kept. The same title from the same recommender twice gives that
     book two slices.
3. Copy the spreadsheet id from the URL:

   ```
   https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit#gid=0
   ```

   Pasting the whole URL into `GOOGLE_SHEETS_SPREADSHEET_ID` also works - the id is
   extracted automatically.
4. Note the tab name for the range setting if it is not `Wheel`.

## 2. Enable the Google Sheets API

1. Go to https://console.cloud.google.com/ and create (or select) a project.
2. Open **APIs & Services > Library**.
3. Search for **Google Sheets API** and click **Enable**.

## Option A: API key (public, link-viewable sheet)

1. In **APIs & Services > Credentials**, click **Create credentials > API key**.
2. Copy the key, then click **Edit API key** and restrict it:
   - **API restrictions**: restrict to **Google Sheets API**.
   - **Application restrictions**: leave as *None* (the key is used server-side, so
     HTTP referrer restrictions do not apply).
3. In the sheet, click **Share > General access > Anyone with the link > Viewer**.
4. Fill in `.env.local`:

   ```bash
   GOOGLE_SHEETS_SPREADSHEET_ID=1AbC...xyz
   GOOGLE_SHEETS_RANGE=Wheel!A2:C
   GOOGLE_SHEETS_API_KEY=AIza...
   ```

An API key can only read sheets that are shared with anyone holding the link.

## Option B: Service account (private sheet)

1. In **APIs & Services > Credentials**, click **Create credentials > Service account**.
2. Give it a name, skip the optional role and user steps, and click **Done**.
3. Open the service account, go to the **Keys** tab, and choose
   **Add key > Create new key > JSON**. A JSON file downloads.
4. From that JSON file take `client_email` and `private_key`.
5. In the sheet, click **Share**, paste the `client_email` address, and give it **Viewer**
   access.
6. Fill in `.env.local`. The private key must stay on one line with literal `\n`
   sequences, wrapped in double quotes:

   ```bash
   GOOGLE_SHEETS_SPREADSHEET_ID=1AbC...xyz
   GOOGLE_SHEETS_RANGE=Wheel!A2:C
   GOOGLE_SHEETS_CLIENT_EMAIL=wheel-reader@my-project.iam.gserviceaccount.com
   GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
   ```

Keep the downloaded JSON file out of the repository. `.env.local` is git-ignored.

## 3. Run it

```bash
npm run dev
```

Open http://localhost:3000/wheel. Environment variables are read at server start, so
restart `npm run dev` after editing `.env.local`.

## 4. Deploying

Add the same variables in your host's environment settings (for Vercel:
**Project Settings > Environment Variables**). Do not use the `NEXT_PUBLIC_` prefix -
these values must never reach the browser.

## Configuration reference

| Variable | Required | Notes |
| --- | --- | --- |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Yes | Id from the sheet URL. A full URL also works. |
| `GOOGLE_SHEETS_RANGE` | No | A1 range. Defaults to `Wheel!A2:C`. |
| `GOOGLE_SHEETS_API_KEY` | Option A | Requires a link-viewable sheet. |
| `GOOGLE_SHEETS_CLIENT_EMAIL` | Option B | Service account email, shared on the sheet. |
| `GOOGLE_SHEETS_PRIVATE_KEY` | Option B | Quoted, with `\n` escapes. |

## Troubleshooting

| Message | Cause |
| --- | --- |
| `GOOGLE_SHEETS_SPREADSHEET_ID is not set` | `.env.local` missing or dev server not restarted. |
| `No Google credentials found` | Neither the API key nor both service account values are set. |
| `The caller does not have permission` | Sheet not shared with the link or the service account. |
| `Unable to parse range` | Tab name in `GOOGLE_SHEETS_RANGE` does not match the sheet. |
| `Google Sheets API has not been used in project ...` | The API is not enabled for that Cloud project. |
| `error:1E08010C:DECODER routines::unsupported` | The private key lost its `\n` escapes or quotes. |

Fetched data is cached for 5 minutes (`export const revalidate = 300` in
[app/wheel/page.tsx](../app/wheel/page.tsx)), so sheet edits can take that long to appear.
