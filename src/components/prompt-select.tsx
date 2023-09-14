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

export function PromptSelect() {
  const [prompts, setPrompts] = useState<PromptsType[] | []>([])

  useEffect(() => {
    api.get('/prompt').then((response) => {
      setPrompts(response.data)
    })
  }, [])

  return (
    <Select>
      <SelectTrigger className="rounded">
        <SelectValue placeholder="Selecione um prompt..." />
      </SelectTrigger>

      <SelectContent>
        {prompts.map((prompt) => {
          return (
            <SelectItem key={prompt.id} value={prompt.template}>
              {prompt.title}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
