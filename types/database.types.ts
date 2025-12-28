export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'pro' | 'whale' | 'admin'
          user_level: 'newbie' | 'intermediate' | 'advanced'
          trading_style: 'scalper' | 'swing' | 'investor' | null
          preferred_sectors: string[] | null
          daily_chat_count: number
          chat_limit: number
          last_chat_reset: string
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'whale' | 'admin'
          user_level?: 'newbie' | 'intermediate' | 'advanced'
          trading_style?: 'scalper' | 'swing' | 'investor' | null
          preferred_sectors?: string[] | null
          daily_chat_count?: number
          chat_limit?: number
          last_chat_reset?: string
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'whale' | 'admin'
          user_level?: 'newbie' | 'intermediate' | 'advanced'
          trading_style?: 'scalper' | 'swing' | 'investor' | null
          preferred_sectors?: string[] | null
          daily_chat_count?: number
          chat_limit?: number
          last_chat_reset?: string
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
