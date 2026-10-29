# Task Manager — Docker Compose learning project

A small full-stack application with:
- Frontend: HTML, CSS and browser JavaScript
- Reverse proxy/static server: Nginx
- Backend API: Node.js + Express
- Orchestration for local development: Docker Compose

## Architecture

The browser opens `http://localhost:8080`. Nginx serves the frontend and proxies `/api/...` requests to the Compose service named `backend` on port 3000. The backend is not published directly to the host.

```text
Browser
  |
  | http://localhost:8080
  v
frontend (Nginx, port 80)
  |
  | Docker Compose network: http://backend:3000
  v
backend (Express, port 3000)
```

## Run

From this project directory:

```bash
sudo docker compose up --build -d
```

Open `http://localhost:8080` in your browser.

## Verify

```bash
sudo docker compose ps
sudo docker compose logs -f
curl http://localhost:8080/api/health
curl http://localhost:8080/api/tasks
```

## Stop

```bash
sudo docker compose down
```

## Learning notes

- Compose creates a default network for this project and attaches both services to it.
- Services can discover each other by service name, so Nginx can proxy to `backend:3000`.
- The backend has no `ports:` mapping: it is reachable by other containers on the Compose network, not directly through a published host port.
- The frontend publishes host port 8080 to Nginx container port 80.
- This sample stores tasks in memory, so they reset if the backend process restarts.
- `depends_on` controls startup order but does not by itself guarantee the backend is ready to accept requests.
