import { getProviders } from '@/lib/admin/providers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Brain, Check, X } from 'lucide-react'
import { ProviderFormDialog } from '@/components/admin/providers/provider-form-dialog'

export default async function AIProvidersPage() {
  const providers = await getProviders()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">AI Providers</h1>
          <p className="text-muted-foreground mt-2">
            Manage AI provider configurations and settings
          </p>
        </div>
        <ProviderFormDialog />
      </div>

      {/* Providers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => (
          <Card
            key={provider.id}
            className="border-brutal shadow-brutal hover-lift transition-transform"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {provider.name}
                    {provider.is_active ? (
                      <Badge
                        variant="outline"
                        className="border-brutal bg-primary/10 text-primary"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-brutal bg-muted text-muted-foreground"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {provider.provider_type}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model:</span>
                  <span className="font-medium">{provider.model_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority:</span>
                  <span className="font-medium">{provider.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Tokens:</span>
                  <span className="font-medium">
                    {provider.max_tokens?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Temperature:</span>
                  <span className="font-medium">{provider.temperature || 'N/A'}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t-2 border-border">
                <ProviderFormDialog provider={provider} />
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-brutal"
                >
                  Test
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {providers.length === 0 && (
        <Card className="border-brutal shadow-brutal">
          <CardContent className="py-12 text-center">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No AI Providers Configured</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add your first AI provider to get started
            </p>
            <div className="mt-4">
              <ProviderFormDialog
                trigger={
                  <Button className="border-brutal shadow-brutal-sm">
                    <Brain className="h-4 w-4 mr-2" />
                    Add Provider
                  </Button>
                }
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
