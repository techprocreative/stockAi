'use client'

import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

interface AddToWatchlistButtonProps {
  stockCode: string
}

export function AddToWatchlistButton({ stockCode }: AddToWatchlistButtonProps) {
  const queryClient = useQueryClient()
  const [isInWatchlist, setIsInWatchlist] = useState(false)

  // Check if stock is in watchlist
  const { data: watchlist } = useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const response = await fetch('/api/watchlist')
      if (!response.ok) return []
      const json = await response.json()
      return json.watchlist || []
    },
  })

  useEffect(() => {
    if (watchlist) {
      const inList = watchlist.some((item: any) => item.stock_code === stockCode)
      setIsInWatchlist(inList)
    }
  }, [watchlist, stockCode])

  // Add to watchlist mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockCode }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add to watchlist')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] })
      setIsInWatchlist(true)
    },
  })

  // Remove from watchlist mutation
  const removeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/watchlist?stock_code=${stockCode}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to remove from watchlist')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] })
      setIsInWatchlist(false)
    },
  })

  const handleClick = () => {
    if (isInWatchlist) {
      removeMutation.mutate()
    } else {
      addMutation.mutate()
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={addMutation.isPending || removeMutation.isPending}
    >
      <Star
        className={`h-4 w-4 mr-2 ${
          isInWatchlist ? 'fill-primary-500 text-primary-500' : ''
        }`}
      />
      {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
    </Button>
  )
}
