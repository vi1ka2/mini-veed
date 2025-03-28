import type React from "react"
import "@mantine/core/styles.css"
import "./globals.css"
import { MantineProvider, ColorSchemeScript } from "@mantine/core"

export const metadata = {
  title: "VEED.io Clone",
  description: "A clone of VEED.io built with Next.js and Mantine UI",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>{children}</MantineProvider>
      </body>
    </html>
  )
}



import './globals.css'