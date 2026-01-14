/**
 * 契約書生成クライアント
 * 契約書PDF生成・プレビュー用のクライアントサイド関数
 */

import { ContractData } from '@/lib/sheets/contracts'

// プレビュー結果の型
export interface PreviewResult {
  success: boolean
  pdfBase64?: string
  sheetName?: string
  error?: string
}

// 生成結果の型（ダウンロード方式）
export interface GenerateResult {
  success: boolean
  pdfBase64?: {
    redish?: string
    crosspoint?: string
  }
  contractTitle?: string
  error?: string
}

/**
 * 契約書のプレビューを生成
 * @param contractData 契約データ
 * @param sheetName 表示するシート名（REDISH or クロスポイント）
 * @returns プレビュー結果（Base64 PDF）
 */
export async function previewContract(
  contractData: ContractData,
  sheetName: 'REDISH' | 'クロスポイント'
): Promise<PreviewResult> {
  try {
    const response = await fetch('/api/contracts/preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contractData,
        sheetName,
      }),
    })

    const result = await response.json()

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'プレビュー生成に失敗しました',
      }
    }

    return {
      success: true,
      pdfBase64: result.data.pdfBase64,
      sheetName: result.data.sheetName,
    }
  } catch (error) {
    console.error('[previewContract] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'プレビュー生成に失敗しました',
    }
  }
}

/**
 * 契約書PDFを生成（ダウンロード方式）
 * @param contractData 契約データ
 * @param contractTitle 契約書タイトル
 * @returns 生成結果（Base64 PDF）
 */
export async function generateContract(
  contractData: ContractData,
  contractTitle: string
): Promise<GenerateResult> {
  try {
    const response = await fetch('/api/contracts/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contractData,
        contractTitle,
      }),
    })

    const result = await response.json()

    if (!result.success) {
      return {
        success: false,
        error: result.error || '契約書生成に失敗しました',
      }
    }

    return {
      success: true,
      pdfBase64: result.data.pdfBase64,
      contractTitle: result.data.contractTitle,
    }
  } catch (error) {
    console.error('[generateContract] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '契約書生成に失敗しました',
    }
  }
}

/**
 * Base64 PDFをダウンロード
 * @param base64 Base64エンコードされたPDF
 * @param fileName ファイル名
 */
export function downloadPdf(base64: string, fileName: string): void {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: 'application/pdf' })
  
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * ContractFormData（UIの型）からContractData（API用の型）に変換
 */
export function convertFormToContractData(formData: {
  // 1. 契約情報
  contractDate?: string
  contractStaff?: string
  customerId?: string
  // 2. 顧客情報
  businessType?: string
  entityType?: string
  representativeName?: string
  representativeNameKana?: string
  tel?: string
  mail?: string
  storeCount?: number
  corporateName?: string
  corporateNameKana?: string
  registrationDate?: string
  fiscalMonth?: number
  capital?: number
  // 3. 店舗情報
  storeNumber?: string
  storeName?: string
  openingYear?: string
  openingAddress?: string
  employeeCount?: number
  // 4. サービス費用
  initialFee?: number
  monthlyBookkeepingFee?: number
  taxReturnFee?: number
  receiptInputMonths?: number
  receiptInputFee?: number
  // 5. 付加サービス
  openingDocService?: boolean
  freeeIntegration?: boolean
  // 6. 請求関連
  monthlyStartMonth?: string
  firstPaymentDate?: string
  taxReturnPaymentDate?: string
  fiscalYear?: string
  specialPayment?: string
  // 7. 契約期日
  renewalDate?: string
  cancellationDeadline?: string
  finalDeadline?: string
  // 8. その他
  contractRemarks?: string
}): ContractData {
  return {
    // 1. 契約情報
    contractDate: formData.contractDate || '',
    contractStaff: formData.contractStaff,
    customerNumber: formData.customerId,
    
    // 2. 顧客情報
    businessType: formData.businessType || '',
    entityType: formData.entityType || '',
    representativeName: formData.representativeName || '',
    representativeNameKana: formData.representativeNameKana || '',
    tel: formData.tel || '',
    email: formData.mail || '',
    storeCount: formData.storeCount,
    companyName: formData.corporateName,
    companyNameKana: formData.corporateNameKana,
    registrationDate: formData.registrationDate,
    fiscalMonth: formData.fiscalMonth,
    capital: formData.capital,
    
    // 3. 店舗情報
    storeNumber: formData.storeNumber,
    storeName: formData.storeName,
    openingYear: formData.openingYear ? parseInt(formData.openingYear, 10) : undefined,
    address: formData.openingAddress,
    employeeCount: formData.employeeCount,
    
    // 4. サービス費用
    initialFee: formData.initialFee ?? 50000,
    monthlyBookkeepingFee: formData.monthlyBookkeepingFee ?? 10000,
    taxReturnFee: formData.taxReturnFee ?? 100000,
    receiptInputMonths: formData.receiptInputMonths,
    receiptInputFee: formData.receiptInputFee,
    
    // 5. 付加サービス
    needsBusinessDocs: formData.openingDocService,
    needsFreee: formData.freeeIntegration,
    
    // 6. 請求関連
    monthlyStartMonth: formData.monthlyStartMonth,
    firstPaymentDate: formData.firstPaymentDate,
    taxReturnPaymentMonth: formData.taxReturnPaymentDate,
    fiscalYear: formData.fiscalYear ? parseInt(formData.fiscalYear, 10) : undefined,
    splitPayment: formData.specialPayment,
    
    // 7. 契約期日
    renewalDate: formData.renewalDate,
    cancellationDeadline: formData.cancellationDeadline,
    finalDeadline: formData.finalDeadline,
    
    // 8. その他
    remarks: formData.contractRemarks,
  }
}
