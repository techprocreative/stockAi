import { createClient } from '@/lib/supabase/server'

export interface MorningBriefing {
  id: string
  date: string
  global_markets: {
    dow: { value: number; change: number }
    sp500: { value: number; change: number }
    nikkei: { value: number; change: number }
  }
  macro_data: {
    usd_idr: { value: number; change: number }
    gold: { value: number; change: number }
    oil: { value: number; change: number }
  }
  ai_sentiment: string
  top_news: Array<{
    title: string
    url: string
    source: string
  }>
  created_at: string
}

export class MorningBriefingService {
  static async getTodaysBriefing(): Promise<MorningBriefing | null> {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('morning_briefings')
      .select('*')
      .eq('date', today)
      .single()

    if (error || !data) {
      return null
    }

    return data as MorningBriefing
  }

  static async generateBriefing(): Promise<MorningBriefing> {
    const today = new Date().toISOString().split('T')[0]

    // Placeholder implementation
    // In production, this would fetch real data from APIs
    const briefingData = {
      date: today,
      global_markets: {
        dow: { value: 42000, change: 0.5 },
        sp500: { value: 5800, change: 0.3 },
        nikkei: { value: 38000, change: -0.2 },
      },
      macro_data: {
        usd_idr: { value: 15850, change: 0.15 },
        gold: { value: 2050, change: 0.8 },
        oil: { value: 78, change: -1.2 },
      },
      ai_sentiment: `**Sentimen Hari Ini: Netral-Positif**

Pasar global mixed dengan Wall Street naik tipis sementara Asia terkoreksi. USD/IDR stabil di 15,850.

**Sektor Menarik:**
- Banking: Potensi rally lanjutan
- Consumer: Menjelang liburan akhir tahun

**Catatan:**
Pantau rilis data inflasi AS malam ini, bisa pengaruhi sentimen besok.`,
      top_news: [
        {
          title: 'IHSG Ditutup Menguat 0.5% di 7,234',
          url: '#',
          source: 'CNBC Indonesia',
        },
        {
          title: 'BI Pertahankan Suku Bunga 6%',
          url: '#',
          source: 'Bisnis.com',
        },
        {
          title: 'Saham Bank Kompak Menghijau',
          url: '#',
          source: 'Kontan',
        },
      ],
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('morning_briefings')
      .upsert(briefingData, { onConflict: 'date' })
      .select()
      .single()

    if (error) {
      throw new Error('Failed to save morning briefing')
    }

    return data as MorningBriefing
  }
}
