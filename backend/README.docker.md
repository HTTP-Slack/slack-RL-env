# Docker / Render deployment notes

This file describes how to build and run the `backend` Docker image locally and how to deploy it to Render.

Build locally

```powershell
# from repository root
cd backend
docker build -t slack-backend:latest .

# run the container, map port 8080 (the app defaults to 8080)
docker run --rm -e NODE_ENV=production -e MONGO_URI="your-mongo-uri" -e SESSION_SECRET="your-secret" -p 8080:8080 slack-backend:latest
```

Notes for Render

- On Render create a new "Web Service" and choose the Dockerfile option.
- Connect your repo and set the build context to the `backend/` folder (or point Render to the Dockerfile path).
- In Render's service settings, set environment variables used by the app (for example `MONGO_URI`, `SESSION_SECRET`, `CLIENT_URL`, etc.).
- Render will set the `PORT` environment variable for the service; the app reads `process.env.PORT` so no special change is required.

Troubleshooting

- If you need dev dependencies (for example for building native modules) switch `npm ci --only=production` to `npm ci` in the Dockerfile or add a build stage.
- If your container exits immediately, check logs with:

```powershell
docker logs <container-id>
```
