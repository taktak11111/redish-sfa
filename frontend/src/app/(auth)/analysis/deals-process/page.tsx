import { redirect } from 'next/navigation'

export default function DealProcessAnalysisRedirectPage() {
  redirect('/analysis/deals?tab=process')
}
