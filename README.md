# service-graph-radar

> Model your microservices as a graph — trace blast radius, root-cause incidents, and ask "why is X down?" in plain English.

*Built for the Wexa AI CognoDB take-home assignment.*

---

## Live Demo

- **App:** `<your-vercel-url-here>`

---

## The Use Case

Modern systems are made of interdependent services: **Checkout** depends on **Payments**, **Payments** depends on **Login**, and so on. When one service breaks, the real question an engineer needs answered in seconds is: 

> *"What else is going to break because of this, and who do I need to page?"*

This app models a company's services, their dependencies, the engineers who own them, and past deployments/incidents as a graph. It enables you to:
- Click any service and instantly compute its full cascading **blast radius**.
- Trace an active incident back to the exact deployment that triggered it.
- Ask a grounded AI assistant to explain the root cause and downstream risk in plain English.

---

## Why a Graph Database?

The core question this app answers — *"if service X breaks, what breaks with it, transitively, and who owns those services?"* — is a **variable-depth traversal**. You don't know in advance whether the cascade is 1 hop or 5 hops deep.

In a relational database, `DEPENDS_ON` would live in a self-referencing join table. Answering this requires a recursive CTE with a hardcoded max-depth guess or repeated application-level joins in a loop. It works, but it becomes awkward, hard to maintain, and slower as dependency chains deepen.

In **Cypher**, it is a single declarative line:

```cypher
MATCH (source:Service {name: $serviceName})<-[:DEPENDS_ON*1..5]-(affected:Service)
```

This walks 1 to 5 hops outward along `DEPENDS_ON` relationships in a single query — no recursive loops or guessing depth. The same applies to incident root-cause tracing: walking backward from an `Incident` through `CAUSED_BY` to a `Deployment` and its target `Service`, then forward through the dependency graph to find what is at risk.

> **Note on Trade-offs:** Not every query needs a graph. The engineer-ownership summary (aggregation) is a plain grouping that SQL handles just as effectively. A graph database earns its place for traversal-heavy questions, and distinguishing when to use each paradigm is core to sound architecture.

---

## Data Model

### Nodes

| Label | Represents | Key Properties |
| :--- | :--- | :--- |
| **Service** | A microservice in the system | `name`, `description`, `status`, `criticality` |
| **Engineer** | A person who owns/maintains services | `name`, `role`, `email` |
| **Deployment** | A code push to a service | `id`, `version`, `timestamp`, `description` |
| **Incident** | An outage or failure event | `title`, `severity`, `timestamp`, `resolved` |

### Relationships

| Relationship | Direction | Meaning |
| :--- | :--- | :--- |
| `DEPENDS_ON` | `Service -> Service` | This service needs that service to function |
| `OWNS` | `Engineer -> Service` | This engineer is responsible for this service |
| `DEPLOYED_TO` | `Deployment -> Service` | This deployment was pushed to this service |
| `CAUSED_BY` | `Incident -> Deployment` | This incident was traced to this deployment |
| `AFFECTED` | `Incident -> Service` | This incident impacted this service |

### Architecture & Topology Diagram

```text
                    ┌───────────────┐  
                    │ Auth-Gateway  │
                    └───────▲───────┘
                            │ DEPENDS_ON
                    ┌───────┴───────┐         ⚠ Incident:
                    │     Login     │◄──────  "sessions expiring
                    └───────▲───────┘          after v3.1.0"
                            │ DEPENDS_ON       (CAUSED_BY dep-103,
                    ┌───────┴───────┐           AFFECTED Login)
                    │   Payments    │
                    └───────▲───────┘
                            │ DEPENDS_ON
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────┴───────┐                       ┌───────┴───────┐
│   Inventory   │──DEPENDS_ON (via)────►│   Checkout    │
└───────▲───────┘                       └───┬───────┬───┘
        │ DEPENDS_ON             DEPENDS_ON │       │ DEPENDS_ON
┌───────┴───────┐                  ┌────────▼───┐ ┌─▼─────────────┐
│    Search     │                  │Notifications│ │   Shipping    │
└───────▲───────┘                  └────────────┘ └───────────────┘
        │ DEPENDS_ON
┌───────┴────────┐
│ Recommendations│
└────────────────┘
```
*(Engineers own services via `OWNS` relationships — omitted above for visual clarity).*

---

## Setup & Run Instructions

### 1. Create a CognoDB Instance
1. Sign up at [console.cognodb.com/signup](https://console.cognodb.com/signup) (no credit card required).
2. Create a free (`c0`) instance, select your region, and wait ~1 minute for provisioning.
3. Copy your connection URI (`bolt+s://<instance-id>.databases.cognodb.cloud`) and generated password for user `cognodb`.

### 2. Clone and Configure

```bash
git clone [https://github.com/](https://github.com/)<your-username>/service-graph-radar.git
cd service-graph-radar
npm install
```

Create a `.env.local` file in the project root:

```env
COGNODB_URI=bolt+s://<your-instance-id>.databases.cognodb.com
COGNODB_USER=cognodb
COGNODB_PASSWORD=<your-password>
GROQ_API_KEY=<your-groq-key>
```

### 3. Seed the Database

```bash
node seed.js
```
*This resets existing data and populates 9 services, their dependency chains, 5 engineers, 3 deployments, and 1 active incident.*

### 4. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Core Queries Explained

### 1. Blast Radius (Multi-hop Traversal)
- **Endpoint:** `GET /api/blast-radius/[serviceName]`
- **How it works:** Traverses 1–5 hops backward along `DEPENDS_ON` relationships from a target service to return all downstream services at risk, along with the on-call engineers owning each affected service.

### 2. Incident Root-Cause Trace
- **Endpoint:** `GET /api/incidents`
- **How it works:** Evaluates the graph path `Incident -[:CAUSED_BY]-> Deployment -[:DEPLOYED_TO]-> Service` to pinpoint root causes, then re-runs the blast-radius traversal outward from the source to compute ongoing system risk.

### 3. Engineer Ownership Summary (Relational Aggregation)
- **Endpoint:** `GET /api/engineers/summary`
- **How it works:** Groups services by assigned engineer and tallies high-criticality assets. Included intentionally to demonstrate standard aggregation operations alongside graph traversals.

### 4. AI Grounded Explainer
- **Endpoint:** `POST /api/explain`
- **How it works:** Parses a user's natural language question, identifies the target service, executes deterministic graph queries to extract ground truth (status, active alerts, downstream impact, ownership), and feeds those facts into **Llama 3.3 70B (via Groq)**. The LLM acts purely as an explainer with strict instructions never to hallucinate infrastructure state.

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Graph Database:** CognoDB (via `neo4j-driver`)
- **LLM Engine:** Groq API (Llama 3.3 70B)
- **Deployment:** Vercel
