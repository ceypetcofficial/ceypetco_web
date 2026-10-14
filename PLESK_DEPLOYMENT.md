# Plesk deployment

Deploy the frontend and backend as separate sites. The repository root is a
Plesk-compatible backend workspace; `app.js` delegates to the existing backend
entry point without duplicating application logic.

## Backend (`api.ceypetco.gov.lk`)

When Plesk clones the whole repository into `api.ceypetco.gov.lk`, the
preferred configuration points directly at `backend`:

Use these Plesk Node.js settings:

| Setting | Value |
| --- | --- |
| Node.js version | 22 LTS |
| Application mode | `production` |
| Application root | `api.ceypetco.gov.lk/backend` |
| Document root | `api.ceypetco.gov.lk/backend/public` |
| Startup file | `app.js` |

Add the environment variables from `backend/.env.example` under **Custom
environment variables**. At minimum, replace all database credentials,
`JWT_SECRET`, `CLIENT_URL`, and `LOCAL_ASSET_BASE_URL` with production values.
Do not upload a real `.env` file or commit secrets.

Before installing, use the **open** link beside Application Root and verify it
contains `package.json`, `package-lock.json`, `public`, and `src`. The package
must be named `backend`.

In Plesk, run **NPM Install**, restart the app, and verify:

```text
https://api.ceypetco.gov.lk/api/health
```

If Plesk keeps the application at the repository root, use this supported
fallback instead:

| Setting | Value |
| --- | --- |
| Node.js version | 22 LTS |
| Application mode | `production` |
| Application root | `api.ceypetco.gov.lk` |
| Document root | `api.ceypetco.gov.lk/backend/public` |
| Startup file | `app.js` |

The root package must be named `ceypetco-backend-host`. NPM Install at the root
installs the backend workspace directly and does not run a nested postinstall
command.

## Frontend (`dev.ceypetco.gov.lk`)

Set the production API URL before building:

```text
VITE_API_BASE_URL=https://api.ceypetco.gov.lk/api
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

- `app.js is not found`: the application root is wrong or the deployed backend
  is incomplete. Open the application root and verify that `app.js`,
  `package.json`, `src`, and `public` are directly inside it. The startup file
  must be `app.js`.
- `ceypetco-frontend-host@1.0.0 postinstall` appears while installing the API:
  pull and deploy the latest `main`; that obsolete package has been replaced
  by `ceypetco-backend-host` without a postinstall script.
- `nodenv: node: command not found` or `nodenv: npm: command not found`: select
  Node.js 22 in Plesk and redeploy the latest package before running NPM Install
  again. The repository includes `.node-version` files in both supported
  application roots so nodenv selects Node.js 22 during dependency lifecycle
  scripts. If the error path is outside the selected application root, correct
  the Plesk application root before retrying.
- Plesk HTML `404 Not Found` at `/api/health`: Node.js is disabled or is not
  attached to the API domain. Open **Websites & Domains > api.ceypetco.gov.lk >
  Node.js**, verify the application root, document root, and startup file above,
  then click **Enable Node.js** (or **Restart App** when already enabled).
- `DB_PASSWORD is required`: configure the `DB_*` variables in Plesk. The
  backend uses MySQL, not the obsolete `SQL_*` names.
- Browser CORS error: set backend `CLIENT_URL` to the exact frontend origin,
  without a trailing slash.
- API calls target the wrong server: rebuild the frontend after changing
  `VITE_API_BASE_URL`; Vite embeds this value at build time.
