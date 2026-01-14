import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'PDF to Word Converter | Free Online PDF to DOCX',
    description: 'Convert PDF documents to editable Word files instantly. Supports text-based and scanned PDFs with OCR technology. Fast, secure, and free.',
    keywords: ['PDF to Word', 'PDF to DOCX', 'PDF converter', 'OCR', 'document conversion'],
    authors: [{ name: 'PDF Converter Team' }],
    openGraph: {
        title: 'PDF to Word Converter',
        description: 'Transform your PDFs into editable Word documents with AI-powered OCR',
        type: 'website',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
            <body className={inter.className}>{children}</body>
        </html>
    )
}
