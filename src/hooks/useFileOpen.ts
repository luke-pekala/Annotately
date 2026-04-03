import { useRef, useCallback } from 'react'
import { useStore } from '@/store'
import { readFileAsDataURL, isPDFFile, isImageFile } from '@/utils'

export function useFileOpen() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addDocument } = useStore()

  const openFile = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFile = useCallback(
    async (file: File) => {
      if (!isPDFFile(file) && !isImageFile(file)) return
      try {
        const url = await readFileAsDataURL(file)
        addDocument({
          name: file.name,
          type: isPDFFile(file) ? 'pdf' : 'image',
          url,
          pageCount: isPDFFile(file) ? 0 : 1,
        })
      } catch (err) {
        console.error('Failed to open file:', err)
      }
    },
    [addDocument]
  )

  const handleInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) await handleFile(file)
      e.target.value = ''
    },
    [handleFile]
  )

  return { fileInputRef, openFile, handleFile, handleInputChange }
}
