import { Brain, Zap, GraduationCap, Newspaper, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: Brain,
    title: 'AI-First Analysis',
    description: 'Analisa bukan berupa tabel kaku, melainkan percakapan dan ringkasan naratif yang mudah dipahami.',
  },
  {
    icon: Zap,
    title: 'Dynamic Brain',
    description: 'Kemampuan mengganti model AI secara real-time dari admin panel tanpa coding ulang.',
  },
  {
    icon: GraduationCap,
    title: 'Newbie Friendly',
    description: 'Menjelaskan istilah saham (PER, PBV, Support/Resist) secara otomatis dengan analogi sederhana.',
  },
  {
    icon: Newspaper,
    title: 'Morning Briefing',
    description: 'Ringkasan pasar harian otomatis sebelum market buka, langsung di dashboard Anda.',
  },
  {
    icon: Search,
    title: 'AI Screener',
    description: 'Cari saham dengan bahasa natural: "Saham murah dengan ROE tinggi" dan dapatkan hasil instant.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Fitur Unggulan IndoStock AI
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Platform lengkap untuk analisa saham dengan bantuan AI
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <Icon className="h-10 w-10 text-primary-500" />
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
