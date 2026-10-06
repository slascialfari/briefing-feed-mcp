# briefing-feed-mcp

A small **MCP server** (Model Context Protocol) that lets ChatGPT save "briefings", for example the
output of a ChatGPT Scheduled Task, into a Supabase database.

It runs as a **Netlify Function** and stores data in **Supabase**.

```
ChatGPT Scheduled Task  →  Netlify (this MCP server)  →  Supabase "briefings" table
```

## Tools

| Tool            | What it does                                                        |
| --------------- | ------------------------------------------------------------------- |
| `save_briefing` | Saves a briefing (task name, title, summary, content, sources).     |
| `get_briefings` | Returns the 20 most recent briefings, newest first.                 |

## Files

```
netlify/functions/mcp.ts     The MCP endpoint, served at /mcp/<MCP_SECRET>
netlify/functions/health.ts  "Is it alive?" check, served at /health
src/mcp.ts                   Defines the two tools
src/db.ts                    Reads and writes the Supabase table
supabase/schema.sql          SQL that creates the table
netlify.toml                 Netlify build settings
public/index.html            Placeholder home page
```

## One-time setup

### 1. Supabase

1. Create a project.
2. Open the **SQL Editor**, paste the contents of `supabase/schema.sql`, and click **Run**.
3. From **Project Settings → API**, note the **Project URL** and the **service_role** (secret) key.
   Keep the service_role key private. It must never be committed to GitHub.

### 2. Netlify

1. **Add new project → Import an existing project**, and pick this GitHub repo.
   The build settings are read from `netlify.toml`, so you don't need to change anything.
2. Under **Site configuration → Environment variables**, add:

   | Name                        | Value                                  |
   | --------------------------- | -------------------------------------- |
   | `SUPABASE_URL`              | your Supabase Project URL              |
   | `SUPABASE_SERVICE_ROLE_KEY` | your Supabase service_role key         |
   | `MCP_SECRET`                | a long random string you make up       |

3. Deploy (or **Trigger deploy** if it already deployed before you added the variables).
   Every push to GitHub redeploys automatically.

### 3. Check it's alive

Open `https://<your-site>.netlify.app/health`. You should see `{"status":"ok", ...}`.

### 4. Connect ChatGPT

Create a custom MCP server (plugin) in ChatGPT with:

- **URL:** `https://<your-site>.netlify.app/mcp/<MCP_SECRET>`
- **Authentication:** none

The secret in the URL is the only protection, so treat that full URL like a password.
Any other URL under `/mcp/` returns "Not found".

## Testing with curl

```bash
curl -X POST https://<your-site>.netlify.app/mcp/<MCP_SECRET> \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "save_briefing",
      "arguments": {
        "task_name": "curl-test",
        "title": "Test briefing",
        "summary": "A quick test.",
        "content": "Hello from curl.",
        "sources": ["https://example.com"]
      }
    }
  }'
```

The new row appears in Supabase under **Table Editor → briefings**.
Server logs are in Netlify under **Logs → Functions**.

## Running locally (optional)

1. `npm install`
2. Copy `.env.example` to `.env` and fill in the three values.
3. `npm run dev` starts the Netlify dev server at `http://localhost:8888`.
   The MCP endpoint is `http://localhost:8888/mcp/<MCP_SECRET>`.

`npm run typecheck` checks the TypeScript. Netlify runs it on every deploy.
