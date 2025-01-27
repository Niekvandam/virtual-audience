import Image from "next/image"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

type ImagePreviewProps = {
  previews: string[]
  onRemove: (index: number) => void
}

export default function ImagePreview({ previews, onRemove }: ImagePreviewProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
      {previews.map((preview, index) => (
        <div key={index} className="relative group">
          <div className="aspect-square rounded-lg overflow-hidden">
            <Image
              src={preview || "/placeholder.svg"}
              alt={`Uploaded screenshot ${index + 1}`}
              fill
              className="object-cover transition-transform group-hover:scale-110"
            />
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemove(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}

