import { redirect } from 'next/navigation'

export default function CallProcessAnalysisRedirectPage() {
  redirect('/analysis/calls?tab=process')
}
