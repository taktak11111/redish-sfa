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

function normalizeUuid(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const v = value.trim()
  if (!/^[0-9a-fA-F-]{36}$/.test(v)) return null
  return v
}

function toIntOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return Math.floor(n)
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return n
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth()
  if (isAuthError(authResult)) return authResult

  try {
    const session = authResult as any
    const actorEmail = String(session?.user?.email || '').trim() || 'unknown'
    const actorName = session?.user?.name ? String(session.user.name) : null

    const body = await request.json()
    const sessionId = normalizeUuid(body?.sessionId)
    const sessionDate = normalizeYmd(body?.sessionDate)

    if (!sessionId) return NextResponse.json({ error: 'sessionId が不正です（uuid）' }, { status: 400 })
    if (!sessionDate) return NextResponse.json({ error: 'sessionDate が不正です（YYYY-MM-DD）' }, { status: 400 })

    const supabase = getSupabaseClient()
    const { error } = await supabase.from('call_ops_sessions').insert({
      session_id: sessionId,
      session_date: sessionDate,
      actor_email: actorEmail,
      actor_name: actorName,

      started_at: typeof body?.startedAt === 'string' ? body.startedAt : null,
      ended_at: typeof body?.endedAt === 'string' ? body.endedAt : null,
      total_ms: toIntOrNull(body?.totalMs),
      pause_ms: toIntOrNull(body?.pauseMs),
      work_ms: toIntOrNull(body?.workMs),

      goal_call_count: toIntOrNull(body?.goalCallCount),
      goal_deal_count: toIntOrNull(body?.goalDealCount),
      planned_work_minutes: toIntOrNull(body?.plannedWorkMinutes),

      kpi_call_count: toIntOrNull(body?.kpiCallCount),
      kpi_connected_count: toIntOrNull(body?.kpiConnectedCount),
      kpi_appointment_count: toIntOrNull(body?.kpiAppointmentCount),
      kpi_calls_per_hour_non_connected: toNumberOrNull(body?.kpiCallsPerHourNonConnected),
      kpi_avg_connected_seconds: toIntOrNull(body?.kpiAvgConnectedSeconds),
      kpi_connected_appointment_rate: toNumberOrNull(body?.kpiConnectedAppointmentRate),

      filters: body?.filters && typeof body.filters === 'object' ? body.filters : {},
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
    const sessionDate = normalizeYmd(searchParams.get('sessionDate'))

    let query = supabase
      .from('call_ops_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (sessionDate) query = query.eq('session_date', sessionDate)

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: error.message, details: error.details ?? null }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 })
  }
}

