'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'

type NavItem = {
  name: string
  href: string
  icon: React.ComponentType<IconProps>
  badge?: string
}

type NavSeparator = {
  type: 'separator'
  label: string
}

type NavElement = NavItem | NavSeparator

const navigation: NavElement[] = [
  { name: 'ダッシュボード', href: '/dashboard', icon: HomeIcon },
  
  // 営業活動
  { type: 'separator', label: '営業活動' },
  { name: 'リード管理', href: '/leads', icon: UserGroupIcon },
  { name: '架電管理', href: '/calls', icon: PhoneIcon },
  { name: '商談管理', href: '/deals', icon: BriefcaseIcon },
  { name: '成約管理', href: '/contracts', icon: DocumentCheckIcon },
  
  // 分析・改善
  { type: 'separator', label: '分析・改善' },
  { name: '売上・成約分析', href: '/analysis/sales', icon: ChartPieIcon },
  { name: 'リード連携分析', href: '/analysis/leads', icon: ChartBarIcon, badge: 'New' },
  { name: '架電結果分析', href: '/analysis/calls', icon: PhoneIcon },
  { name: '商談結果分析', href: '/analysis/field', icon: ChartBarIcon },
  { name: '架電プロセス分析', href: '/analysis/calls-process', icon: ChartBarIcon, badge: 'New' },
  { name: '商談プロセス分析', href: '/analysis/deals-process', icon: ChartBarIcon, badge: 'New' },
  
  // 成長・学習
  { type: 'separator', label: '学習' },
  { name: 'ナレッジセンター', href: '/learning', icon: AcademicCapIcon, badge: 'New' },
  { name: 'ユーザーマニュアル', href: '/manual', icon: BookOpenIcon },
  
  { name: '設定', href: '/settings', icon: CogIcon },
]

const MIN_WIDTH = 64
const MAX_WIDTH = 400
const DEFAULT_WIDTH = 256

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const isCollapsed = width <= 80
  const isMedium = width > 80 && width <= 160

  // リサイズ処理
  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!sidebarRef.current) return
      const newWidth = e.clientX
      const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth))
      setWidth(clampedWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  // クイックサイズ設定
  const setQuickSize = (size: 'small' | 'medium' | 'large') => {
    const sizes = { small: 64, medium: 128, large: 256 }
    setWidth(sizes[size])
  }

  return (
    <div 
      ref={sidebarRef}
      className="flex flex-col h-full bg-white border-r border-gray-200 relative"
      style={{ width: `${width}px`, transition: isResizing ? 'none' : 'width 0.2s ease' }}
    >
      {/* ロゴ - REDISHターコイズブルー */}
      <div 
        className="flex items-center justify-between h-16 px-4 border-b relative"
        style={{ background: 'linear-gradient(to right, #0083a0, #00a4c5)' }}
      >
        <Link href="/dashboard" className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          {!isCollapsed && (
            <span className={`text-lg font-bold text-white whitespace-nowrap ${isMedium ? 'text-sm' : ''}`}>
              {isMedium ? 'REDISH' : 'REDISH SFA'}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-1">
          {!isCollapsed && (
            <div className="flex gap-1">
              <button
                onClick={() => setQuickSize('small')}
                className="p-1 rounded hover:bg-white/20 transition-colors"
                title="小（64px）"
              >
                <div className="w-3 h-3 border border-white/50 rounded"></div>
              </button>
              <button
                onClick={() => setQuickSize('medium')}
                className="p-1 rounded hover:bg-white/20 transition-colors"
                title="中（128px）"
              >
                <div className="w-3 h-3 border-2 border-white/50 rounded"></div>
              </button>
              <button
                onClick={() => setQuickSize('large')}
                className="p-1 rounded hover:bg-white/20 transition-colors"
                title="大（256px）"
              >
                <div className="w-3 h-3 border-2 border-white/50 rounded"></div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item, index) => {
          // セパレーターの場合
          if ('type' in item && item.type === 'separator') {
            if (isCollapsed) {
              return <div key={`sep-${index}`} className="my-2 border-t border-gray-200" />
            }
            return (
              <div key={`sep-${index}`} className={`pt-4 pb-1 ${isMedium ? 'px-1' : 'px-2'}`}>
                <span className={`text-xs font-semibold text-gray-400 uppercase tracking-wider ${isMedium ? 'text-[10px]' : ''}`}>
                  {item.label}
                </span>
              </div>
            )
          }

          // 通常のナビゲーションアイテム
          const navItem = item as NavItem
          const isActive = pathname === navItem.href || pathname.startsWith(navItem.href + '/')
          return (
            <Link
              key={navItem.name}
              href={navItem.href}
              className={`
                flex items-center py-2.5 text-sm font-medium rounded-lg transition-colors group relative
                ${isCollapsed ? 'justify-center px-2 gap-0' : isMedium ? 'px-2 gap-2' : 'px-3 gap-3'}
                ${isActive 
                  ? 'text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
              style={isActive ? { 
                backgroundColor: '#e6f7fa', 
                borderLeft: '4px solid #00a4c5',
                color: '#00627b'
              } : {}}
              title={isCollapsed ? navItem.name : undefined}
            >
              <navItem.icon 
                className={`flex-shrink-0 ${isMedium ? 'w-4 h-4' : 'w-5 h-5'}`}
                style={isActive ? { color: '#0083a0' } : {}}
              />
              {!isCollapsed && (
                <span className={`whitespace-nowrap flex-1 ${isMedium ? 'text-xs truncate' : ''}`}>
                  {navItem.name}
                </span>
              )}
              {/* Newバッジ */}
              {!isCollapsed && navItem.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold text-white rounded" style={{ backgroundColor: '#00a4c5' }}>
                  {navItem.badge}
                </span>
              )}
              {/* ツールチップ（折りたたみ時のみ） */}
              {isCollapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {navItem.name}
                  {navItem.badge && ` (${navItem.badge})`}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ユーザー情報 */}
      <div className={`border-t ${isCollapsed ? 'p-2' : isMedium ? 'p-2' : 'p-4'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : isMedium ? 'gap-2' : 'gap-3'}`}>
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt=""
              className={`rounded-full flex-shrink-0 ${isMedium ? 'w-6 h-6' : 'w-8 h-8'}`}
            />
          ) : (
            <div 
              className={`rounded-full flex items-center justify-center flex-shrink-0 ${isMedium ? 'w-6 h-6' : 'w-8 h-8'}`}
              style={{ backgroundColor: '#e6f7fa' }}
            >
              <span style={{ color: '#0083a0' }} className={isMedium ? 'text-xs font-medium' : 'text-sm font-medium'}>Dev</span>
            </div>
          )}
          {!isCollapsed && (
            <div className={`flex-1 min-w-0 ${isMedium ? 'hidden' : ''}`}>
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name || '開発ユーザー'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session?.user?.email || 'dev@example.com'}
              </p>
            </div>
          )}
        </div>
        {!isCollapsed && !isMedium && (
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="mt-3 w-full btn-outline text-sm"
          >
            ログアウト
          </button>
        )}
      </div>

      {/* リサイズハンドル */}
      <div
        onMouseDown={handleResizeStart}
        className={`absolute top-0 right-0 w-3 h-full cursor-col-resize group z-10 ${
          isResizing ? 'bg-primary-500/20' : ''
        }`}
      >
        <div 
          className={`absolute top-1/2 right-1 transform -translate-y-1/2 w-0.5 h-20 rounded-full transition-all ${
            isResizing 
              ? 'bg-primary-600 opacity-100' 
              : 'bg-primary-500 opacity-0 group-hover:opacity-100'
          }`}
        ></div>
      </div>
    </div>
  )
}

// アイコンコンポーネント共通の型
interface IconProps {
  className?: string
  style?: React.CSSProperties
}

function HomeIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
}

function PhoneIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  )
}

function BriefcaseIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  )
}

function DocumentCheckIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-12M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" />
    </svg>
  )
}

function ChartBarIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  )
}

function ChartPieIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
    </svg>
  )
}

// 折りたたみアイコン
function ChevronLeftIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  )
}

function ChevronRightIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  )
}

function CogIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function UserGroupIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  )
}

function AcademicCapIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
  )
}

function BookOpenIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  )
}







