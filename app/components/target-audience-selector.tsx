"use client"
import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "cmdk";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { getAllAudiences, type AudienceInfo } from "@/utils/audienceData"

const allAudiences = getAllAudiences()

type TargetAudienceSelectorProps = {
  selectedAudiences: AudienceInfo[];
  onSelect: (audiences: AudienceInfo[]) => void;
};

const TargetAudienceSelector = ({ selectedAudiences, onSelect }: TargetAudienceSelectorProps) => {
  const [open, setOpen] = useState(false)

  const handleSelect = (audienceName: string) => {
    const audience = allAudiences[audienceName]
    if (audience) {
      const newSelection = selectedAudiences.some((a) => a.name === audienceName)
        ? selectedAudiences.filter((item) => item.name !== audienceName)
        : [...selectedAudiences, audience].slice(0, 10)
      onSelect(newSelection)
    }
  }


  return (
    <div className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            Select target audiences
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search audiences..." />
            <CommandList>
              <CommandEmpty>No audience found.</CommandEmpty>
              <CommandGroup>
                {Object.values(allAudiences).map((audience) => (
                  <CommandItem
                    key={audience.name}
                    value={audience.description}
                    onSelect={() => handleSelect(audience.name)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedAudiences.some((selected) => selected.name === audience.name)
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {audience.description} {/* Changed from audience.name */}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="flex flex-wrap gap-2">
        {selectedAudiences.map((audience) => (
          <Badge key={audience.name} variant="secondary">
            {audience.name}
          </Badge>
        ))}
      </div>
    </div>
  )
}

export default TargetAudienceSelector;

