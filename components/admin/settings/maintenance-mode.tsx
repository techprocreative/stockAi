'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Save, AlertTriangle } from 'lucide-react'

export function MaintenanceMode() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [message, setMessage] = useState(
    'We are currently performing scheduled maintenance. We will be back shortly!'
  )
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      if (data.settings?.maintenanceMode) {
        setIsEnabled(data.settings.maintenanceMode.enabled)
        setMessage(data.settings.maintenanceMode.message)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load maintenance mode settings',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maintenanceMode: { enabled: isEnabled, message },
        }),
      })

      if (!response.ok) throw new Error('Failed to save')

      toast({
        title: 'Success',
        description: isEnabled
          ? 'Maintenance mode enabled - site is now offline for non-admins'
          : 'Maintenance mode disabled - site is now online',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save maintenance mode settings',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {isEnabled && (
        <div className="border-brutal border-destructive bg-destructive/10 p-4">
          <div className="flex items-center gap-2 text-destructive font-medium">
            <AlertTriangle className="h-5 w-5" />
            Maintenance Mode Active
          </div>
          <p className="text-sm text-destructive/80 mt-1">
            The site is currently offline for all non-admin users
          </p>
        </div>
      )}

      <div className="flex items-center justify-between border-brutal p-4 bg-muted/20">
        <div className="space-y-0.5">
          <Label htmlFor="maintenance-mode" className="text-base font-medium">
            Enable Maintenance Mode
          </Label>
          <p className="text-sm text-muted-foreground">
            Block access to non-admin users during maintenance
          </p>
        </div>
        <Switch
          id="maintenance-mode"
          checked={isEnabled}
          onCheckedChange={setIsEnabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maintenance-message">Maintenance Message</Label>
        <Textarea
          id="maintenance-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border-brutal min-h-[120px]"
          placeholder="Enter the message users will see during maintenance..."
        />
        <p className="text-xs text-muted-foreground">
          This message will be displayed to users when they try to access the site
        </p>
      </div>

      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="border-brutal shadow-brutal-sm"
      >
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  )
}
