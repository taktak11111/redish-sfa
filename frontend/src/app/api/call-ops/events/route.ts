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

function normalizeEventType(value: unknown): 'start' | 'pause' | 'resume' | 'end' | null {
  const v = typeof value === 'string' ? value.trim() : ''
  if (v === 'start' || v === 'pause' || v === 'resume' || v === 'end') return v
  return null
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
    const eventType = normalizeEventType(body?.eventType)
    const payload = body?.payload && typeof body.payload === 'object' ? body.payload : {}

    if (!sessionId) return NextResponse.json({ error: 'sessionId が不正です（uuid）' }, { status: 400 })
    if (!sessionDate) return NextResponse.json({ error: 'sessionDate が不正です（YYYY-MM-DD）' }, { status: 400 })
    if (!eventType) return NextResponse.json({ error: 'eventType が不正です（start/pause/resume/end）' }, { status: 400 })

    const supabase = getSupabaseClient()
    const { error } = await supabase.from('call_ops_events').insert({
      session_id: sessionId,
      session_date: sessionDate,
      actor_email: actorEmail,
      actor_name: actorName,
      event_type: eventType,
      payload,
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
    const sessionId = normalizeUuid(searchParams.get('sessionId'))

    let query = supabase
      .from('call_ops_events')
      .select('*')
      .order('occurred_at', { ascending: true })
      .limit(500)

    if (sessionId) query = query.eq('session_id', sessionId)

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: error.message, details: error.details ?? null }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 })
  }
}

