import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/guard'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// GET: ドロップダウン設定取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // 開発環境では、サービスロールキーを使用してRLSをバイパス
    let client: any
    if (process.env.NODE_ENV === 'development') {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (serviceRoleKey) {
        client = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceRoleKey,
          { auth: { persistSession: false } }
        ) as any
      } else {
        client = supabase
      }
    } else {
      client = supabase
    }

    const { data, error } = await client
      .from('dropdown_settings')
      .select('*')
      .order('category', { ascending: true })
      .order('key', { ascending: true })

    if (error) {
      console.error('[API/dropdown-settings] Error:', error)
      return NextResponse.json(
        { error: 'ドロップダウン設定の取得に失敗しました', details: error.message },
        { status: 500 }
      )
    }

    // データをカテゴリ別に整理
    const settingsByCategory: Record<string, Record<string, any[]>> = {}
    data?.forEach((item: any) => {
      if (!settingsByCategory[item.category]) {
        settingsByCategory[item.category] = {}
      }
      settingsByCategory[item.category][item.key] = item.options || []
    })

    return NextResponse.json({ settings: settingsByCategory, raw: data || [] })
  } catch (error: any) {
    console.error('[API/dropdown-settings] Error:', error)
    return NextResponse.json(
      { error: error.message || 'ドロップダウン設定の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// PUT: ドロップダウン設定保存
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // 開発環境では、サービスロールキーを使用してRLSをバイパス
    let client: any
    if (process.env.NODE_ENV === 'development') {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (serviceRoleKey) {
        client = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceRoleKey,
          { auth: { persistSession: false } }
        ) as any
      } else {
        client = supabase
      }
    } else {
      client = supabase
    }

    const body = await request.json()
    const { category, settings } = body

    if (!category || !settings) {
      return NextResponse.json(
        { error: 'カテゴリと設定は必須です' },
        { status: 400 }
      )
    }

    // 各設定項目を保存
    const results = []
    for (const [key, options] of Object.entries(settings)) {
      if (!Array.isArray(options)) {
        continue
      }

      // upsert（存在すれば更新、なければ作成）
      const { data, error } = await client
        .from('dropdown_settings')
        .upsert(
          {
            category,
            key,
            options: options,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'category,key',
          }
        )
        .select()
        .single()

      if (error) {
        console.error(`[API/dropdown-settings] Error saving ${category}.${key}:`, error)
        results.push({ key, success: false, error: error.message })
      } else {
        results.push({ key, success: true, data })
      }
    }

    const hasErrors = results.some(r => !r.success)
    if (hasErrors) {
      return NextResponse.json(
        { 
          error: '一部の設定の保存に失敗しました',
          results,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'ドロップダウン設定を保存しました',
      results,
    })
  } catch (error: any) {
    console.error('[API/dropdown-settings] Error:', error)
    return NextResponse.json(
      { error: error.message || 'ドロップダウン設定の保存に失敗しました' },
      { status: 500 }
    )
  }
}
