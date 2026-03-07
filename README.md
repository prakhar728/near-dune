# NEAR Analytics Dashboard

A real-time analytics dashboard for the NEAR Protocol, powered by [Dune Analytics](https://dune.com). Built entirely with the **Dune MCP** (Model Context Protocol) server — every query was authored and iterated on by Claude using the Dune MCP tools, with zero manual SQL writing.

## What it does

11 sections of on-chain NEAR data, all time-period filterable (24H / 7D / 30D / 1Y / All Time):

| Section | Metrics |
|---|---|
| **Network** | Transactions, gas utilization, action types, delegate actions |
| **Revenue** | Protocol revenue over time |
| **Wallets** | New account creation trends, CEX activity |
| **Supply** | Circulating supply, balance distribution |
| **Staking** | Staked NEAR over time, top validators |
| **Tokens** | Fungible token daily activity, top tokens by volume |
| **NFTs** | Daily NFT activity, top collections |
| **Intents** | Intent transactions, top tokens and referrers |
| **Bridge** | Cross-chain bridge volume, tokens and chains |
| **dApps** | Top dApps by calls, top contract methods, deployments |
| **Storage** | Storage distribution, top accounts by storage |

## How it was built with Dune MCP

The entire data layer was created using the [Dune MCP server](https://github.com/duneanalytics/mcp-server-dune), which exposes Dune's query engine as tools that Claude can call directly.

**The workflow for each of the 25 Dune queries:**

1. **`mcp__dune__searchTables`** — searched for relevant NEAR tables (e.g. `near.transactions`, `near.actions`, `near.token_transfers`)
2. **`mcp__dune__searchDocs`** — looked up schema details and column definitions
3. **`mcp__dune__createDuneQuery`** — created the SQL query on Dune
4. **`mcp__dune__executeQueryById`** — ran it to validate results
5. **`mcp__dune__getExecutionResults`** — inspected the output and iterated on the SQL
6. **`mcp__dune__updateDuneQuery`** — refined queries based on results
7. **`mcp__dune__generateVisualization`** — optionally scaffolded chart config

All 25 queries accept a `time_period` parameter (`24H`, `7D`, `30D`, `1Y`, `All Time`) so the entire dashboard updates with a single selector toggle.

## Architecture

```
Browser
  └── useDuneQuery(queryId, timePeriod)      # React hook (client)
        └── /api/dune/[queryId]              # Next.js API route (server)
              ├── getCached()                # check Supabase cache
              │     hit  → return instantly (+ background refresh if stale)
              │     miss → fetchDuneQuery()  # call Dune REST API
              │               execute → poll → return rows
              └── setCached()               # write result to Supabase
```

### Stale-while-revalidate caching

Results are cached in Supabase PostgreSQL with TTLs tuned per time period:

| Time period | Cache TTL |
|---|---|
| 24H | 10 minutes |
| 7D | 1 hour |
| 30D | 3 hours |
| 1Y | 12 hours |
| All Time | 24 hours |

On a cache hit, data is returned immediately. If the cached entry is stale, the UI shows the old data right away and silently refreshes in the background — no loading spinner for repeat visitors.

Each card shows a "synced X minutes ago" timestamp and a manual refresh button.

### Rate-limit handling

The Dune client (`src/lib/dune.ts`) retries on `429` responses using the `Retry-After` header with exponential backoff + jitter (max 6 retries). On the client side, a lightweight queue (`src/lib/queue.ts`) serializes concurrent fetches to stay within Dune's rate limits.

## Tech stack

- **Next.js** (App Router, Turbopack) + React 19 + TypeScript
- **Tailwind CSS v4**
- **Recharts** — line and bar charts
- **Framer Motion** — tab transitions and animated indicators
- **Supabase** — PostgreSQL caching layer
- **Dune Analytics REST API** — on-chain NEAR data

## Setup

### 1. Clone and install

```bash
git clone https://github.com/your-username/near-dune.git
cd near-dune/dashboard
npm install
```

### 2. Environment variables

Create `dashboard/.env.local`:

```env
DUNE_API_KEY=your_dune_api_key

# Optional — skip if you don't want caching
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Get a Dune API key at [dune.com/settings/api](https://dune.com/settings/api).

### 3. Supabase cache table (optional but recommended)

Run once in the Supabase SQL editor:

```sql
CREATE TABLE IF NOT EXISTS query_cache (
  query_id    INTEGER      NOT NULL,
  time_period TEXT         NOT NULL,
  rows        JSONB        NOT NULL,
  synced_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  PRIMARY KEY (query_id, time_period)
);
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Dune queries

All 25 queries are public on Dune and parameterized with `time_period`:

| Query | Dune ID |
|---|---|
| Network Overview | 6776844 |
| Protocol Revenue | 6776846 |
| Action Types | 6776847 |
| Gas Utilization | 6776848 |
| New Accounts | 6776849 |
| Staking Over Time | 6776850 |
| Top Validators | 6776851 |
| Circulating Supply | 6776852 |
| Balance Distribution | 6776853 |
| FT Daily Activity | 6776854 |
| Top Tokens | 6776855 |
| NFT Daily Activity | 6776856 |
| Top NFT Collections | 6776857 |
| Intents Daily | 6776858 |
| Intent Tokens & Referrers | 6776859 |
| Bridge Daily | 6776860 |
| Bridge Tokens & Chains | 6776862 |
| Top dApps | 6776863 |
| Top Methods | 6776865 |
| Contract Deployments | 6776866 |
| Storage Distribution | 6776867 |
| Top Storage Accounts | 6776868 |
| CEX Activity | 6776869 |
| Delegate Actions | 6776870 |

## Project structure

```
dashboard/
  src/
    app/
      api/dune/[queryId]/route.ts   # cache-first API route
      page.tsx                      # main dashboard page
    components/
      sections/                     # 11 section components
      charts/                       # NearLineChart, NearBarChart
      Card.tsx                      # card with syncedAt + refresh
      TimePeriodSelector.tsx
    lib/
      dune.ts                       # Dune REST client (execute + poll)
      cache.ts                      # getCached / setCached (Supabase)
      useDuneQuery.ts               # data-fetching hook
      queue.ts                      # client-side rate-limit queue
      queryIds.ts                   # central query ID registry
```
