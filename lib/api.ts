import axios from 'axios'
import type { Conversion } from '@/types/conversion'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

export const conversionApi = {
    /**
     * Upload PDF file and create conversion
     */
    uploadPDF: async (
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<Conversion> => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await api.post<Conversion>('/api/conversions/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    )
                    onProgress(progress)
                }
            },
        })

        return response.data
    },

    /**
     * Get conversion status by ID
     */
    getConversion: async (id: string): Promise<Conversion> => {
        const response = await api.get<Conversion>(`/api/conversions/${id}/`)
        return response.data
    },

    /**
     * Download converted DOCX file
     */
    downloadConversion: async (id: string, filename: string): Promise<void> => {
        const response = await api.get(`/api/conversions/${id}/download/`, {
            responseType: 'blob',
        })

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename.replace(/\.pdf$/i, '.docx'))
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
    },

    /**
     * List all conversions
     */
    listConversions: async (skip = 0, limit = 50): Promise<Conversion[]> => {
        const response = await api.get<Conversion[]>('/api/conversions/', {
            params: { skip, limit },
        })
        return response.data
    },

    /**
     * Delete conversion
     */
    deleteConversion: async (id: string): Promise<void> => {
        await api.delete(`/api/conversions/${id}/`)
    },
}
