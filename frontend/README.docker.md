# Docker / Render deployment notes (frontend)

This file explains how to build and run the frontend Docker image locally and options for deploying to Render.

Build locally (PowerShell)

```powershell
cd frontend
docker build -t slack-frontend:latest .

# run the container, serving on port 80
docker run --rm -p 8080:80 slack-frontend:latest

# then open http://localhost:8080
```

Render deployment options

1) Use Render Static Site (recommended):
   - In Render create a **Static Site**.
   - Build Command: `npm ci && npm run build`
   - Publish Directory: `frontend/dist`
   - Set any environment variables your client needs (e.g., API base URL) in the Render dashboard.

2) Use Render Docker (if you prefer a container):
   - Create a **Web Service** and choose Docker.
   - Set Dockerfile path to `frontend/Dockerfile` (or set the build context to `frontend/`).
   - Expose port 80 (Render handles external routing).

Notes
- The Docker image serves the production-built SPA with `nginx` and includes a SPA fallback (`try_files ... /index.html`) so client-side routing works.
- Avoid committing secrets to the repo. Use Render's environment variable settings for configuration.
