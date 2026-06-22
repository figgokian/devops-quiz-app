# ZLI-Modul-109/201-DevOps-Quiz-app

> A 3-tier quiz application for 2nd-year platform engineers and application developers.
> Test your knowledge on **Docker, Kubernetes/OpenShift, CI/CD, and Networking** — then compete on the global leaderboard.

---

## Architecture

```
Browser → Frontend (Node.js :8080) → Backend (Node.js :3000) → PostgreSQL (:5432)
```

| Tier     | Technology        | Port |
|----------|-------------------|------|
| Frontend | Node.js + Express | 8080 |
| Backend  | Node.js + Express | 3000 |
| Database | PostgreSQL 18.4   | 5432 |

---

## Project Structure

```
devops-quiz-app/
├── app/
│   ├── backend/
│   │   ├── app.js          # REST API (questions, submit, leaderboard)
│   │   └── package.json
│   └── frontend/
│       ├── app.js          # Static file server + /config endpoint
│       ├── package.json
│       └── public/
│           └── index.html  # Single-page quiz app (dark UI)
├── dockerfiles/
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
└── README.md
```

---

## API Endpoints

| Method | Path             | Description                           |
|--------|------------------|---------------------------------------|
| GET    | /api/health      | Health check                          |
| GET    | /api/questions   | Returns all 20 questions (no answers) |
| POST   | /api/submit      | Submit answers, get score + results   |
| POST   | /api/leaderboard | Save score to leaderboard             |
| GET    | /api/leaderboard | Fetch top 20 scores                   |

---

## Quiz Topics

- 🐳 **Docker / Dockerfiles** — 5 questions
- ☸️ **Kubernetes / OpenShift** — 5 questions
- ⚙️ **CI/CD Pipelines** — 5 questions
- 🌐 **Networking / Services & Routes** — 5 questions

---

## Container Images

The Dockerfiles for backend and frontend are provided in the `dockerfiles/`
directory. You must build both images and push them to a container registry
before deploying the application.

```bash
# Backend
docker build \
  -t <your-registry>/devops-quiz-backend:latest \
  -f dockerfiles/Dockerfile.backend .
docker push <your-registry>/devops-quiz-backend:latest

# Frontend
docker build \
  -t <your-registry>/devops-quiz-frontend:latest \
  -f dockerfiles/Dockerfile.frontend .
docker push <your-registry>/devops-quiz-frontend:latest
```

Replace `<your-registry>` with your actual container registry URL, for
example `registry.gitlab.com/<username>/<project>` or `ghcr.io/<username>`.

The database image `postgres:18.4` can be consumed directly from Docker Hub
— no build step required.

---

## Environment Variables

### PostgreSQL (`postgres:18.4`)

| Variable            | Description       | Example       |
|---------------------|-------------------|---------------|
| `POSTGRES_USER`     | Database username | `quizuser`    |
| `POSTGRES_PASSWORD` | Database password | `quizpass123` |
| `POSTGRES_DB`       | Database name     | `quizdb`      |

### Backend

| Variable            | Description              | Example                |
|---------------------|--------------------------|------------------------|
| `POSTGRES_HOST`     | Hostname of the database | `devops-quiz-database` |
| `POSTGRES_USER`     | Database username        | `quizuser`             |
| `POSTGRES_PASSWORD` | Database password        | `quizpass123`          |
| `POSTGRES_DB`       | Database name            | `quizdb`               |

### Frontend

| Variable      | Description             | Example                           |
|---------------|-------------------------|-----------------------------------|
| `BACKEND_URL` | Full URL of the backend | `http://devops-quiz-backend:3000` |

---

## Deployment Notes

### PostgreSQL — Important Configuration

When deploying `postgres:18.4` on OpenShift, the following points must be
considered.

#### `PGDATA` — Data directory inside the volume

```yaml
env:
  - name: PGDATA
    value: /var/lib/postgresql/data/pgdata
```

OpenShift mounts PersistentVolumes directly into the specified directory.
PostgreSQL refuses to start if the data directory is not empty — which can
happen when mounting directly to `/var/lib/postgresql/data`, as Kubernetes
may place metadata there (e.g. `lost+found`). Using a subdirectory `pgdata`
avoids this issue.

---

#### Unix socket directory — additional volume mount

```yaml
volumeMounts:
  - name: postgres-socket
    mountPath: /var/run/postgresql

volumes:
  - name: postgres-socket
    emptyDir: {}
```

PostgreSQL communicates internally via a Unix socket, which is created by
default under `/var/run/postgresql`. On OpenShift, containers run as a
random non-root UID — however, the `/var/run/postgresql` directory inside
the container image is owned by `root` and is not writable by other users.

By mounting an `emptyDir` volume at that path, the directory is recreated
at container startup and automatically owned by the running UID. PostgreSQL
can then create the socket without any permission issues.

> **Note:** The following message may appear during startup — it is harmless
> and can be ignored:
> ```
> chmod: changing permissions of '/var/run/postgresql': Operation not permitted
> ```
> PostgreSQL starts correctly regardless, as the volume already belongs to
> the correct UID.
