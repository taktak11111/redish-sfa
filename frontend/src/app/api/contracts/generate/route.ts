import { NextRequest, NextResponse } from 'next/server'
import { contractSheetsClient, ContractData } from '@/lib/sheets/contracts'

// 契約書生成リクエストの型
interface GenerateContractRequest {
  contractData: ContractData
  contractTitle: string
  customerFolderId?: string  // 将来のDrive保存用（現在は未使用）
}

// 契約書を生成（POST）
// ダウンロード方式：PDFをBase64で返す
export async function POST(request: NextRequest) {
  try {
    const body: GenerateContractRequest = await request.json()
    
    // バリデーション
    if (!body.contractData) {
      return NextResponse.json(
        { success: false, error: '契約データが必要です' },
        { status: 400 }
      )
    }
    
    if (!body.contractTitle) {
      return NextResponse.json(
        { success: false, error: '契約書タイトルが必要です' },
        { status: 400 }
      )
    }
    
    // 契約書生成（ダウンロード方式）
    const result = await contractSheetsClient.generateContract(
      body.contractData,
      body.customerFolderId || '',  // 現在は未使用
      body.contractTitle
    )
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        pdfBase64: result.pdfBase64,
        contractTitle: body.contractTitle,
      },
    })
  } catch (error) {
    console.error('[API /api/contracts/generate] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '契約書生成に失敗しました',
      },
      { status: 500 }
    )
  }
}
