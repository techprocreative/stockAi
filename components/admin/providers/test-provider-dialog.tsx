'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2, CheckCircle2, XCircle, Zap } from 'lucide-react'

interface TestProviderDialogProps {
  providerId: string
  providerName: string
}

export function TestProviderDialog({ providerId, providerName }: TestProviderDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const { toast } = useToast()

  const handleTest = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/admin/ai-providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider_id: providerId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Test failed')
      }

      setTestResult(data)

      if (data.success) {
        toast({
          title: 'Test Successful',
          description: `${providerName} responded in ${data.responseTime}ms`,
        })
      } else {
        toast({
          title: 'Test Failed',
          description: data.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to test provider',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-brutal"
        >
          Test
        </Button>
      </DialogTrigger>
      <DialogContent className="border-brutal">
        <DialogHeader>
          <DialogTitle>Test AI Provider</DialogTitle>
          <DialogDescription>
            Send a test request to {providerName} to verify connectivity and configuration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!testResult && !isLoading && (
            <div className="text-center py-8">
              <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                Click the button below to test the provider
              </p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Testing provider...</p>
            </div>
          )}

          {testResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-4">
                {testResult.success ? (
                  <div className="text-center">
                    <CheckCircle2 className="h-16 w-16 mx-auto text-primary mb-2" />
                    <p className="font-medium text-lg">Test Successful</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <XCircle className="h-16 w-16 mx-auto text-destructive mb-2" />
                    <p className="font-medium text-lg">Test Failed</p>
                  </div>
                )}
              </div>

              <div className="border-brutal p-4 bg-muted/30 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider:</span>
                  <span className="font-medium">{testResult.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model:</span>
                  <span className="font-medium">{testResult.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Response Time:</span>
                  <span className="font-medium">{testResult.responseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={testResult.success ? 'text-primary font-medium' : 'text-destructive font-medium'}>
                    {testResult.message}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleTest}
            disabled={isLoading}
            className="w-full border-brutal shadow-brutal-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                {testResult ? 'Test Again' : 'Run Test'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
