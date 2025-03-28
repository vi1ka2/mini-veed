"use client"

import type React from "react"

import { useCallback } from "react"

interface DropzoneOptions {
  onDrop: (acceptedFiles: File[]) => void
}

export function useDropzone(options: DropzoneOptions) {
  const { onDrop } = options

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files)
        onDrop(files)
      }
    },
    [onDrop],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const getRootProps = () => ({
    onDrop: handleDrop,
    onDragOver: handleDragOver,
    onDragEnter: handleDragEnter,
  })

  const getInputProps = () => ({
    type: "file",
    style: { display: "none" },
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files)
        onDrop(files)
      }
    },
  })

  return {
    getRootProps,
    getInputProps,
    isDragActive: false,
  }
}

