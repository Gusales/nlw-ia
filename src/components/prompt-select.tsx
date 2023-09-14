import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { api } from '@/lib/axios'

interface PromptsType {
  id: string
  title: string
  template: string
}

interface PromptSelectProps {
  onPromptSelect: (template: string) => void
}

export function PromptSelect({ onPromptSelect }: PromptSelectProps) {
  const [prompts, setPrompts] = useState<PromptsType[] | []>([])

  useEffect(() => {
    api.get('/prompt').then((response) => {
      setPrompts(response.data)
    })
  }, [])

  function handlePromptSelected(promptId: string) {
    const selectedPrompt = prompts.find((prompt) => prompt.id === promptId)

    if (!selectedPrompt) {
      return
    }

    onPromptSelect(selectedPrompt.template)
  }

  return (
    <Select onValueChange={handlePromptSelected}>
      <SelectTrigger className="rounded">
        <SelectValue placeholder="Selecione um prompt..." />
      </SelectTrigger>

      <SelectContent>
        {prompts.map((prompt) => {
          return (
            <SelectItem key={prompt.id} value={prompt.id}>
              {prompt.title}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
