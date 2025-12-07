import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/spreadsheets',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      // 許可されたドメインのみログイン可能
      const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS?.split(',') || []
      const email = profile?.email || ''
      const domain = email.split('@')[1]
      
      if (allowedDomains.length > 0 && !allowedDomains.includes(domain)) {
        console.warn(`[Auth] 許可されていないドメインからのログイン試行: ${email}`)
        return false
      }
      
      return true
    },
    async jwt({ token, account }) {
      // アクセストークンを保存（Sheets API用）
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      return token
    },
    async session({ session, token }) {
      // セッションにトークンを追加
      session.accessToken = token.accessToken as string
      return session
    },
  },
  pages: {
    signIn: '/',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
}
