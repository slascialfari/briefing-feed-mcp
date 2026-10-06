import { createClient } from "@supabase/supabase-js";

// Reads and writes briefings in the Supabase "briefings" table.
// The keys come from environment variables set in Netlify (or a local .env file).

export interface BriefingInput {
  task_name: string;
  title: string;
  summary: string;
  content: string;
  sources: string[];
}

export interface Briefing extends BriefingInput {
  id: number;
  created_at: string;
}

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function saveBriefing(input: BriefingInput): Promise<Briefing> {
  const { data, error } = await getClient()
    .from("briefings")
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(`Supabase insert failed: ${error.message}`);
  return data as Briefing;
}

export async function getBriefings(limit = 20): Promise<Briefing[]> {
  const { data, error } = await getClient()
    .from("briefings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Supabase select failed: ${error.message}`);
  return data as Briefing[];
}
