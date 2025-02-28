import './globals.css'

export const metadata = {
  title: 'Sudoku Game',
  description: 'A simple Sudoku game built with Next.js',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
