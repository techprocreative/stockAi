'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Save } from 'lucide-react'

export function ChatLimitsConfig() {
  const [limits, setLimits] = useState({
    free: 10,
    pro: 50,
    whale: 200,
    admin: 999999,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      if (data.settings?.chatLimits) {
        setLimits(data.settings.chatLimits)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load settings',
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
        body: JSON.stringify({ chatLimits: limits }),
      })

      if (!response.ok) throw new Error('Failed to save')

      toast({
        title: 'Success',
        description: 'Chat limits updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
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
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="free">Free Tier Daily Limit</Label>
          <Input
            id="free"
            type="number"
            value={limits.free}
            onChange={(e) => setLimits({ ...limits, free: parseInt(e.target.value) })}
            className="border-brutal"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pro">Pro Tier Daily Limit</Label>
          <Input
            id="pro"
            type="number"
            value={limits.pro}
            onChange={(e) => setLimits({ ...limits, pro: parseInt(e.target.value) })}
            className="border-brutal"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whale">Whale Tier Daily Limit</Label>
          <Input
            id="whale"
            type="number"
            value={limits.whale}
            onChange={(e) => setLimits({ ...limits, whale: parseInt(e.target.value) })}
            className="border-brutal"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin">Admin Tier Daily Limit</Label>
          <Input
            id="admin"
            type="number"
            value={limits.admin}
            onChange={(e) => setLimits({ ...limits, admin: parseInt(e.target.value) })}
            className="border-brutal"
          />
        </div>
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
