'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const errorType = searchParams.get('error')

  let errorTitle = 'Login Gagal'
  let errorDesc = 'Terjadi kesalahan saat proses autentikasi'

  if (errorType === 'no_code') {
    errorTitle = 'Kode Autentikasi Tidak Ditemukan'
    errorDesc = 'Link login tidak valid atau sudah expired'
  } else if (errorType === 'exchange_failed') {
    errorTitle = 'Validasi Session Gagal'
    errorDesc = 'Tidak dapat memverifikasi session autentikasi'
  }

  return (
    <Card className="border-brutal shadow-brutal">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 border-brutal bg-destructive/10 flex items-center justify-center shadow-brutal-sm">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">{errorTitle}</CardTitle>
            <CardDescription>{errorDesc}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 border-brutal p-4 space-y-2">
          <h3 className="font-semibold">Kemungkinan Penyebab:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Link autentikasi sudah expired atau tidak valid</li>
            <li>Koneksi terputus saat proses login</li>
            <li>Browser memblokir cookies pihak ketiga</li>
            <li>Session timeout</li>
          </ul>
        </div>

        <div className="bg-primary/5 border-brutal p-4 space-y-2">
          <h3 className="font-semibold">Solusi:</h3>
          <ul className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Pastikan cookies diaktifkan di browser</li>
            <li>Coba gunakan mode incognito/private</li>
            <li>Clear browser cache dan cookies</li>
            <li>Coba browser lain jika masalah berlanjut</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button asChild variant="outline" className="border-brutal shadow-brutal-sm hover-lift font-bold flex-1">
          <Link href="/auth/sign-in">
            Coba Login Lagi
          </Link>
        </Button>
        <Button asChild className="border-brutal shadow-brutal-sm hover-lift font-bold flex-1 bg-primary">
          <Link href="/">
            Kembali ke Home
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function AuthCodeErrorPage() {
  return (
    <Suspense fallback={
      <Card className="border-brutal shadow-brutal">
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    }>
      <ErrorContent />
    </Suspense>
  )
}
