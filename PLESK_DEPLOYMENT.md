# Plesk deployment

Deploy the frontend and backend as separate sites. The frontend is a static Vite
build; only the backend should be configured as a Plesk Node.js application.

## Backend (`api.example.com`)

Upload the contents of `backend` to the API subdomain's application root. The
application root must contain `package.json`, `package-lock.json`, `src`, and
`uploads` (the latter can be created empty).

Use these Plesk Node.js settings:

| Setting | Value |
| --- | --- |
| Node.js version | 22 LTS |
| Application mode | `production` |
| Application root | API subdomain directory |
| Document root | API subdomain directory |
| Startup file | `src/server.js` |

Add the environment variables from `backend/.env.example` under **Custom
environment variables**. At minimum, replace all database credentials,
`JWT_SECRET`, `CLIENT_URL`, and `LOCAL_ASSET_BASE_URL` with production values.
Do not upload a real `.env` file or commit secrets.

In Plesk, run **NPM Install**, restart the app, and verify:

```text
https://api.example.com/api/health
```

## Frontend (`example.com`)

Set the production API URL before building:

```text
VITE_API_BASE_URL=https://api.example.com/api
```

Save it as `frontend/.env.production` locally, then build:

```bash
cd frontend
npm ci
npm run build
```

Upload the **contents** of `frontend/dist` to the main domain's document root
(normally `httpdocs`). Disable Node.js for the main frontend domain. The
`public/.htaccess` file is copied into `dist` during the build and makes direct
visits to React routes fall back to `index.html`.

## Troubleshooting

- `app.js is not found`: the frontend domain incorrectly has Node.js enabled,
  or the backend startup file is not set to `src/server.js`.
- `DB_PASSWORD is required`: configure the `DB_*` variables in Plesk. The
  backend uses MySQL, not the obsolete `SQL_*` names.
- Browser CORS error: set backend `CLIENT_URL` to the exact frontend origin,
  without a trailing slash.
- API calls target the wrong server: rebuild the frontend after changing
  `VITE_API_BASE_URL`; Vite embeds this value at build time.
