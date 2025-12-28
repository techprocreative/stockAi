'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Brain, Edit } from 'lucide-react'

interface ProviderFormDialogProps {
  provider?: any
  trigger?: React.ReactNode
}

export function ProviderFormDialog({ provider, trigger }: ProviderFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: provider?.name || '',
    provider_type: provider?.provider_type || 'openai',
    model_name: provider?.model_name || '',
    api_key: provider?.api_key || '',
    api_endpoint: provider?.api_endpoint || '',
    priority: provider?.priority || 100,
    is_active: provider?.is_active ?? true,
    max_tokens: provider?.max_tokens || 4096,
    temperature: provider?.temperature || 0.7,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = provider
        ? `/api/admin/ai-providers/${provider.id}`
        : '/api/admin/ai-providers'

      const method = provider ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save provider')
      }

      toast({
        title: 'Success',
        description: `Provider ${provider ? 'updated' : 'created'} successfully`,
      })

      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save provider',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="border-brutal">
            {provider ? (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Add Provider
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="border-brutal max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {provider ? 'Edit AI Provider' : 'Add AI Provider'}
          </DialogTitle>
          <DialogDescription>
            Configure the AI provider settings and API credentials
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Basic Settings */}
            <div className="space-y-2">
              <Label htmlFor="name">Provider Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="border-brutal"
                placeholder="e.g., OpenAI GPT-4"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider_type">Provider Type *</Label>
                <Select
                  value={formData.provider_type}
                  onValueChange={(val) =>
                    setFormData({ ...formData, provider_type: val })
                  }
                >
                  <SelectTrigger id="provider_type" className="border-brutal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="groq">Groq</SelectItem>
                    <SelectItem value="ollama">Ollama</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model_name">Model Name *</Label>
                <Input
                  id="model_name"
                  value={formData.model_name}
                  onChange={(e) =>
                    setFormData({ ...formData, model_name: e.target.value })
                  }
                  required
                  className="border-brutal"
                  placeholder="e.g., gpt-4"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                value={formData.api_key}
                onChange={(e) =>
                  setFormData({ ...formData, api_key: e.target.value })
                }
                className="border-brutal"
                placeholder="Enter API key"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api_endpoint">API Endpoint</Label>
              <Input
                id="api_endpoint"
                value={formData.api_endpoint}
                onChange={(e) =>
                  setFormData({ ...formData, api_endpoint: e.target.value })
                }
                className="border-brutal"
                placeholder="https://api.example.com/v1"
              />
            </div>

            {/* Advanced Settings */}
            <div className="border-t-2 border-border pt-4">
              <h3 className="text-sm font-medium mb-3">Advanced Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: parseInt(e.target.value) })
                    }
                    className="border-brutal"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower = higher priority
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_tokens">Max Tokens</Label>
                  <Input
                    id="max_tokens"
                    type="number"
                    value={formData.max_tokens}
                    onChange={(e) =>
                      setFormData({ ...formData, max_tokens: parseInt(e.target.value) })
                    }
                    className="border-brutal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={formData.temperature}
                    onChange={(e) =>
                      setFormData({ ...formData, temperature: parseFloat(e.target.value) })
                    }
                    className="border-brutal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="is_active">Active Status</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_active: checked })
                      }
                    />
                    <Label htmlFor="is_active" className="text-sm">
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="border-brutal"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="border-brutal shadow-brutal-sm"
            >
              {isLoading ? 'Saving...' : provider ? 'Update Provider' : 'Create Provider'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
