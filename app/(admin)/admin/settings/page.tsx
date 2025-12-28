import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings as SettingsIcon, MessageSquare, Flag, Shield } from 'lucide-react'
import { ChatLimitsConfig } from '@/components/admin/settings/chat-limits-config'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure system-wide settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Chat Limits Configuration */}
        <Card className="border-brutal shadow-brutal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat Limits Configuration
            </CardTitle>
            <CardDescription>
              Configure daily chat limits for different subscription tiers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChatLimitsConfig />
          </CardContent>
        </Card>

        {/* Feature Flags */}
        <Card className="border-brutal shadow-brutal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Feature Flags
            </CardTitle>
            <CardDescription>
              Enable or disable features globally
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-brutal p-8 bg-muted/30 rounded text-center">
              <p className="text-sm text-muted-foreground">
                Feature flags configuration coming soon
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Admin Users Management */}
        <Card className="border-brutal shadow-brutal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Users
            </CardTitle>
            <CardDescription>
              Manage admin access and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-brutal p-8 bg-muted/30 rounded text-center">
              <p className="text-sm text-muted-foreground">
                Admin users management coming soon
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
