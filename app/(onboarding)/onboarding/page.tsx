'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

const STEPS = [
  { id: 1, title: 'Profil Dasar', description: 'Siapa kamu?' },
  { id: 2, title: 'Level & Gaya Trading', description: 'Pengalaman kamu' },
  { id: 3, title: 'Selesai!', description: 'Siap mulai analisa' },
]

interface OnboardingData {
  fullName: string
  userLevel: 'newbie' | 'intermediate' | 'advanced'
  tradingStyle: 'value' | 'growth' | 'dividend' | 'swing' | 'day_trading' | 'long_term'
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    userLevel: 'newbie',
    tradingStyle: 'long_term',
  })

  const handleNext = () => {
    if (currentStep === 1 && !data.fullName.trim()) {
      setError('Nama lengkap harus diisi')
      return
    }
    setError('')
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
  }

  const handleBack = () => {
    setError('')
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to complete onboarding')
      }

      // Wait a bit for server to update and revalidate
      await new Promise(resolve => setTimeout(resolve, 500))

      // Hard refresh to clear all caches
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      step.id <= currentStep
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {step.id}
                  </div>
                  <p
                    className={`mt-2 text-sm font-medium ${
                      step.id <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-colors ${
                      step.id < currentStep ? 'bg-primary-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Basic Profile */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Nama Lengkap</Label>
                  <Input
                    id="fullName"
                    value={data.fullName}
                    onChange={(e) => setData({ ...data, fullName: e.target.value })}
                    placeholder="Masukkan nama lengkap kamu"
                    className="mt-2"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Nama ini akan muncul di profil kamu dan saat berinteraksi dengan AI.
                </p>
              </div>
            )}

            {/* Step 2: Level & Trading Style */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Level Pengalaman</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { value: 'newbie', label: 'Pemula', desc: 'Baru mulai belajar saham' },
                      {
                        value: 'intermediate',
                        label: 'Menengah',
                        desc: 'Sudah punya pengalaman trading',
                      },
                      {
                        value: 'advanced',
                        label: 'Mahir',
                        desc: 'Expert dalam analisa fundamental & teknikal',
                      },
                    ].map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() =>
                          setData({
                            ...data,
                            userLevel: level.value as OnboardingData['userLevel'],
                          })
                        }
                        className={`text-left p-4 rounded-lg border-2 transition-all ${
                          data.userLevel === level.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-semibold">{level.label}</p>
                        <p className="text-sm text-muted-foreground">{level.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Gaya Trading</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      {
                        value: 'value',
                        label: 'Value Investing',
                        desc: 'Cari saham undervalued',
                      },
                      { value: 'growth', label: 'Growth', desc: 'Fokus pertumbuhan perusahaan' },
                      {
                        value: 'dividend',
                        label: 'Dividend',
                        desc: 'Prioritas passive income',
                      },
                      { value: 'swing', label: 'Swing Trading', desc: 'Hold beberapa hari/minggu' },
                      { value: 'long_term', label: 'Long Term', desc: 'Hold jangka panjang (1+ tahun)' },
                    ].map((style) => (
                      <button
                        key={style.value}
                        type="button"
                        onClick={() =>
                          setData({
                            ...data,
                            tradingStyle: style.value as OnboardingData['tradingStyle'],
                          })
                        }
                        className={`text-left p-4 rounded-lg border-2 transition-all ${
                          data.tradingStyle === style.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-semibold">{style.label}</p>
                        <p className="text-sm text-muted-foreground">{style.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Complete */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="bg-primary-50 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Ringkasan Profil</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Nama</p>
                      <p className="font-medium">{data.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Level</p>
                      <p className="font-medium">
                        {data.userLevel === 'newbie'
                          ? 'Pemula'
                          : data.userLevel === 'intermediate'
                          ? 'Menengah'
                          : 'Mahir'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gaya Trading</p>
                      <p className="font-medium">
                        {data.tradingStyle === 'value'
                          ? 'Value Investing'
                          : data.tradingStyle === 'growth'
                          ? 'Growth'
                          : data.tradingStyle === 'dividend'
                          ? 'Dividend'
                          : data.tradingStyle === 'swing'
                          ? 'Swing Trading'
                          : 'Long Term'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Apa selanjutnya?</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Chat dengan AI untuk analisa saham</li>
                    <li>Tambah saham ke watchlist kamu</li>
                    <li>Explore stock screener untuk cari saham</li>
                    <li>Pelajari istilah-istilah saham dengan glossary otomatis</li>
                  </ul>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-danger-50 border border-danger-200 rounded-lg">
                <p className="text-sm text-danger-600">{error}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isSubmitting}
              >
                Kembali
              </Button>

              {currentStep < STEPS.length ? (
                <Button onClick={handleNext} disabled={isSubmitting}>
                  Lanjut
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Selesai & Mulai'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
