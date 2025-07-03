"use client"

import { useState } from "react"
import { Check, ChevronDown, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DateOption {
  id: string
  date: string
  displayName: string
}

interface DateSelectorProps {
  dates: DateOption[]
  selectedDate: DateOption | null
  onSelectDate: (date: DateOption) => void
}

export default function DateSelector({ dates, selectedDate, onSelectDate }: DateSelectorProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between md:w-[350px]">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            {selectedDate ? selectedDate.displayName : "Seleccionar fecha..."}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 md:w-[350px]">
        <Command>
          <CommandInput placeholder="Buscar fecha..." />
          <CommandList>
            <CommandEmpty>No se encontraron fechas.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {dates.map((date) => (
                <CommandItem
                  key={date.id}
                  value={date.displayName}
                  onSelect={() => {
                    onSelectDate(date)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", selectedDate?.id === date.id ? "opacity-100" : "opacity-0")} />
                  {date.displayName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
