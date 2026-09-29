# Plesk deployment

Deploy the frontend and backend as separate sites. The repository root includes
a small Node.js host for Plesk Git deployments: `npm install` builds the Vite
frontend and `app.js` serves the generated files.

## Backend (`api-dev.ceypetco.gov.lk`)

When Plesk clones the whole repository into `api-dev.ceypetco.gov.lk`, point
the Node.js application at the repository's `backend` directory. Do not run
NPM Install from the repository root: its package is the separate frontend
host and is named `ceypetco-frontend-host`.

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
must be named `backend`, not `ceypetco-frontend-host`.

In Plesk, run **NPM Install**, restart the app, and verify:

```text
https://api-dev.ceypetco.gov.lk/api/health
```

## Frontend (`example.com`) with Plesk Node.js

Set the production API URL before building:

```text
VITE_API_BASE_URL=https://api.example.com/api
```

When Plesk clones the whole repository, use these Node.js settings:

| Setting | Value |
| --- | --- |
| Node.js version | 22 LTS or newer |
| Application mode | `production` |
| Application root | Repository root |
| Document root | Repository root |
| Startup file | `app.js` |

Add `VITE_API_BASE_URL` under **Custom environment variables**, run **NPM
Install**, and restart the application. The root `postinstall` script runs:

```bash
npm --prefix frontend ci
npm --prefix frontend run build
```

The application then serves `frontend/dist`. A production page must load
JavaScript from `/assets/...`, never `/src/main.jsx`.

## Frontend as static hosting

Alternatively, save the variable as `frontend/.env.production` locally, then
build:

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
  the backend Application Root is incorrectly set to the repository root;
  change it to `api-dev.ceypetco.gov.lk/backend`.
- `nodenv: npm: command not found`: select Node.js 22 in Plesk. If it occurs
  together with `ceypetco-frontend-host`, correct the Application Root first.
- `DB_PASSWORD is required`: configure the `DB_*` variables in Plesk. The
  backend uses MySQL, not the obsolete `SQL_*` names.
- Browser CORS error: set backend `CLIENT_URL` to the exact frontend origin,
  without a trailing slash.
- API calls target the wrong server: rebuild the frontend after changing
  `VITE_API_BASE_URL`; Vite embeds this value at build time.
