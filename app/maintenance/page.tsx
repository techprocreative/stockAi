import { Wrench } from 'lucide-react'
import { getMaintenanceMode } from '@/lib/supabase/middleware'

export default function MaintenancePage() {
  const maintenanceMode = getMaintenanceMode()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="inline-block p-6 border-brutal shadow-brutal bg-card">
          <Wrench className="h-16 w-16 mx-auto text-primary" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Under Maintenance
          </h1>
          <p className="text-lg text-muted-foreground">
            {maintenanceMode.message}
          </p>
        </div>

        <div className="border-brutal bg-muted/20 p-4">
          <p className="text-sm text-muted-foreground">
            We appreciate your patience. Please check back soon!
          </p>
        </div>
      </div>
    </div>
  )
}
