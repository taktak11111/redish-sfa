'use client'

import { useState } from 'react'

interface ContractPdfPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  pdfBase64Redish?: string
  pdfBase64Crosspoint?: string
  isLoading: boolean
  error?: string
  onGenerate?: () => void
  isGenerating?: boolean
}

export function ContractPdfPreviewModal({
  isOpen,
  onClose,
  pdfBase64Redish,
  pdfBase64Crosspoint,
  isLoading,
  error,
  onGenerate,
  isGenerating,
}: ContractPdfPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'redish' | 'crosspoint'>('redish')

  if (!isOpen) return null

  const currentPdf = activeTab === 'redish' ? pdfBase64Redish : pdfBase64Crosspoint
  const pdfSrc = currentPdf ? `data:application/pdf;base64,${currentPdf}` : undefined

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      
      {/* モーダル本体 */}
      <div className="relative bg-white rounded-lg shadow-2xl w-[90vw] h-[90vh] flex flex-col z-10">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">契約書プレビュー</h2>
            
            {/* タブ切り替え */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setActiveTab('redish')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'redish'
                    ? 'bg-white text-primary-600 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📄 REDISH契約書
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('crosspoint')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'crosspoint'
                    ? 'bg-white text-primary-600 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📄 クロスポイント契約書
              </button>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="閉じる"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">プレビューを生成中...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-600">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="font-medium text-lg mb-2">エラーが発生しました</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : pdfSrc ? (
            <iframe
              src={pdfSrc}
              className="w-full h-full"
              title={`${activeTab === 'redish' ? 'REDISH' : 'クロスポイント税理士法人'}契約書プレビュー`}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <p className="font-medium text-lg">プレビューがありません</p>
                <p className="text-sm mt-1">契約情報を入力してプレビューを生成してください</p>
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
          <div className="text-sm text-gray-500">
            {pdfSrc && (
              <>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  プレビュー生成済み
                </span>
                <span className="mx-2">|</span>
                <span>※このプレビューは編集できません</span>
              </>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              閉じる
            </button>
            {onGenerate && (
              <button
                type="button"
                onClick={onGenerate}
                disabled={isGenerating || !pdfSrc}
                className="btn-primary"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                    生成中...
                  </>
                ) : (
                  '📤 PDFを生成して保存'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
