import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, Sparkles } from 'lucide-react'

export function CTASection() {
  return (
    <section className="relative py-24 sm:py-40 overflow-hidden">
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-secondary" />
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/80 via-transparent to-accent/80 mix-blend-multiply" />

      {/* Animated Blobs */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-accent/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-primary/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Geometric shapes */}
      <div className="absolute top-20 right-32 w-48 h-48 border-brutal border-background/30 rotate-12 hidden lg:block" />
      <div className="absolute bottom-32 left-24 w-56 h-56 bg-background/10 -rotate-6 hidden lg:block" />

      {/* Dots */}
      <div className="absolute top-1/3 left-1/4 w-6 h-6 bg-background/40 rounded-full hidden lg:block" />
      <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-background/50 rounded-full hidden lg:block" />

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-10 animate-bounce-in">
            <div className="inline-flex items-center gap-3 border-brutal bg-background px-6 py-3 shadow-brutal-lg">
              <Zap className="h-5 w-5 text-accent" />
              <span className="text-base font-bold uppercase tracking-wider text-foreground">
                100% Gratis untuk Memulai
              </span>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </div>

          <h2 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-background mb-10 animate-slide-up leading-[0.95]">
            Siap untuk Trading
            <br />
            <span className="relative inline-block mt-4">
              <span className="relative z-10">Lebih Cerdas?</span>
              <div className="absolute -bottom-3 left-0 right-0 h-6 bg-background/80 -rotate-1" />
            </span>
          </h2>

          <p className="text-2xl sm:text-3xl text-background/90 font-bold max-w-3xl mx-auto mb-16 animate-slide-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
            Mulai gratis sekarang. Tidak perlu kartu kredit.
            <br />
            <span className="inline-block mt-4 border-brutal bg-background text-foreground px-4 py-2 shadow-brutal">
              Langsung trading dengan AI!
            </span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 animate-slide-up mb-20" style={{ animationDelay: '0.2s' }}>
            <Button asChild size="lg" className="border-brutal shadow-brutal-lg hover-lift text-2xl px-12 py-10 h-auto bg-background text-foreground hover:bg-background/90 font-bold">
              <Link href="/auth/sign-up" className="flex items-center gap-3">
                Daftar Sekarang
                <ArrowRight className="h-7 w-7" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-brutal border-background shadow-brutal-lg hover-lift text-2xl px-12 py-10 h-auto bg-transparent text-background hover:bg-background/20 font-bold">
              <Link href="/auth/sign-in">
                Sudah Punya Akun
              </Link>
            </Button>
          </div>

          {/* Trust indicators - Enhanced */}
          <div className="flex flex-wrap items-center justify-center gap-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3 border-brutal bg-background/90 px-6 py-4 shadow-brutal hover-lift">
              <div className="w-3 h-3 bg-accent rounded-full animate-pulse" />
              <span className="font-bold text-lg text-foreground">100% Gratis</span>
            </div>
            <div className="flex items-center gap-3 border-brutal bg-background/90 px-6 py-4 shadow-brutal hover-lift">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              <span className="font-bold text-lg text-foreground">Data Real-time</span>
            </div>
            <div className="flex items-center gap-3 border-brutal bg-background/90 px-6 py-4 shadow-brutal hover-lift">
              <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
              <span className="font-bold text-lg text-foreground">AI Terpercaya</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wavy Divider Top */}
      <div className="absolute top-0 left-0 right-0 h-24">
        <svg className="absolute bottom-0 w-full h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,120 C300,40 600,40 900,120 L1200,120 L1200,0 L0,0 Z" className="fill-background" />
        </svg>
      </div>
    </section>
  )
}
