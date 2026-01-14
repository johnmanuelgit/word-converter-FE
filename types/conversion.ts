export type ConversionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export type ConversionType = 'PDF_TO_WORD'

export interface Conversion {
    id: string
    original_file_name: string
    file_size: number
    status: ConversionStatus
    conversion_type: ConversionType
    is_scanned_pdf: boolean
    error_message: string | null
    created_at: string
    completed_at: string | null
}
