export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-secondary">
      <div className="w-full max-w-2xl p-6">{children}</div>
    </div>
  )
}
