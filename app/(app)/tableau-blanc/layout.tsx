export default function TableauBlancLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {children}
    </div>
  )
}
