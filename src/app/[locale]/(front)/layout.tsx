import { Footer, Navigation } from '@/components/layout'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen">
      <Navigation />
      {children}
      <Footer />
    </main>
  )
}
