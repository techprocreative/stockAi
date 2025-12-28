import { getUserById } from '@/lib/admin/users'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { formatDistanceToNow } from 'date-fns'
import {
  MessageSquare,
  Star,
  Bell,
  Calendar,
  Activity,
} from 'lucide-react'
import { EditTierDialog } from '@/components/admin/users/edit-tier-dialog'

interface PageProps {
  params: {
    id: string
  }
}

export default async function UserDetailPage({ params }: PageProps) {
  const user = await getUserById(params.id)

  if (!user) {
    notFound()
  }

  const initials = user.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.username?.[0]?.toUpperCase() || 'U'

  const tierColors = {
    free: 'bg-muted text-muted-foreground',
    pro: 'bg-primary/10 text-primary',
    whale: 'bg-secondary/10 text-secondary',
    admin: 'bg-destructive/10 text-destructive',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">User Detail</h1>
        <p className="text-muted-foreground mt-2">
          View and manage user information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Profile Info */}
        <div className="md:col-span-1">
          <Card className="border-brutal shadow-brutal">
            <CardHeader>
              <div className="flex flex-col items-center">
                <Avatar className="w-32 h-32 border-brutal mb-4">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl text-center mb-1">
                  {user.full_name || 'N/A'}
                </CardTitle>
                <p className="text-muted-foreground">@{user.username}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="text-sm font-medium break-all">
                  {/* Email from auth.users, need to fetch separately */}
                  {user.id}
                </p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Subscription Tier</Label>
                <div className="mt-1 flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={`border-brutal ${tierColors[user.subscription_tier as keyof typeof tierColors]}`}
                  >
                    {user.subscription_tier}
                  </Badge>
                  <EditTierDialog userId={user.id} currentTier={user.subscription_tier} />
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">User Level</Label>
                <p className="text-sm font-medium capitalize">
                  {user.user_level || 'N/A'}
                </p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Trading Style</Label>
                <p className="text-sm font-medium capitalize">
                  {user.trading_style || 'N/A'}
                </p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Joined</Label>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(user.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Chat Usage</Label>
                <p className="text-sm font-medium">
                  {user.daily_chat_count} / {user.chat_limit} today
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activity Stats */}
        <div className="md:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-brutal shadow-brutal-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Chats
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {user.chat_sessions?.[0]?.count || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border-brutal shadow-brutal-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Watchlist
                </CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {user.watchlists?.[0]?.count || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border-brutal shadow-brutal-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Alerts
                </CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {user.alerts?.[0]?.count || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Chat Sessions */}
          <Card className="border-brutal shadow-brutal">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Chat Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.recentSessions.length > 0 ? (
                user.recentSessions.map((session: any) => (
                  <div
                    key={session.id}
                    className="border-brutal p-4 bg-muted/30"
                  >
                    <p className="font-medium">{session.title || 'Untitled Chat'}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {session.message_count} messages •{' '}
                      {formatDistanceToNow(new Date(session.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No chat sessions yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-brutal border-destructive shadow-brutal">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full border-brutal"
              >
                Send Password Reset Email
              </Button>
              <Button
                variant="destructive"
                className="w-full border-brutal"
              >
                Delete User Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
