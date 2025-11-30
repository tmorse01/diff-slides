import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UnauthorizedError } from '@/lib/errors'

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    throw new UnauthorizedError('You must be logged in to access this resource')
  }
  return user
}

export async function redirectIfAuthenticated() {
  const user = await getUser()
  if (user) {
    redirect('/dashboard')
  }
}

