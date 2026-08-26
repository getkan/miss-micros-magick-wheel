# Deploy To Vercel

This guide deploys Miss Micro's Magick Wheel to Vercel. The app is a Next.js 16 App
Router project, so Vercel needs no custom build configuration - the only required setup
is the Google Sheets environment variables.

## Before you start

- The project builds locally: `npm run lint && npm run build`.
- Your Google Sheet is connected and working locally. See
  [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md).
- You have a GitHub, GitLab, or Bitbucket account, and a Vercel account.

## 1. Check what is committed

`.gitignore` excludes every `.env*` file except `.env.example`, so your keys are not
pushed. That means **the environment variables must be added in Vercel separately** -
step 3.

The spin music lives in `public/`, which is committed. Confirm it is tracked:

```bash
git status --short public/
git check-ignore -v public/extreme-spiderman-bullshit.mp3 || echo "not ignored"
```

If the file is missing on the deployed site, the wheel still spins and the button
switches to "Music Unavailable".

## 2. Push to a Git repository

```bash
git add .
git commit -m "Add Google Sheets wheel"
git remote add origin git@github.com:<your-user>/miss-micros-magick-wheel.git
git push -u origin main
```

## 3. Import the project into Vercel

1. Go to https://vercel.com/new.
2. Choose **Import Git Repository** and pick the repository.
3. Vercel detects the **Next.js** framework preset. Leave the defaults:
   - Build command: `next build`
   - Output directory: `.next`
   - Install command: `npm install`
4. Expand **Environment Variables** and add the values from your local `.env.local`
   before clicking Deploy. See the table below.
5. Click **Deploy**.

## 4. Environment variables

Add these under **Project Settings > Environment Variables**. Apply them to
**Production**, **Preview**, and **Development** so previews work too.

| Variable | Required | Value |
| --- | --- | --- |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Yes | The sheet id, or the full sheet URL. |
| `GOOGLE_SHEETS_RANGE` | No | Defaults to `Wheel!A2:C`. |
| `GOOGLE_SHEETS_API_KEY` | Option A | For a link-viewable sheet. |
| `GOOGLE_SHEETS_CLIENT_EMAIL` | Option B | Service account address. |
| `GOOGLE_SHEETS_PRIVATE_KEY` | Option B | Service account key. |

Notes:

- None of these use the `NEXT_PUBLIC_` prefix, so they stay server-side and never reach
  the browser. Keep it that way.
- For `GOOGLE_SHEETS_PRIVATE_KEY`, paste the key into the Vercel input **including** its
  `\n` escape sequences, exactly as it appears in `.env.local`. Do not add surrounding
  quotes - Vercel stores the raw value.
- Changing an environment variable does not rebuild the site. Trigger a redeploy from
  **Deployments > ... > Redeploy** afterwards.

Alternatively, push them from the CLI:

```bash
npm i -g vercel
vercel login
vercel link
vercel env add GOOGLE_SHEETS_SPREADSHEET_ID production
```

## 5. Verify the deployment

1. Open the deployment URL, then navigate to `/wheel`.
2. Confirm the recommendations from the sheet are listed and the wheel renders.
3. Spin it and confirm the music plays and the winner modal appears.

If `/wheel` shows a configuration or read error, the message names the cause. Cross-check
it against the troubleshooting table in
[GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md).

## 6. How the sheet data is cached

`app/wheel/page.tsx` sets `export const revalidate = 300`, so the route is prerendered at
build time and regenerated at most once every 5 minutes.

Consequences on Vercel:

- The sheet is read during the build, so the environment variables must be present
  **before** the build runs, not just at runtime.
- An edit to the sheet appears within about 5 minutes. It is not instant.
- To publish a sheet change immediately, redeploy, or lower `revalidate`.

Because rendering happens on the server, the Google credentials are never sent to the
browser.

## 7. Custom domain

**Project Settings > Domains > Add**, then follow the DNS records Vercel shows. HTTPS is
provisioned automatically.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Build fails on `next build` | Run `npm run build` locally first; the same error appears there. |
| `/wheel` says the id is not set | Variable missing for that environment, or added after the build. Redeploy. |
| `/wheel` says it could not read the sheet | Sharing settings, wrong tab name in the range, or the Sheets API is not enabled on the Cloud project. |
| `error:1E08010C:DECODER routines::unsupported` | The service account key lost its `\n` escapes when pasted. |
| Sheet edits do not appear | Expected for up to 5 minutes because of `revalidate`. |
| Music does not play | The file is missing from `public/`, or the browser blocked autoplay. |
| API key rejected | Restrict the key to the Google Sheets API only; do not add HTTP referrer restrictions, since the call is server-side. |

## Rolling back

**Deployments**, find the last good deployment, then **... > Promote to Production**.
