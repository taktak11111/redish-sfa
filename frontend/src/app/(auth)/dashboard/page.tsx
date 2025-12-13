'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

// アイコンコンポーネント
function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
    </svg>
  )
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  )
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

interface DashboardStats {
  calls: {
    total: number
    uncalled: number
    appointments: number
  }
  deals: {
    total: number
    active: number
    contracts: number
  }
}

export default function DashboardPage() {
  const { data: callsData, isLoading: callsLoading } = useQuery({
    queryKey: ['calls-summary'],
    queryFn: async () => {
      const response = await fetch('/api/calls')
      if (!response.ok) throw new Error('Failed to fetch calls')
      return response.json()
    },
  })

  const { data: dealsData, isLoading: dealsLoading } = useQuery({
    queryKey: ['deals-summary'],
    queryFn: async () => {
      const response = await fetch('/api/deals')
      if (!response.ok) throw new Error('Failed to fetch deals')
      return response.json()
    },
  })

  const isLoading = callsLoading || dealsLoading

  // 統計を計算
  const stats: DashboardStats = {
    calls: {
      total: callsData?.data?.length || 0,
      uncalled: callsData?.data?.filter((c: { status: string }) => c.status === '未架電').length || 0,
      appointments: callsData?.data?.filter((c: { status: string }) => 
        c.status === '03.アポイント獲得済' || c.status === '09.アポ獲得'
      ).length || 0,
    },
    deals: {
      total: dealsData?.data?.length || 0,
      active: dealsData?.data?.filter((d: { result: string | undefined }) => !d.result).length || 0,
      contracts: dealsData?.data?.filter((d: { result: string }) => 
        d.result === '01.成約（契約締結）'
      ).length || 0,
    },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="mt-1 text-sm text-gray-500">営業活動の概要</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="未架電リード"
          value={stats.calls.uncalled}
          href="/calls?status=未架電"
          color="warning"
          loading={isLoading}
          icon={<PhoneIcon className="w-6 h-6" />}
        />
        <StatCard
          title="アポイント獲得"
          value={stats.calls.appointments}
          href="/calls?status=アポ獲得"
          color="success"
          loading={isLoading}
          icon={<CalendarIcon className="w-6 h-6" />}
        />
        <StatCard
          title="進行中商談"
          value={stats.deals.active}
          href="/deals"
          color="info"
          loading={isLoading}
          icon={<BriefcaseIcon className="w-6 h-6" />}
        />
        <StatCard
          title="成約"
          value={stats.deals.contracts}
          href="/contracts"
          color="primary"
          loading={isLoading}
          icon={<CheckCircleIcon className="w-6 h-6" />}
        />
      </div>

      {/* クイックアクション */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">架電管理</h2>
          <p className="text-sm text-gray-600 mb-4">
            リードへの架電状況を管理します。未架電のリードに優先的にアプローチしましょう。
          </p>
          <Link href="/calls" className="btn-primary">
            架電一覧を見る
          </Link>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">商談管理</h2>
          <p className="text-sm text-gray-600 mb-4">
            アポイント獲得後の商談を管理します。確度の高い商談から進めましょう。
          </p>
          <Link href="/deals" className="btn-primary">
            商談一覧を見る
          </Link>
        </div>
      </div>

      {/* 最近のアクティビティ */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">最近の活動</h2>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {dealsData?.data?.slice(0, 5).map((deal: {
              dealId: string
              companyName: string
              staff: string
              rank: string
            }) => (
              <div key={deal.dealId} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{deal.companyName}</p>
                  <p className="text-sm text-gray-500">{deal.staff} / ランク{deal.rank}</p>
                </div>
                <Link 
                  href={`/deals/${deal.dealId}`}
                  className="text-sm hover:underline"
                  style={{ color: '#0083a0' }}
                >
                  詳細
                </Link>
              </div>
            ))}
            {(!dealsData?.data || dealsData.data.length === 0) && (
              <p className="text-gray-500 text-sm">まだ商談データがありません</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  href: string
  color: 'warning' | 'success' | 'info' | 'primary'
  loading?: boolean
  icon: React.ReactNode
}

function StatCard({ title, value, href, color, loading, icon }: StatCardProps) {
  const colorStyles = {
    warning: { bg: '#fef3c7', text: '#d97706', border: '#fcd34d' },
    success: { bg: '#d1fae5', text: '#059669', border: '#6ee7b7' },
    info: { bg: '#dbeafe', text: '#2563eb', border: '#93c5fd' },
    primary: { bg: '#e6f7fa', text: '#0083a0', border: '#80d9e6' },
  }

  const style = colorStyles[color]

  return (
    <Link href={href} className="card-hover p-6">
      <div className="flex items-center justify-between mb-4">
        <div 
          className="inline-flex items-center justify-center w-12 h-12 rounded-xl"
          style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}
        >
          {icon}
        </div>
        {loading ? (
          <div className="h-8 w-16 bg-gray-100 rounded animate-pulse"></div>
        ) : (
          <p className="text-3xl font-bold" style={{ color: style.text }}>{value}</p>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
    </Link>
  )
}






