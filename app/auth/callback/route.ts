import { createClient } from "@/lib/supabase/server"
import { migrateTemporaryProjectsToUser } from "@/lib/migrate-temporary-projects"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)
    
    // Migrate temporary projects to user account
    if (data.user) {
      await migrateTemporaryProjectsToUser(data.user.id)
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}/dashboard`)
}

