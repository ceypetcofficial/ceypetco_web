# Plesk deployment

Deploy the frontend and backend as separate sites. The repository root is a
Plesk-compatible backend workspace; `app.js` delegates to the existing backend
entry point without duplicating application logic.

## Backend (`api-dev.ceypetco.gov.lk`)

When Plesk clones the whole repository into `api-dev.ceypetco.gov.lk`, the
preferred configuration points directly at `backend`:

Use these Plesk Node.js settings:

| Setting | Value |
| --- | --- |
| Node.js version | 22 LTS |
| Application mode | `production` |
| Application root | `api-dev.ceypetco.gov.lk/backend` |
| Document root | `api-dev.ceypetco.gov.lk/backend/public` |
| Startup file | `src/server.js` |

Add the environment variables from `backend/.env.example` under **Custom
environment variables**. At minimum, replace all database credentials,
`JWT_SECRET`, `CLIENT_URL`, and `LOCAL_ASSET_BASE_URL` with production values.
Do not upload a real `.env` file or commit secrets.

Before installing, use the **open** link beside Application Root and verify it
contains `package.json`, `package-lock.json`, `public`, and `src`. The package
must be named `backend`.

In Plesk, run **NPM Install**, restart the app, and verify:

```text
https://api-dev.ceypetco.gov.lk/api/health
```

If Plesk keeps the application at the repository root, use this supported
fallback instead:

| Setting | Value |
| --- | --- |
| Node.js version | 22 LTS |
| Application mode | `production` |
| Application root | `api-dev.ceypetco.gov.lk` |
| Document root | `api-dev.ceypetco.gov.lk/backend/public` |
| Startup file | `app.js` |

The root package must be named `ceypetco-backend-host`. NPM Install at the root
installs the backend workspace directly and does not run a nested postinstall
command.

## Frontend (`dev.ceypetco.gov.lk`)

Set the production API URL before building:

```text
VITE_API_BASE_URL=https://api-dev.ceypetco.gov.lk/api
```

Save the variable as `frontend/.env.production`, then build:

```bash
cd frontend
npm ci
npm run build
```

Upload the **contents** of `frontend/dist` to the main domain's document root
(normally `httpdocs`). Disable Node.js for the frontend domain. The
`public/.htaccess` file is copied into `dist` during the build and makes direct
visits to React routes fall back to `index.html`.

## Troubleshooting

- `app.js is not found`: the frontend domain incorrectly has Node.js enabled,
  or the backend startup file is not set to `src/server.js`.
- `ceypetco-frontend-host@1.0.0 postinstall` appears while installing the API:
  pull and deploy the latest `main`; that obsolete package has been replaced
  by `ceypetco-backend-host` without a postinstall script.
- `nodenv: npm: command not found`: select Node.js 22 in Plesk and redeploy the
  latest root package before running NPM Install again.
- `DB_PASSWORD is required`: configure the `DB_*` variables in Plesk. The
  backend uses MySQL, not the obsolete `SQL_*` names.
- Browser CORS error: set backend `CLIENT_URL` to the exact frontend origin,
  without a trailing slash.
- API calls target the wrong server: rebuild the frontend after changing
  `VITE_API_BASE_URL`; Vite embeds this value at build time.
