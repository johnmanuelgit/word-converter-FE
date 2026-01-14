'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileUpload } from '@/components/FileUpload'
import { ConversionProgress } from '@/components/ConversionProgress'
import { ErrorMessage, getErrorMessage } from '@/components/ErrorMessage'
import { conversionApi } from '@/lib/api'
import type { Conversion } from '@/types/conversion'
import { FileType, Sparkles, Zap } from 'lucide-react'

export default function Home() {
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const [conversion, setConversion] = useState<Conversion | null>(null)
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
    const [error, setError] = useState<{ title: string; message: string; severity: 'error' | 'warning' | 'info' } | null>(null)

    const pollConversionStatus = useCallback(async (conversionId: string) => {
        try {
            const updatedConversion = await conversionApi.getConversion(conversionId)
            setConversion(updatedConversion)

            // Stop polling if conversion is complete or failed
            if (updatedConversion.status === 'COMPLETED' || updatedConversion.status === 'FAILED') {
                if (pollingInterval) {
                    clearInterval(pollingInterval)
                    setPollingInterval(null)
                }
            }
        } catch (error) {
            console.error('Error polling conversion status:', error)
            const errorInfo = getErrorMessage(error)
            setError(errorInfo)

            // Stop polling if there's an error
            if (pollingInterval) {
                clearInterval(pollingInterval)
                setPollingInterval(null)
            }
        }
    }, [pollingInterval])

    const startPolling = useCallback((conversionId: string) => {
        const interval = setInterval(() => {
            pollConversionStatus(conversionId)
        }, 2000) // Poll every 2 seconds

        setPollingInterval(interval)
    }, [pollConversionStatus])

    const handleFileSelect = async (file: File) => {
        try {
            setError(null)
            setIsUploading(true)
            setUploadProgress(0)

            const newConversion = await conversionApi.uploadPDF(file, (progress) => {
                setUploadProgress(progress)
            })

            setConversion(newConversion)
            setIsUploading(false)

            // Start polling for status updates
            startPolling(newConversion.id)
        } catch (error: any) {
            console.error('Upload failed:', error)
            setIsUploading(false)
            const errorInfo = getErrorMessage(error)
            setError(errorInfo)
        }
    }

    const handleReset = () => {
        if (pollingInterval) {
            clearInterval(pollingInterval)
            setPollingInterval(null)
        }
        setConversion(null)
        setUploadProgress(0)
        setIsUploading(false)
        setError(null)
    }

    const handleDismissError = () => {
        setError(null)
    }

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval)
            }
        }
    }, [pollingInterval])

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative">
                <div className="container mx-auto px-4 py-8 md:py-12">
                    {/* Header - Optimized for laptop screens */}
                    <div className="text-center mb-8 md:mb-12 space-y-4 max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                Powered by AI & OCR Technology
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text animate-slide-up">
                            PDF to Word Converter
                        </h1>

                        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in leading-relaxed">
                            Transform your PDF documents into editable Word files instantly.
                            Supports both text-based and scanned PDFs with advanced OCR technology.
                        </p>
                    </div>

                    {/* Main Content Card - Optimized for laptop (max-width) */}
                    <div className="max-w-4xl mx-auto">
                        <div className="glass rounded-2xl md:rounded-3xl p-6 md:p-10 border border-border/50 backdrop-blur-xl shadow-2xl animate-slide-up">
                            {/* Error Message Display */}
                            {error && (
                                <div className="mb-6">
                                    <ErrorMessage
                                        title={error.title}
                                        message={error.message}
                                        severity={error.severity}
                                        onDismiss={handleDismissError}
                                    />
                                </div>
                            )}

                            <FileUpload
                                onFileSelect={handleFileSelect}
                                isUploading={isUploading}
                                conversion={conversion}
                            />

                            <ConversionProgress
                                uploadProgress={uploadProgress}
                                isUploading={isUploading}
                                conversion={conversion}
                                onReset={handleReset}
                            />
                        </div>
                    </div>

                    {/* Features - Laptop optimized grid */}
                    <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto px-4">
                        {[
                            {
                                icon: FileType,
                                title: 'Smart Detection',
                                description: 'Automatically detects text-based vs scanned PDFs for optimal conversion',
                            },
                            {
                                icon: Sparkles,
                                title: 'OCR Technology',
                                description: 'Extracts text from scanned documents with high accuracy using Tesseract',
                            },
                            {
                                icon: Zap,
                                title: 'Fast Processing',
                                description: 'Convert your PDFs in seconds with asynchronous background processing',
                            },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="glass rounded-xl md:rounded-2xl p-5 md:p-6 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] animate-slide-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 w-fit mb-4">
                                    <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                                </div>
                                <h3 className="text-base md:text-lg font-semibold mb-2">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Help Section */}
                    <div className="mt-12 max-w-4xl mx-auto text-center">
                        <div className="glass rounded-xl p-6 border border-border/50">
                            <h3 className="text-lg font-semibold mb-3">How It Works</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                                <div>
                                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-2 font-bold">1</div>
                                    <p>Upload your PDF file</p>
                                </div>
                                <div>
                                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-2 font-bold">2</div>
                                    <p>Wait for automatic conversion</p>
                                </div>
                                <div>
                                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-2 font-bold">3</div>
                                    <p>Download your DOCX file</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
