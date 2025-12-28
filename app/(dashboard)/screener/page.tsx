'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, Search, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'

interface Stock {
  stock_code: string
  stock_name: string
  price: number
  change_percent: number
  market_cap?: number
  per?: number
  pbv?: number
  roe?: number
  sector?: string
}

export default function ScreenerPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    perMin: '',
    perMax: '',
    pbvMin: '',
    pbvMax: '',
    roeMin: '',
    sector: '',
  })

  // Fetch all stocks
  const { data, isLoading, error } = useQuery({
    queryKey: ['stocks'],
    queryFn: async () => {
      const response = await fetch('/api/stocks')
      if (!response.ok) {
        throw new Error('Failed to fetch stocks')
      }
      const json = await response.json()
      return json.stocks as Stock[]
    },
  })

  // Filter stocks based on criteria
  const filteredStocks = data?.filter((stock) => {
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const matchesCode = stock.stock_code.toLowerCase().includes(term)
      const matchesName = stock.stock_name?.toLowerCase().includes(term)
      if (!matchesCode && !matchesName) return false
    }

    // PER filter
    if (filters.perMin && stock.per && stock.per < parseFloat(filters.perMin)) return false
    if (filters.perMax && stock.per && stock.per > parseFloat(filters.perMax)) return false

    // PBV filter
    if (filters.pbvMin && stock.pbv && stock.pbv < parseFloat(filters.pbvMin)) return false
    if (filters.pbvMax && stock.pbv && stock.pbv > parseFloat(filters.pbvMax)) return false

    // ROE filter
    if (filters.roeMin && stock.roe && stock.roe < parseFloat(filters.roeMin)) return false

    // Sector filter
    if (filters.sector && stock.sector !== filters.sector) return false

    return true
  })

  const resetFilters = () => {
    setFilters({
      perMin: '',
      perMax: '',
      pbvMin: '',
      pbvMax: '',
      roeMin: '',
      sector: '',
    })
    setSearchTerm('')
  }

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
          <h1 className="text-3xl font-bold">Stock Screener</h1>
          <p className="text-muted-foreground">Cari saham berdasarkan kriteria</p>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-danger-500">Gagal memuat data saham. Silakan coba lagi.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stock Screener</h1>
        <p className="text-muted-foreground">Cari saham berdasarkan kriteria fundamental</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
          <CardDescription>Gunakan filter untuk menyaring saham</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div>
              <Label htmlFor="search">Cari Saham</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Kode atau nama saham..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* PER Filter */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="perMin">PER Min</Label>
                <Input
                  id="perMin"
                  type="number"
                  value={filters.perMin}
                  onChange={(e) => setFilters({ ...filters, perMin: e.target.value })}
                  placeholder="0"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="perMax">PER Max</Label>
                <Input
                  id="perMax"
                  type="number"
                  value={filters.perMax}
                  onChange={(e) => setFilters({ ...filters, perMax: e.target.value })}
                  placeholder="25"
                  className="mt-2"
                />
              </div>
            </div>

            {/* PBV Filter */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pbvMin">PBV Min</Label>
                <Input
                  id="pbvMin"
                  type="number"
                  value={filters.pbvMin}
                  onChange={(e) => setFilters({ ...filters, pbvMin: e.target.value })}
                  placeholder="0"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="pbvMax">PBV Max</Label>
                <Input
                  id="pbvMax"
                  type="number"
                  value={filters.pbvMax}
                  onChange={(e) => setFilters({ ...filters, pbvMax: e.target.value })}
                  placeholder="3"
                  className="mt-2"
                />
              </div>
            </div>

            {/* ROE Filter */}
            <div>
              <Label htmlFor="roeMin">ROE Minimal (%)</Label>
              <Input
                id="roeMin"
                type="number"
                value={filters.roeMin}
                onChange={(e) => setFilters({ ...filters, roeMin: e.target.value })}
                placeholder="15"
                className="mt-2"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={resetFilters} variant="outline" className="flex-1">
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Hasil ({filteredStocks?.length || 0} saham)</CardTitle>
        </CardHeader>
        <CardContent>
          {!filteredStocks || filteredStocks.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Tidak ada saham yang sesuai kriteria</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStocks.map((stock) => {
                const isPositive = stock.change_percent >= 0
                return (
                  <Link
                    key={stock.stock_code}
                    href={`/stock/${stock.stock_code}`}
                    className="block p-4 rounded-lg border hover:border-primary-500 hover:bg-primary-50 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold">{stock.stock_code}</h3>
                        <p className="text-sm text-muted-foreground">{stock.stock_name}</p>
                        {stock.sector && (
                          <p className="text-xs text-muted-foreground mt-1">{stock.sector}</p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="font-bold">
                          Rp {stock.price?.toLocaleString('id-ID') || 'N/A'}
                        </p>
                        <div
                          className={`flex items-center gap-1 justify-end text-sm ${
                            isPositive ? 'text-success-600' : 'text-danger-500'
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          <span>
                            {isPositive ? '+' : ''}
                            {stock.change_percent?.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">PER</p>
                        <p className="font-semibold">{stock.per?.toFixed(2) || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">PBV</p>
                        <p className="font-semibold">{stock.pbv?.toFixed(2) || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">ROE</p>
                        <p className="font-semibold">
                          {stock.roe ? `${stock.roe.toFixed(2)}%` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
