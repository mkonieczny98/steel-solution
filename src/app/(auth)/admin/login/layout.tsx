export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Login ma własny layout bez sidebara
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}
