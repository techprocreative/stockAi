'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { WatchlistCard } from '@/components/watchlist/watchlist-card'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface WatchlistItem {
  id: string
  stock_code: string
  created_at: string
  stock_fundamentals: {
    stock_name: string
    price: number
    change_percent: number
    sector: string
    subsector: string
    per: number
    pbv: number
    roe: number
  }
}

export default function WatchlistPage() {
  const queryClient = useQueryClient()

  // Fetch watchlist
  const { data, isLoading, error } = useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const response = await fetch('/api/watchlist')
      if (!response.ok) {
        throw new Error('Failed to fetch watchlist')
      }
      const json = await response.json()
      return json.watchlist as WatchlistItem[]
    },
  })

  // Remove from watchlist mutation
  const removeMutation = useMutation({
    mutationFn: async (stockCode: string) => {
      const response = await fetch(`/api/watchlist?stock_code=${stockCode}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to remove from watchlist')
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['watchlist'] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Watchlist</h1>
          <p className="text-muted-foreground">Saham yang kamu pantau</p>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-danger-500">
              Gagal memuat watchlist. Silakan coba lagi.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Watchlist</h1>
        <p className="text-muted-foreground">Saham yang kamu pantau</p>
      </div>

      {!data || data.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-2">
              Watchlist kamu masih kosong
            </p>
            <p className="text-sm text-muted-foreground">
              Tambahkan saham dari halaman detail saham
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <WatchlistCard
              key={item.id}
              item={item}
              onRemove={removeMutation.mutate}
              isRemoving={removeMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  )
}
