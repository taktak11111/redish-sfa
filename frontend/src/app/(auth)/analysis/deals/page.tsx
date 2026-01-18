'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DealResultAnalysis } from '@/components/DealResultAnalysis'
import { DealProcessAnalysis } from '@/components/DealProcessAnalysis'

export default function DealAnalysisPage() {
  return (
    <Suspense fallback={<div className="p-4">読み込み中...</div>}>
      <DealAnalysisContent />
    </Suspense>
  )
}

function DealAnalysisContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const tabFromQuery = searchParams.get('tab')
  const normalizedTabFromQuery = tabFromQuery === 'result' || tabFromQuery === 'process' ? tabFromQuery : null

  const [activeTab, setActiveTab] = useState<'result' | 'process'>(normalizedTabFromQuery ?? 'result')

  const persistKey = 'analysis.deals.tab'

  const syncUrl = useMemo(() => {
    return (nextTab: 'result' | 'process') => {
      const next = new URLSearchParams(searchParams.toString())
      next.set('tab', nextTab)
      router.replace(`/analysis/deals?${next.toString()}`)
    }
  }, [router, searchParams])

  useEffect(() => {
    if (normalizedTabFromQuery) {
      try {
        localStorage.setItem(persistKey, normalizedTabFromQuery)
      } catch {}
      setActiveTab(normalizedTabFromQuery)
      return
    }

    let stored: 'result' | 'process' | null = null
    try {
      const v = localStorage.getItem(persistKey)
      stored = v === 'result' || v === 'process' ? v : null
    } catch {}

    const decided = stored ?? 'result'
    setActiveTab(decided)
    syncUrl(decided)
  }, [normalizedTabFromQuery, syncUrl])

  const onChangeTab = (nextTab: 'result' | 'process') => {
    setActiveTab(nextTab)
    try {
      localStorage.setItem(persistKey, nextTab)
    } catch {}
    syncUrl(nextTab)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 border-b border-gray-200 pb-2">
        <button
          onClick={() => onChangeTab('result')}
          className={`text-sm font-semibold pb-1 border-b-2 transition-all ${
            activeTab === 'result' ? 'border-[#0083a0] text-[#0083a0]' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          結果分析
        </button>
        <button
          onClick={() => onChangeTab('process')}
          className={`text-sm font-semibold pb-1 border-b-2 transition-all ${
            activeTab === 'process' ? 'border-[#0083a0] text-[#0083a0]' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          プロセス分析
        </button>
      </div>

      {activeTab === 'process' ? <DealProcessAnalysis /> : <DealResultAnalysis />}
    </div>
  )
}







