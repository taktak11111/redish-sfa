import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { requireAuth, isAuthError } from '@/lib/auth/guard'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let supabaseClient: SupabaseClient | null = null
function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })
  }
  return supabaseClient
}

function normalizeYmd(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!m) return null
  return value.trim()
}

function toIntOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return Math.floor(n)
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth()
  if (isAuthError(authResult)) return authResult

  try {
    const session = authResult as any
    const actorEmail = String(session?.user?.email || '').trim() || 'unknown'
    const actorName = session?.user?.name ? String(session.user.name) : null

    const body = await request.json()
    const targetDate = normalizeYmd(body?.targetDate)
    if (!targetDate) {
      return NextResponse.json({ error: 'targetDate が不正です（YYYY-MM-DD）' }, { status: 400 })
    }

    const goalCallCount = toIntOrNull(body?.goalCallCount)
    const goalDealCount = toIntOrNull(body?.goalDealCount)
    const plannedWorkMinutes = toIntOrNull(body?.plannedWorkMinutes)

    const supabase = getSupabaseClient()
    const { error } = await supabase.from('call_ops_targets_history').insert({
      target_date: targetDate,
      actor_email: actorEmail,
      actor_name: actorName,
      goal_call_count: goalCallCount,
      goal_deal_count: goalDealCount,
      planned_work_minutes: plannedWorkMinutes,
    })

    if (error) {
      return NextResponse.json({ error: error.message, details: error.details ?? null }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const authResult = await requireAuth()
  if (isAuthError(authResult)) return authResult

  try {
    const supabase = getSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const targetDate = normalizeYmd(searchParams.get('targetDate'))

    let query = supabase
      .from('call_ops_targets_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (targetDate) {
      query = query.eq('target_date', targetDate)
    }

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: error.message, details: error.details ?? null }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 })
  }
}

