import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PostgrestError } from "@supabase/postgrest-js";

/**
 * Shared type for all Supabase clients (admin and regular)
 * Both admin and server clients implement SupabaseClient<Database>
 */
export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Helper type to properly type Supabase query results
 * Uses PostgrestError instead of any
 */
export type TypedQueryResult<T extends keyof Database["public"]["Tables"]> = {
  data: Database["public"]["Tables"][T]["Row"] | null;
  error: PostgrestError | null;
};

/**
 * Helper type for array query results
 */
export type TypedQueryResultArray<
  T extends keyof Database["public"]["Tables"]
> = {
  data: Database["public"]["Tables"][T]["Row"][] | null;
  error: PostgrestError | null;
};

/**
 * Type-safe helper to execute insert operations
 * This properly types the query without using 'any'
 */
export type TypedInsertBuilder<T extends keyof Database["public"]["Tables"]> = {
  insert: (values: Database["public"]["Tables"][T]["Insert"]) => {
    select: (columns?: string) => {
      single: () => Promise<TypedQueryResult<T>>;
    };
  };
};

/**
 * Type-safe helper to execute update operations
 * This properly types the query without using 'any'
 */
export type TypedUpdateBuilder<T extends keyof Database["public"]["Tables"]> = {
  update: (values: Database["public"]["Tables"][T]["Update"]) => {
    eq: (
      column: string,
      value: string
    ) => {
      select: (columns?: string) => {
        single: () => Promise<TypedQueryResult<T>>;
      };
    };
  };
};
