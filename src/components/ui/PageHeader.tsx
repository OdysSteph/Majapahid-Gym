export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="px-5 pb-4 pt-8" style={{ paddingTop: 'max(2rem, env(safe-area-inset-top))' }}>
      <h1 className="h-display text-4xl uppercase">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-steel">{subtitle}</p>}
    </header>
  )
}
