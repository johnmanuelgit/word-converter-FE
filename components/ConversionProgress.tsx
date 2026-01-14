'use client'

import { Loader2, CheckCircle2, XCircle, FileText, Clock, Download, AlertTriangle } from 'lucide-react'
import type { Conversion, ConversionStatus } from '@/types/conversion'
import { cn, formatFileSize } from '@/lib/utils'
import { conversionApi } from '@/lib/api'
import { useState } from 'react'
import { getErrorMessage } from './ErrorMessage'

interface ConversionProgressProps {
    uploadProgress: number
    isUploading: boolean
    conversion: Conversion | null
    onReset: () => void
}

const statusConfig: Record<
    ConversionStatus,
    { icon: typeof Loader2; label: string; color: string; bgColor: string; description: string }
> = {
    PENDING: {
        icon: Clock,
        label: 'Queued for processing',
        description: 'Your file is in the queue and will be processed shortly',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
    },
    PROCESSING: {
        icon: Loader2,
        label: 'Converting PDF to Word',
        description: 'Analyzing and converting your document...',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
    },
    COMPLETED: {
        icon: CheckCircle2,
        label: 'Conversion complete!',
        description: 'Your document is ready for download',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
    },
    FAILED: {
        icon: XCircle,
        label: 'Conversion failed',
        description: 'Unable to convert the file. Please try again with a different PDF.',
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
    },
}

// Helper function to get user-friendly error message from backend error
function getFriendlyErrorMessage(errorMessage: string | null): string {
    if (!errorMessage) return 'An unknown error occurred. Please try again.'

    const msg = errorMessage.toLowerCase()

    if (msg.includes('password') || msg.includes('encrypted')) {
        return 'This PDF is password-protected. Please remove the password and try again.'
    }
    if (msg.includes('corrupt') || msg.includes('invalid pdf')) {
        return 'The PDF file appears to be corrupted or invalid. Please try a different file.'
    }
    if (msg.includes('empty') || msg.includes('no content')) {
        return 'The PDF appears to be empty or has no content to convert.'
    }
    if (msg.includes('timeout') || msg.includes('took too long')) {
        return 'The conversion took too long. Please try again with a smaller file.'
    }
    if (msg.includes('OCR') || msg.includes('tesseract')) {
        return 'OCR processing failed. The scanned document may be too complex or low quality.'
    }
    if (msg.includes('memory') || msg.includes('resource')) {
        return 'The server ran out of resources. Please try again later or use a smaller file.'
    }

    return errorMessage
}

export function ConversionProgress({
    uploadProgress,
    isUploading,
    conversion,
    onReset,
}: ConversionProgressProps) {
    const [isDownloading, setIsDownloading] = useState(false)
    const [downloadError, setDownloadError] = useState<string>('')

    const handleDownload = async () => {
        if (conversion && conversion.status === 'COMPLETED') {
            try {
                setIsDownloading(true)
                setDownloadError('')
                await conversionApi.downloadConversion(conversion.id, conversion.original_file_name)
            } catch (error) {
                console.error('Download failed:', error)
                const errorInfo = getErrorMessage(error)
                setDownloadError(errorInfo.message)
            } finally {
                setIsDownloading(false)
            }
        }
    }

    if (isUploading) {
        return (
            <div className="space-y-4 animate-slide-up">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">Uploading your file...</span>
                            <span className="text-sm font-bold text-primary">{uploadProgress}%</span>
                        </div>
                    </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                    />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                    Please wait while we upload your document
                </p>
            </div>
        )
    }

    if (!conversion) return null

    const config = statusConfig[conversion.status]
    const Icon = config.icon
    const isAnimated = conversion.status === 'PROCESSING' || conversion.status === 'PENDING'
    const userFriendlyError = conversion.error_message
        ? getFriendlyErrorMessage(conversion.error_message)
        : ''

    return (
        <div className="space-y-5 md:space-y-6 animate-slide-up">
            {/* File Info Card */}
            <div className="glass rounded-xl p-4 md:p-5 border border-border/50">
                <div className="flex items-start gap-3 md:gap-4">
                    <div className="p-2.5 md:p-3 rounded-xl bg-primary/10 border border-primary/20 flex-shrink-0">
                        <FileText className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate text-sm md:text-base" title={conversion.original_file_name}>
                            {conversion.original_file_name}
                        </p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <p className="text-xs md:text-sm text-muted-foreground">
                                {formatFileSize(conversion.file_size)}
                            </p>
                            {conversion.is_scanned_pdf && conversion.status === 'COMPLETED' && (
                                <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-xs font-medium border border-accent/20">
                                    OCR Applied
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Card */}
            <div className={cn('rounded-xl p-4 md:p-5 border', config.bgColor)}>
                <div className="flex items-center gap-3">
                    <Icon className={cn('w-5 h-5 flex-shrink-0', config.color, isAnimated && 'animate-spin')} />
                    <div className="flex-1 min-w-0">
                        <span className={cn('text-sm md:text-base font-semibold block', config.color)}>
                            {config.label}
                        </span>
                        <span className="text-xs md:text-sm text-muted-foreground block mt-0.5">
                            {config.description}
                        </span>
                    </div>
                </div>

                {conversion.status === 'FAILED' && userFriendlyError && (
                    <div className="mt-4 p-3 md:p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-destructive mb-1">What went wrong?</p>
                                <p className="text-xs md:text-sm text-destructive/90 leading-relaxed">
                                    {userFriendlyError}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {(conversion.status === 'PENDING' || conversion.status === 'PROCESSING') && (
                    <div className="mt-4 space-y-2">
                        <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    'h-full bg-gradient-to-r transition-all duration-500',
                                    conversion.status === 'PROCESSING'
                                        ? 'from-primary to-accent w-2/3 animate-pulse'
                                        : 'from-yellow-500 to-yellow-600 w-1/3'
                                )}
                            />
                        </div>
                        {conversion.status === 'PROCESSING' && (
                            <p className="text-xs text-muted-foreground text-center">
                                {conversion.is_scanned_pdf ? 'Applying OCR technology...' : 'Processing your document...'}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Download Error Display */}
            {downloadError && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                    <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-destructive flex-1">{downloadError}</p>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 flex-col sm:flex-row">
                {conversion.status === 'COMPLETED' && (
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="flex-1 px-5 md:px-6 py-2.5 md:py-3 rounded-xl bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/50 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Downloading...
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                Download DOCX
                            </>
                        )}
                    </button>
                )}
                <button
                    onClick={onReset}
                    className="px-5 md:px-6 py-2.5 md:py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                    Convert Another File
                </button>
            </div>
        </div>
    )
}
