'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Save } from 'lucide-react'

export function FeatureFlags() {
  const [flags, setFlags] = useState({
    enableChat: true,
    enableWatchlist: true,
    enableAlerts: true,
    enableGlossary: true,
    enableMorningBriefing: true,
    enableNewsFeeds: false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    toast({
      title: 'Success',
      description: 'Feature flags updated successfully',
    })
    setIsSaving(false)
  }

  const features = [
    { key: 'enableChat', label: 'AI Chat', description: 'Enable AI-powered stock chat' },
    { key: 'enableWatchlist', label: 'Watchlist', description: 'Enable stock watchlist feature' },
    { key: 'enableAlerts', label: 'Price Alerts', description: 'Enable price alert notifications' },
    { key: 'enableGlossary', label: 'Glossary', description: 'Enable financial terms glossary' },
    { key: 'enableMorningBriefing', label: 'Morning Briefing', description: 'Enable daily market briefings' },
    { key: 'enableNewsFeeds', label: 'News Feeds', description: 'Enable real-time news feeds' },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {features.map((feature) => (
          <div
            key={feature.key}
            className="flex items-center justify-between border-brutal p-4 bg-muted/20"
          >
            <div className="space-y-0.5">
              <Label htmlFor={feature.key} className="text-base font-medium">
                {feature.label}
              </Label>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
            <Switch
              id={feature.key}
              checked={flags[feature.key as keyof typeof flags]}
              onCheckedChange={(checked) =>
                setFlags({ ...flags, [feature.key]: checked })
              }
            />
          </div>
        ))}
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
