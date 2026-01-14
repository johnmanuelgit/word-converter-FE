'use client'

import { AlertCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ErrorSeverity = 'error' | 'warning' | 'info'

interface ErrorMessageProps {
    message: string
    severity?: ErrorSeverity
    title?: string
    onDismiss?: () => void
    className?: string
}

const severityConfig = {
    error: {
        icon: XCircle,
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        textColor: 'text-red-500',
        titleColor: 'text-red-400',
    },
    warning: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        textColor: 'text-yellow-500',
        titleColor: 'text-yellow-400',
    },
    info: {
        icon: Info,
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        textColor: 'text-blue-500',
        titleColor: 'text-blue-400',
    },
}

export function ErrorMessage({
    message,
    severity = 'error',
    title,
    onDismiss,
    className,
}: ErrorMessageProps) {
    const config = severityConfig[severity]
    const Icon = config.icon

    return (
        <div
            className={cn(
                'rounded-xl p-4 border backdrop-blur-sm animate-slide-up',
                config.bgColor,
                config.borderColor,
                className
            )}
            role="alert"
        >
            <div className="flex items-start gap-3">
                <div className={cn('mt-0.5', config.textColor)}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    {title && (
                        <h3 className={cn('font-semibold mb-1', config.titleColor)}>
                            {title}
                        </h3>
                    )}
                    <p className={cn('text-sm leading-relaxed', config.textColor)}>
                        {message}
                    </p>
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className={cn(
                            'p-1 rounded-lg hover:bg-white/10 transition-colors',
                            config.textColor
                        )}
                        aria-label="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    )
}

// Predefined error messages for common scenarios
export const ERROR_MESSAGES = {
    INVALID_FILE_TYPE: {
        title: 'Invalid File Type',
        message: 'Please upload a PDF file only. Other file types are not supported.',
        severity: 'error' as ErrorSeverity,
    },
    FILE_TOO_LARGE: {
        title: 'File Too Large',
        message: 'The file size exceeds the maximum limit. Please upload a smaller PDF file.',
        severity: 'error' as ErrorSeverity,
    },
    UPLOAD_FAILED: {
        title: 'Upload Failed',
        message: 'Failed to upload the file. Please check your internet connection and try again.',
        severity: 'error' as ErrorSeverity,
    },
    CONVERSION_FAILED: {
        title: 'Conversion Failed',
        message: 'Unable to convert the PDF. The file might be corrupted or password-protected.',
        severity: 'error' as ErrorSeverity,
    },
    DOWNLOAD_FAILED: {
        title: 'Download Failed',
        message: 'Failed to download the converted file. Please try again.',
        severity: 'error' as ErrorSeverity,
    },
    NETWORK_ERROR: {
        title: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
        severity: 'error' as ErrorSeverity,
    },
    SERVER_ERROR: {
        title: 'Server Error',
        message: 'The server encountered an error. Please try again later.',
        severity: 'error' as ErrorSeverity,
    },
    TIMEOUT_ERROR: {
        title: 'Request Timeout',
        message: 'The request took too long to complete. Please try again.',
        severity: 'error' as ErrorSeverity,
    },
    INVALID_PDF: {
        title: 'Invalid PDF',
        message: 'The PDF file appears to be corrupted or invalid. Please try a different file.',
        severity: 'error' as ErrorSeverity,
    },
    PASSWORD_PROTECTED: {
        title: 'Password Protected PDF',
        message: 'This PDF is password-protected. Please remove the password and try again.',
        severity: 'warning' as ErrorSeverity,
    },
    EMPTY_PDF: {
        title: 'Empty PDF',
        message: 'The PDF file appears to be empty or has no content to convert.',
        severity: 'warning' as ErrorSeverity,
    },
    PROCESSING_TIMEOUT: {
        title: 'Processing Timeout',
        message: 'The conversion is taking longer than expected. Please try again with a smaller file.',
        severity: 'error' as ErrorSeverity,
    },
}

// Helper function to get user-friendly error message
export function getErrorMessage(error: any): { title: string; message: string; severity: ErrorSeverity } {
    // Handle Axios errors
    if (error.response) {
        const status = error.response.status
        const detail = error.response.data?.detail || error.response.data?.message

        if (status === 400) {
            if (detail?.includes('file type')) return ERROR_MESSAGES.INVALID_FILE_TYPE
            if (detail?.includes('size')) return ERROR_MESSAGES.FILE_TOO_LARGE
            if (detail?.includes('password')) return ERROR_MESSAGES.PASSWORD_PROTECTED
            return { ...ERROR_MESSAGES.UPLOAD_FAILED, message: detail || ERROR_MESSAGES.UPLOAD_FAILED.message }
        }

        if (status === 404) {
            return {
                title: 'Not Found',
                message: 'The requested resource was not found. Please try uploading the file again.',
                severity: 'error',
            }
        }

        if (status === 413) return ERROR_MESSAGES.FILE_TOO_LARGE

        if (status === 500) {
            return { ...ERROR_MESSAGES.SERVER_ERROR, message: detail || ERROR_MESSAGES.SERVER_ERROR.message }
        }

        if (status === 503) {
            return {
                title: 'Service Unavailable',
                message: 'The service is temporarily unavailable. Please try again in a few minutes.',
                severity: 'error',
            }
        }
    }

    // Handle network errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return ERROR_MESSAGES.TIMEOUT_ERROR
    }

    if (error.code === 'ERR_NETWORK' || !error.response) {
        return ERROR_MESSAGES.NETWORK_ERROR
    }

    // Handle specific error messages
    const errorMessage = error.message?.toLowerCase() || ''
    if (errorMessage.includes('file type')) return ERROR_MESSAGES.INVALID_FILE_TYPE
    if (errorMessage.includes('too large') || errorMessage.includes('size')) return ERROR_MESSAGES.FILE_TOO_LARGE
    if (errorMessage.includes('corrupt')) return ERROR_MESSAGES.INVALID_PDF
    if (errorMessage.includes('password')) return ERROR_MESSAGES.PASSWORD_PROTECTED
    if (errorMessage.includes('empty')) return ERROR_MESSAGES.EMPTY_PDF

    // Default error
    return {
        title: 'An Error Occurred',
        message: error.message || 'Something went wrong. Please try again.',
        severity: 'error',
    }
}
