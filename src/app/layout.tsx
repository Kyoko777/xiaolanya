import './globals.css'

export const metadata = {
  title: 'Dental Manager',
  description: 'Minimal dental record management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="h-full overflow-hidden antialiased">{children}</body>
    </html>
  )
}
