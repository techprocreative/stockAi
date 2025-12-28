import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Asisten AI Cerdas untuk Trader Saham Indonesia
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Analisa saham dalam bahasa Indonesia yang mudah dipahami.
            Didukung AI untuk membantu keputusan trading Anda.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/auth/sign-up">
                Mulai Gratis
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#features">
                Lihat Fitur
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
