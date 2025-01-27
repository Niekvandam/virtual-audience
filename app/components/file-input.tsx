"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ImagePreview from "./image-preview"

export default function FileInput({
  onSubmit,
  isLoading,
  disabled,
}: {
  onSubmit: (files: FileList) => void
  isLoading: boolean
  disabled: boolean
}) {
  const [files, setFiles] = useState<FileList | null>(null)
  const [previews, setPreviews] = useState<string[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      setFiles(selectedFiles)
      const newPreviews = Array.from(selectedFiles).map((file) => URL.createObjectURL(file))
      setPreviews((prev) => [...prev, ...newPreviews])
    }
  }

  const handlePaste = (e: ClipboardEvent) => {
    const clipboardFiles = e.clipboardData?.files
    if (clipboardFiles && clipboardFiles.length > 0) {
      setFiles(clipboardFiles)
      const newPreviews = Array.from(clipboardFiles).map((file) => URL.createObjectURL(file))
      setPreviews((prev) => [...prev, ...newPreviews])
    }
  }

  useEffect(() => {
    window.addEventListener("paste", handlePaste)
    return () => {
      window.removeEventListener("paste", handlePaste)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (files) {
      onSubmit(files)
    }
  }

  const removePreview = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index))
    if (files) {
      const newFiles = Array.from(files).filter((_, i) => i !== index)
      setFiles(new FileList(newFiles))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
            Upload Screenshots
          </Label>
          <div className="mt-1 flex items-center">
            <Input
              id="file-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
          </div>
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={!files || isLoading || disabled} className="w-full">
            {isLoading ? "Analyzing..." : "Analyze Screenshots"}
          </Button>
        </div>
      </div>
      {previews.length > 0 && <ImagePreview previews={previews} onRemove={removePreview} />}
    </form>
  )
}

