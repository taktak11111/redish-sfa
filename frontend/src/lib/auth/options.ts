import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ profile }) {
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
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.email = profile.email
        token.name = profile.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
}







