'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Shield, ShieldOff } from 'lucide-react'

export function AdminUsers() {
  const [admins, setAdmins] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      // Mock data for now - in production, fetch from API
      setAdmins([
        {
          id: '1',
          full_name: 'Admin User',
          username: 'admin',
          avatar_url: null,
          created_at: new Date().toISOString(),
        },
      ])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load admin users',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevoke = async (userId: string) => {
    if (!confirm('Are you sure you want to revoke admin access?')) return

    toast({
      title: 'Success',
      description: 'Admin access revoked',
    })

    fetchAdmins()
  }

  return (
    <div className="space-y-4">
      <div className="border-brutal shadow-brutal bg-card rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b-4 border-border">
              <TableHead className="font-bold">User</TableHead>
              <TableHead className="font-bold">Username</TableHead>
              <TableHead className="font-bold">Since</TableHead>
              <TableHead className="font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No admin users found
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => {
                const initials = admin.full_name
                  ? admin.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                  : admin.username?.[0]?.toUpperCase() || 'A'

                return (
                  <TableRow key={admin.id} className="border-b-2 border-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="border-brutal">
                          <AvatarImage src={admin.avatar_url} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{admin.full_name || 'N/A'}</p>
                          <Badge variant="outline" className="border-brutal bg-destructive/10 text-destructive">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      @{admin.username}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(admin.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevoke(admin.id)}
                        className="border-brutal"
                      >
                        <ShieldOff className="h-4 w-4 mr-2" />
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        To promote a user to admin, edit their subscription tier in the Users section.
      </p>
    </div>
  )
}
