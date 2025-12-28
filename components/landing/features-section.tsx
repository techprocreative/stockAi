import { Brain, Zap, GraduationCap, Newspaper, Search } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI-First Analysis',
    description: 'Analisa bukan berupa tabel kaku, melainkan percakapan dan ringkasan naratif yang mudah dipahami.',
    color: 'primary',
    delay: '0s'
  },
  {
    icon: Zap,
    title: 'Dynamic Brain',
    description: 'Kemampuan mengganti model AI secara real-time dari admin panel tanpa coding ulang.',
    color: 'accent',
    delay: '0.1s'
  },
  {
    icon: GraduationCap,
    title: 'Newbie Friendly',
    description: 'Menjelaskan istilah saham (PER, PBV, Support/Resist) secara otomatis dengan analogi sederhana.',
    color: 'secondary',
    delay: '0.2s'
  },
  {
    icon: Newspaper,
    title: 'Morning Briefing',
    description: 'Ringkasan pasar harian otomatis sebelum market buka, langsung di dashboard Anda.',
    color: 'primary',
    delay: '0.3s'
  },
  {
    icon: Search,
    title: 'AI Screener',
    description: 'Cari saham dengan bahasa natural: "Saham murah dengan ROE tinggi" dan dapatkan hasil instant.',
    color: 'accent',
    delay: '0.4s'
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 sm:py-32 bg-foreground overflow-hidden">
      {/* Bold geometric backgrounds */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/10 -rotate-45 blur-2xl translate-x-1/4" />
      <div className="absolute bottom-20 left-0 w-[600px] h-[600px] bg-accent/10 rotate-12 blur-3xl -translate-x-1/3" />

      {/* Decorative elements */}
      <div className="absolute top-16 left-20 w-40 h-40 border-brutal border-accent/20 rotate-12 hidden lg:block" />
      <div className="absolute bottom-32 right-24 w-48 h-48 bg-secondary/10 -rotate-6 hidden lg:block" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header with asymmetric design */}
        <div className="max-w-4xl mb-24">
          <div className="inline-block border-brutal bg-secondary px-6 py-3 shadow-brutal mb-8">
            <span className="text-base font-bold uppercase tracking-wider">Fitur Unggulan</span>
          </div>
          <h2 className="text-5xl sm:text-7xl font-bold tracking-tight leading-tight text-background">
            Platform <span className="text-accent">Lengkap</span>
            <br />
            untuk Analisa Saham
          </h2>
          <p className="mt-8 text-2xl text-background/70 max-w-2xl font-medium">
            Semua yang Anda butuhkan untuk trading lebih cerdas dengan bantuan AI
          </p>
        </div>

        {/* Features grid with colored brutalist cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl">
          {features.map((feature, index) => {
            const Icon = feature.icon

            return (
              <div
                key={feature.title}
                className={`
                  group relative border-brutal shadow-brutal-lg hover-lift
                  animate-bounce-in
                  ${feature.color === 'primary' ? 'bg-primary border-primary' : ''}
                  ${feature.color === 'accent' ? 'bg-accent border-accent' : ''}
                  ${feature.color === 'secondary' ? 'bg-secondary border-secondary' : ''}
                  p-10
                `}
                style={{ animationDelay: feature.delay }}
              >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-foreground/20 rotate-45" />
                </div>

                {/* Icon */}
                <div className="relative z-10 mb-8">
                  <div className={`
                    inline-flex items-center justify-center w-20 h-20
                    border-brutal shadow-brutal
                    ${feature.color === 'primary' ? 'bg-background text-primary' : ''}
                    ${feature.color === 'accent' ? 'bg-foreground text-accent' : ''}
                    ${feature.color === 'secondary' ? 'bg-background text-secondary' : ''}
                    group-hover:rotate-12 transition-transform duration-300
                  `}>
                    <Icon className="h-10 w-10" />
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className={`
                    text-3xl font-bold mb-5 tracking-tight
                    ${feature.color === 'primary' ? 'text-primary-foreground' : 'text-foreground'}
                  `}>
                    {feature.title}
                  </h3>

                  <p className={`
                    leading-relaxed text-lg font-medium
                    ${feature.color === 'primary' ? 'text-primary-foreground/90' : 'text-foreground/90'}
                  `}>
                    {feature.description}
                  </p>

                  {/* Decorative arrow */}
                  <div className="mt-8 flex items-center gap-3">
                    <div className={`
                      h-1 w-24 group-hover:w-32 transition-all
                      ${feature.color === 'primary' ? 'bg-primary-foreground' : 'bg-foreground'}
                    `} />
                    <div className={`
                      w-0 h-0 border-t-8 border-b-8 border-l-12
                      ${feature.color === 'primary' ? 'border-l-primary-foreground border-t-transparent border-b-transparent' : 'border-l-foreground border-t-transparent border-b-transparent'}
                    `} style={{ borderLeftWidth: '12px' }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 text-center">
          <div className="inline-block border-brutal bg-accent px-10 py-6 shadow-brutal-lg hover-lift">
            <p className="text-2xl font-bold text-foreground">
              Dan masih banyak fitur lainnya yang akan datang! 🚀
            </p>
          </div>
        </div>
      </div>

      {/* Wavy Divider Top */}
      <div className="absolute top-0 left-0 right-0 h-24">
        <svg className="absolute bottom-0 w-full h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,120 C300,40 600,40 900,120 L1200,120 L1200,0 L0,0 Z" fill="hsl(24 20% 12%)" />
        </svg>
      </div>

      {/* Wavy Divider Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-background">
        <svg className="absolute top-0 w-full h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 C300,80 600,80 900,0 L1200,0 L1200,120 L0,120 Z" fill="hsl(24 20% 12%)" />
        </svg>
      </div>
    </section>
  )
}
