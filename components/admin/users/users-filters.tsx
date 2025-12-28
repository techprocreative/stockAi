'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTransition } from 'react'

export function UsersFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // Reset to page 1 when filtering
    params.set('page', '1')

    startTransition(() => {
      router.push(`/admin/users?${params.toString()}`)
    })
  }

  return (
    <div className="flex gap-4">
      <Input
        placeholder="Search by name or username..."
        defaultValue={searchParams.get('search') || ''}
        onChange={(e) => updateFilters('search', e.target.value)}
        className="flex-1 border-brutal"
      />
      <Select
        defaultValue={searchParams.get('tier') || ''}
        onValueChange={(val) => updateFilters('tier', val)}
      >
        <SelectTrigger className="w-48 border-brutal">
          <SelectValue placeholder="All Tiers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Tiers</SelectItem>
          <SelectItem value="free">Free</SelectItem>
          <SelectItem value="pro">Pro</SelectItem>
          <SelectItem value="whale">Whale</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
      <Select
        defaultValue={searchParams.get('level') || ''}
        onValueChange={(val) => updateFilters('level', val)}
      >
        <SelectTrigger className="w-48 border-brutal">
          <SelectValue placeholder="All Levels" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Levels</SelectItem>
          <SelectItem value="newbie">Newbie</SelectItem>
          <SelectItem value="intermediate">Intermediate</SelectItem>
          <SelectItem value="advanced">Advanced</SelectItem>
        </SelectContent>
      </Select>
      {isPending && (
        <div className="flex items-center text-sm text-muted-foreground">
          Loading...
        </div>
      )}
    </div>
  )
}
