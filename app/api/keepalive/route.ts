import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

/**
 * Keep-alive endpoint for Supabase database connection.
 *
 * This endpoint exists to prevent Supabase connections from going cold during periods
 * of inactivity. Many free-tier database services (including Supabase) will pause or
 * terminate inactive connections, which can cause cold starts and increased latency.
 *
 * The service role key (SUPABASE_SERVICE_ROLE_KEY) is safe to use here because:
 * 1. This is a server-side API route only - environment variables without NEXT_PUBLIC_ prefix are never exposed to the client
 * 2. The endpoint performs a minimal read-only query with no data exposure
 * 3. The keep_alive table has RLS enabled and is only accessible via service role
 *
 * The 3-day interval balances:
 * - Frequency: Most free tiers require activity at least weekly to prevent pauses
 * - Cost: Minimal query cost (single row SELECT)
 * - Reliability: Frequent enough to prevent cold starts, infrequent enough to minimize overhead
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return Response.json(
        { error: "Missing required environment variables" },
        { status: 500 }
      );
    }

    // Initialize Supabase client with service role key
    // This bypasses RLS, which is necessary since this is an automated cron job
    const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Perform the cheapest possible query: SELECT a single row from keep_alive table
    // This table contains exactly one row, so the query is always fast and minimal
    const { error } = await supabase
      .from("keep_alive")
      .select("id")
      .limit(1)
      .single();

    if (error) {
      return Response.json(
        { error: `Database query failed: ${error.message}` },
        { status: 500 }
      );
    }

    return Response.json({
      ok: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
