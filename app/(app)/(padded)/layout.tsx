export default function PaddedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 py-8 md:px-10 md:py-10 max-w-5xl">
      {children}
    </div>
  )
}
