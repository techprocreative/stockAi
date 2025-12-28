import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="bg-primary-600 py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Siap untuk Trading Lebih Cerdas?
        </h2>
        <p className="mt-4 text-lg text-primary-50">
          Mulai gratis sekarang. Tidak perlu kartu kredit.
        </p>
        <div className="mt-8">
          <Button asChild size="lg" variant="secondary">
            <Link href="/auth/sign-up">
              Daftar Sekarang
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
