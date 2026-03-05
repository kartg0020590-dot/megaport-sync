import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ 找不到 Supabase 鑰匙！請檢查 .env.local 檔案位置是否正確。')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)