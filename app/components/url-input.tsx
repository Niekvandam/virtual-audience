// Create a new UrlInput component at components/url-input.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function UrlInput({ onSubmit, isLoading, disabled }: {
  onSubmit: (urls: string[]) => Promise<void>
  isLoading: boolean
  disabled: boolean
}) {
  const [inputValue, setInputValue] = useState('')
  const [urls, setUrls] = useState<string[]>([])

  const addUrl = () => {
    if (inputValue.trim() && !urls.includes(inputValue.trim())) {
      setUrls(prev => [...prev, inputValue.trim()])
      setInputValue('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="url"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter URL"
          className="flex-1 p-2 border rounded"
          disabled={disabled || isLoading}
        />
        <Button onClick={addUrl} disabled={disabled || isLoading}>Add URL</Button>
      </div>
      <div className="space-y-2">
        {urls.map((url) => (
          <div key={url} className="flex items-center justify-between p-2 bg-gray-100 rounded">
            <span>{url}</span>
            <button
              onClick={() => setUrls(prev => prev.filter(u => u !== url))}
              className="text-red-500 hover:text-red-700"
              disabled={isLoading}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <Button
        onClick={() => onSubmit(urls)}
        disabled={disabled || isLoading || urls.length === 0}
      >
        {isLoading ? 'Processing...' : 'Analyze URLs'}
      </Button>
    </div>
  )
}
