# AuraPath — Enterprise Career Discovery Platform

AuraPath is a global-scale psychometric discovery and career trajectory mapping platform for students from Class 8 through University.

---

## 🏛️ Monorepo Structure

```
├── apps/
│   ├── frontend/             # Next.js 16 Web Application (App Router, Tailwind v4, Framer Motion)
│   └── backend/              # Enterprise Psychometric Scoring Engine (Node.js/Express, TypeScript)
│
├── packages/
│   └── shared/               # Common TypeScript DTOs, Big-5 & RIASEC psychometric models
│
├── infrastructure/
│   ├── docker/               # Multi-stage Dockerfiles & docker-compose orchestration
│   ├── k8s/                  # Production Kubernetes manifests (Deployments, Services, Ingress)
│   └── ci-cd/                # Automated GitHub Actions CI/CD workflows
│
├── docs/                     # Architecture, psychometrics, and REST API contracts
└── package.json              # Monorepo workspace configuration
```

---

## 🚀 Quickstart Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development
To run the full stack concurrently:
```bash
# Start Frontend (port 3000)
npm run dev:frontend

# Start Backend API (port 4000)
npm run dev:backend
```

### 3. Production Build
```bash
npm run build
```

---

## 🐳 Docker Local Stack
To spin up the entire containerized stack with Postgres & Redis:
```bash
cd infrastructure/docker
docker compose up --build
```

---

## 📜 Key Endpoints
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Interactive Quiz**: [http://localhost:3000/assessment](http://localhost:3000/assessment)
- **Career Library**: [http://localhost:3000/careers](http://localhost:3000/careers)
- **API Health Check**: [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)
- **Assessment API**: `http://localhost:4000/api/v1/assessment/questions`
- **Career Galaxy API**: `http://localhost:4000/api/v1/careers`
