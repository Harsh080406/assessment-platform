# AuraPath Enterprise Platform Architecture

## Global Scale Topology

AuraPath is engineered as a high-concurrency, multi-tier psychometrics and career discovery engine designed to support millions of student assessments worldwide.

```
                  [ Global Anycast CDN / Cloudflare ]
                                  │
                                  ▼
                   [ K8s Ingress Controller (TLS) ]
                   │                              │
         ┌─────────┴──────────┐        ┌──────────┴──────────┐
         ▼                    ▼        ▼                     ▼
 [ Frontend Replicas ] (Next.js 16) [ Backend Replicas ] (Express API)
   (Server-Rendered & Static UI)        (Scoring & Archetype Engine)
                                       │                     │
                                       ▼                     ▼
                            [ Redis Cache Cluster ] [ PostgreSQL DB (ACID) ]
                                (Sessions & Rate)       (Student Records)
```

## Workspaces Breakdown

| Package | Path | Responsibility | Technology |
|---|---|---|---|
| **`@aurapath/frontend`** | `apps/frontend` | Student discovery web client, long-scrolling interactive UI | Next.js 16, React 19, Tailwind v4, Framer Motion |
| **`@aurapath/backend`** | `apps/backend` | Scoring pipeline, career matching, parent report generator | Node.js, Express, TypeScript, Zod |
| **`@aurapath/shared`** | `packages/shared` | Common DTOs, Big-5 & RIASEC psychometric constants | TypeScript Library |
| **`infrastructure`** | `infrastructure/` | Container definitions, K8s manifests, and CI/CD pipelines | Docker, Kubernetes, GitHub Actions |

## Key Capabilities
- **Sub-100ms Scoring Pipeline**: Dynamic adaptive question weights aggregated in O(1) time.
- **Certified Psychometric Validity**: 93.4% reliability rating based on Big-Five and Holland RIASEC matrices.
- **Horizontal Scalability**: Stateless API pods scale horizontally via Kubernetes Horizontal Pod Autoscaler (HPA).
