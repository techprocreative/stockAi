import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TrendingUp, Sparkles } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-40 bg-background">
      {/* Bold Geometric Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rotate-45 blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/15 -rotate-12 blur-2xl translate-y-1/2 -translate-x-1/4" />

      {/* Large Brutalist Shapes */}
      <div className="absolute top-32 left-16 w-48 h-48 border-brutal border-primary/30 rotate-12 hidden lg:block" />
      <div className="absolute bottom-40 right-20 w-64 h-64 bg-secondary/20 -rotate-6 hidden lg:block" />
      <div className="absolute top-48 right-32 w-32 h-32 bg-accent/40 rotate-45 hidden lg:block" />

      {/* Small accent dots */}
      <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-primary rounded-full hidden lg:block" />
      <div className="absolute top-2/3 right-1/4 w-3 h-3 bg-accent rounded-full hidden lg:block" />
      <div className="absolute bottom-1/3 left-1/4 w-5 h-5 bg-secondary rounded-full hidden lg:block" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-5xl">
          {/* Badge */}
          <div className="flex justify-center mb-10 animate-bounce-in">
            <div className="inline-flex items-center gap-3 border-brutal bg-accent px-6 py-3 shadow-brutal">
              <Sparkles className="h-5 w-5" />
              <span className="text-base font-bold uppercase tracking-wider">
                AI-Powered Stock Analysis
              </span>
            </div>
          </div>

          {/* Heading with asymmetric layout */}
          <div className="text-center space-y-8 animate-slide-up">
            <h1 className="text-6xl sm:text-8xl lg:text-9xl font-bold tracking-tight leading-[0.9]">
              <span className="block text-gradient">Asisten AI</span>
              <span className="block mt-3">untuk Trader</span>
              <span className="block mt-3 relative inline-block">
                <span className="relative z-10">Indonesia</span>
                <div className="absolute -bottom-3 left-0 right-0 h-5 bg-secondary/50 -rotate-1" />
              </span>
            </h1>

            <p className="mt-10 text-2xl sm:text-3xl leading-relaxed text-foreground/80 max-w-3xl mx-auto font-medium">
              Analisa saham dalam <span className="bg-primary text-primary-foreground px-3 py-2 font-bold shadow-brutal-sm">Bahasa Indonesia</span> yang mudah dipahami.
              Powered by AI.
            </p>
          </div>

          {/* CTA Buttons with brutalist styling */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button asChild size="lg" className="border-brutal shadow-brutal-lg hover-lift text-xl px-10 py-8 h-auto bg-primary hover:bg-primary/90">
              <Link href="/auth/sign-up" className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6" />
                Mulai Trading Sekarang
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-brutal shadow-brutal hover-lift text-xl px-10 py-8 h-auto bg-card hover:bg-muted">
              <Link href="#features">
                Eksplorasi Fitur →
              </Link>
            </Button>
          </div>

          {/* Stats row - More dramatic */}
          <div className="mt-24 grid grid-cols-3 gap-8 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="group text-center border-brutal bg-card p-8 shadow-brutal hover-lift">
              <div className="text-5xl sm:text-6xl font-bold text-primary mb-3">24/7</div>
              <div className="text-base sm:text-lg font-bold text-muted-foreground uppercase tracking-wider">AI Available</div>
              <div className="mt-4 h-1 w-20 bg-primary mx-auto group-hover:w-full transition-all" />
            </div>
            <div className="group text-center border-brutal bg-card p-8 shadow-brutal hover-lift">
              <div className="text-5xl sm:text-6xl font-bold text-secondary mb-3">IDX</div>
              <div className="text-base sm:text-lg font-bold text-muted-foreground uppercase tracking-wider">Real Data</div>
              <div className="mt-4 h-1 w-20 bg-secondary mx-auto group-hover:w-full transition-all" />
            </div>
            <div className="group text-center border-brutal bg-card p-8 shadow-brutal hover-lift">
              <div className="text-5xl sm:text-6xl font-bold text-accent mb-3">Free</div>
              <div className="text-base sm:text-lg font-bold text-muted-foreground uppercase tracking-wider">Start Now</div>
              <div className="mt-4 h-1 w-20 bg-accent mx-auto group-hover:w-full transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* Wavy Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-foreground">
        <svg className="absolute top-0 w-full h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 C300,80 600,80 900,0 L1200,0 L1200,120 L0,120 Z" fill="hsl(40 35% 92%)" />
        </svg>
      </div>
    </section>
  )
}
