# CEYPETCO CloudPanel frontend deployment

## Production topology

- `https://ceypetco.gov.lk` -> CloudPanel nginx -> React/Vite static files
- `https://api.ceypetco.gov.lk` -> Plesk -> Node/Express -> MariaDB/MySQL

The frontend deployment must not copy files to, restart, or otherwise modify the
Plesk backend.

## One-time CloudPanel nginx change

In CloudPanel, open the Vhost for `ceypetco.gov.lk`. Preserve its existing SSL,
logging, security, PHP, and compression directives. In the existing
`location /` block, set:

```nginx
try_files $uri $uri/ /index.html;
```

Do not add a second `location /` block. The complete reference fragment is in
`deploy/cloudpanel-nginx-spa.conf`. Validate and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## GitHub Actions secrets

Add these repository or `production` environment secrets:

- `CLOUDPANEL_SSH_HOST`: `43.224.126.218`
- `CLOUDPANEL_SSH_PORT`: the CloudPanel SSH port, normally `22`
- `CLOUDPANEL_SSH_USER`: the site user whose home contains
  `htdocs/ceypetco.gov.lk`
- `CLOUDPANEL_SSH_PRIVATE_KEY`: a dedicated Ed25519 deployment private key
- `CLOUDPANEL_SSH_KNOWN_HOSTS`: the verified server host-key line

Generate a deployment key locally and add only its public half to the site
user's `~/.ssh/authorized_keys`:

```bash
ssh-keygen -t ed25519 -C ceypetco-frontend-deploy -f ceypetco_frontend_deploy
ssh-keyscan -H 43.224.126.218
```

Verify the fingerprint through the CloudPanel console before saving the
`ssh-keyscan` output as the known-hosts secret.

On every push to `main`, `.github/workflows/frontend-build.yml` now runs
`npm ci`, builds with the production API origin, packages `frontend/dist`, and
invokes `deploy/cloudpanel-frontend-deploy.sh` over SSH. The server script:

- validates the build before publishing;
- backs up only frontend-managed paths;
- synchronizes only `assets`, `images`, `documents`, `index.html`,
  `favicon.svg`, and `.htaccess`;
- preserves `.well-known` and unrelated CloudPanel files;
- publishes `index.html` last.

Backups are stored in `~/ceypetco-deployments/backups`. To roll back, inspect
the archive first and restore it into the site root:

```bash
tar -tzf ~/ceypetco-deployments/backups/FRONTEND_BACKUP.tar.gz
tar -xzf ~/ceypetco-deployments/backups/FRONTEND_BACKUP.tar.gz \
  -C ~/htdocs/ceypetco.gov.lk
```

## Backend upload repair

Production CMS records previously contained `localhost:5001` upload URLs and
the corresponding files were absent from the Plesk upload directory. This is
separate from the CloudPanel frontend deployment.

1. Upload `ceypetco-backend-upload-images.tar.gz` to the Plesk application
   account.
2. Extract it into the backend's existing `uploads/images` directory without
   replacing application source files.
3. Run `database/fix-production-asset-urls.sql` against the production
   database after taking a backup.
4. Ensure the backend environment contains:

```ini
CLIENT_URL=https://ceypetco.gov.lk,https://www.ceypetco.gov.lk
LOCAL_ASSET_BASE_URL=https://api.ceypetco.gov.lk
```

5. Restart only the Plesk Node application and test an uploaded image URL.

## Verification

```bash
curl -I https://ceypetco.gov.lk/
curl -I https://ceypetco.gov.lk/gallery
curl -I https://ceypetco.gov.lk/admin
curl -I https://ceypetco.gov.lk/images/aviation-gallery-1.jpg
curl -I https://ceypetco.gov.lk/documents/agro/Flipper.pdf
curl -I https://api.ceypetco.gov.lk/api/health
curl -I https://api.ceypetco.gov.lk/uploads/images/UPLOAD_FILENAME.webp
curl -I -H 'Origin: https://ceypetco.gov.lk' \
  https://api.ceypetco.gov.lk/api/admin/gallery
```

Expected results are HTTP 200. `/gallery` and `/admin` must return
`Content-Type: text/html`; a missing static asset must return 404 rather than
the React HTML shell.

