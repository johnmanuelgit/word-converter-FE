'use client'

import { useCallback, useState } from 'react'
import { Upload, FileText, X, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Conversion } from '@/types/conversion'

interface FileUploadProps {
    onFileSelect: (file: File) => void
    isUploading: boolean
    conversion: Conversion | null
}

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const RECOMMENDED_SIZE = 50 * 1024 * 1024 // 50MB

export function FileUpload({ onFileSelect, isUploading, conversion }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [validationError, setValidationError] = useState<string>('')

    const validateFile = (file: File): { valid: boolean; error?: string } => {
        // Check file type
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            return {
                valid: false,
                error: 'Invalid file type. Please upload a PDF file only.',
            }
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return {
                valid: false,
                error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
            }
        }

        // Check for empty file
        if (file.size === 0) {
            return {
                valid: false,
                error: 'The selected file is empty. Please choose a valid PDF file.',
            }
        }

        return { valid: true }
    }

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setIsDragging(false)
            setValidationError('')

            const files = Array.from(e.dataTransfer.files)
            const pdfFile = files.find((file) =>
                file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
            )

            if (!pdfFile) {
                setValidationError('Please drop a PDF file. Only PDF files are supported.')
                return
            }

            const validation = validateFile(pdfFile)
            if (!validation.valid) {
                setValidationError(validation.error || 'Invalid file')
                return
            }

            setSelectedFile(pdfFile)
            onFileSelect(pdfFile)
        },
        [onFileSelect]
    )

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setValidationError('')
            const files = e.target.files

            if (files && files[0]) {
                const validation = validateFile(files[0])

                if (!validation.valid) {
                    setValidationError(validation.error || 'Invalid file')
                    e.target.value = '' // Reset input
                    return
                }

                setSelectedFile(files[0])
                onFileSelect(files[0])
            }
        },
        [onFileSelect]
    )

    const handleRemoveFile = useCallback(() => {
        setSelectedFile(null)
        setValidationError('')
    }, [])

    // Don't show upload zone if conversion is in progress or completed
    if (conversion || isUploading) {
        return null
    }

    const isFileLarge = selectedFile && selectedFile.size > RECOMMENDED_SIZE

    return (
        <div className="space-y-4">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    'relative rounded-xl md:rounded-2xl border-2 border-dashed transition-all duration-300',
                    'hover:border-primary/50 hover:bg-primary/5 cursor-pointer',
                    isDragging && 'border-primary bg-primary/10 scale-[1.01]',
                    !isDragging && 'border-border',
                    validationError && 'border-destructive/50'
                )}
            >
                <div className="p-8 md:p-12">
                    {!selectedFile ? (
                        <div className="flex flex-col items-center gap-5 md:gap-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                                <div className="relative p-5 md:p-6 rounded-2xl bg-primary/10 border border-primary/20">
                                    <Upload className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                                </div>
                            </div>

                            <div className="text-center space-y-2 max-w-md">
                                <h3 className="text-xl md:text-2xl font-bold gradient-text">
                                    Drop your PDF here
                                </h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Drag and drop your PDF file, or click the button below to browse.
                                </p>
                                <p className="text-xs text-muted-foreground/80">
                                    Supported: PDF files up to 100MB
                                </p>
                            </div>

                            <label className="relative cursor-pointer group">
                                <input
                                    type="file"
                                    className="sr-only"
                                    accept=".pdf,application/pdf"
                                    onChange={handleFileInput}
                                    disabled={isUploading}
                                    aria-label="Choose PDF file"
                                />
                                <div className="px-6 md:px-8 py-2.5 md:py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/50">
                                    Choose File
                                </div>
                            </label>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                                        <FileText className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground truncate" title={selectedFile.name}>
                                            {selectedFile.name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-sm text-muted-foreground">
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRemoveFile}
                                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 ml-2"
                                    aria-label="Remove file"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {isFileLarge && (
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                    <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-yellow-500">
                                        Large file detected. Conversion may take longer for files over 50MB.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Validation Error Display */}
            {validationError && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 animate-slide-up">
                    <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm text-destructive font-medium">
                            {validationError}
                        </p>
                    </div>
                    <button
                        onClick={() => setValidationError('')}
                        className="p-1 rounded-lg hover:bg-destructive/20 text-destructive transition-colors flex-shrink-0"
                        aria-label="Dismiss error"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    )
}
