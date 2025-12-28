'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground mt-2">
          Kelola preferensi dan konfigurasi akun kamu
        </p>
      </div>

      <Card className="border-brutal shadow-brutal">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 border-brutal bg-primary/10 flex items-center justify-center shadow-brutal-sm">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Halaman Pengaturan</CardTitle>
              <CardDescription>
                Coming soon - Fitur pengaturan sedang dalam pengembangan
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 border-brutal p-6 space-y-3">
            <h3 className="font-semibold">Fitur yang Akan Datang:</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Ubah nama profil dan avatar</li>
              <li>Update preferensi trading (level & gaya)</li>
              <li>Kelola notifikasi dan alert</li>
              <li>Pengaturan privasi</li>
              <li>Tema dark/light mode (sudah direncanakan)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
