'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface UsersPaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
}

export function UsersPagination({
  currentPage,
  totalPages,
  totalCount,
}: UsersPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigate = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/admin/users?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => navigate(currentPage - 1)}
        className="border-brutal"
      >
        ← Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages} • {totalCount} total users
      </span>
      <Button
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => navigate(currentPage + 1)}
        className="border-brutal"
      >
        Next →
      </Button>
    </div>
  )
}
