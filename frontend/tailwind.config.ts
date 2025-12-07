import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ========================================
        // REDISHブランドカラー（ターコイズブルー）
        // REDISH開業システムと同一のブランドカラー
        // ========================================
        primary: {
          50: '#e6f7fa',   // 背景・ホバー
          100: '#b3e8f0',  // 淡い背景
          200: '#80d9e6',  // ボーダー
          300: '#4dcadc',  // アイコン
          400: '#1ab8d2',  // ボタン（ホバー前）
          500: '#00a4c5',  // メインカラー
          600: '#0083a0',  // ボタン（ホバー後）
          700: '#00627b',  // テキスト（強調）※コントラスト比6.5:1
          800: '#004156',  // テキスト（濃い）
          900: '#002031',  // 最濃色
        },
      },
      
      fontFamily: {
        sans: ['Noto Sans JP', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
