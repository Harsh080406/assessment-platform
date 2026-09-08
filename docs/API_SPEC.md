# AuraPath REST API Specification (v1)

Base URL: `https://api.aurapath.com/api/v1` (Local: `http://localhost:4000/api/v1`)

---

### 1. Health & Status
#### `GET /health`
Returns service uptime, status, and version.
```json
{
  "status": "healthy",
  "uptimeSeconds": 142.8,
  "timestamp": "2026-09-08T13:38:00.000Z",
  "service": "AuraPath Enterprise Psychometrics Core",
  "version": "2026.4.0"
}
```

---

### 2. Assessment
#### `GET /assessment/questions?stage=11-12`
Fetches scenario-based questions calibrated for the specified stage.

#### `POST /assessment/submit`
Evaluates student submission and computes dominant archetype.
**Request Body:**
```json
{
  "responses": {
    "1": "A",
    "2": "B",
    "3": "A",
    "4": "C",
    "5": "D"
  }
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "submissionId": "sub_1725800000000",
    "dimensions": {
      "creative": 95,
      "systems": 88,
      "empathy": 91,
      "venture": 84
    },
    "archetype": {
      "id": "creative_strategist",
      "code": "#04",
      "name": "The Creative Strategist",
      "matchPercentage": 98
    }
  }
}
```

---

### 3. Careers
#### `GET /careers?stream=Technology&q=ai`
Filters and searches modern career horizons.

#### `GET /careers/:id`
Retrieves granular career roadmap and starting benchmarks.

---

### 4. Reports & Diagnostics
#### `GET /reports/sample`
Returns comprehensive 24-page parent diagnostic report payload.

---

### 5. Authentication
#### `POST /auth/login`
Authenticates student/parent credentials.

#### `POST /auth/register`
Creates new candidate profile.
