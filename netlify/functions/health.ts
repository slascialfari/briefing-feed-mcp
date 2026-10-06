import type { Config } from "@netlify/functions";

// Simple "is it alive?" check. Does not touch the database.
export default async () => {
  return Response.json({ status: "ok", time: new Date().toISOString() });
};

export const config: Config = {
  path: "/health",
};
