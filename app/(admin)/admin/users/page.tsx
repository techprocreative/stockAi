import { getUsers } from '@/lib/admin/users'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { UsersFilters } from '@/components/admin/users/users-filters'
import { UsersPagination } from '@/components/admin/users/users-pagination'

interface PageProps {
  searchParams: {
    page?: string
    search?: string
    tier?: string
    level?: string
  }
}

export default async function UsersPage({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page || '1')
  const search = searchParams.search || ''
  const tier = searchParams.tier || ''
  const level = searchParams.level || ''

  const { users, count, totalPages } = await getUsers({
    page,
    search,
    tier,
    level,
  })

  const tierColors = {
    free: 'bg-muted text-muted-foreground',
    pro: 'bg-primary/10 text-primary',
    whale: 'bg-secondary/10 text-secondary',
    admin: 'bg-destructive/10 text-destructive',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage users, edit tiers, and view activity
        </p>
      </div>

      {/* Filters */}
      <UsersFilters />

      {/* Users Table */}
      <div className="border-brutal shadow-brutal bg-card rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b-4 border-border">
              <TableHead className="font-bold">User</TableHead>
              <TableHead className="font-bold">Tier</TableHead>
              <TableHead className="font-bold">Level</TableHead>
              <TableHead className="font-bold">Joined</TableHead>
              <TableHead className="font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const initials = user.full_name
                ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                : user.username?.[0]?.toUpperCase() || 'U'

              return (
                <TableRow key={user.id} className="border-b-2 border-border">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="border-brutal">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`border-brutal ${tierColors[user.subscription_tier as keyof typeof tierColors]}`}
                    >
                      {user.subscription_tier}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">
                    {user.user_level || 'N/A'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(user.created_at), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-brutal shadow-brutal-sm"
                    >
                      <Link href={`/admin/users/${user.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <UsersPagination
        currentPage={page}
        totalPages={totalPages}
        totalCount={count}
      />
      </div>
    </div>
  )
}
