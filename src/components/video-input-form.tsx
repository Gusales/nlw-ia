import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { FileVideo, Upload } from 'lucide-react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react'
import { loadFFmpeg } from '@/lib/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

export function VideoInputForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const promptInputRef = useRef<HTMLTextAreaElement>(null)

  function handleFileSelector(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget

    if (!files) {
      return
    }

    const selectedFile = files[0]

    setVideoFile(selectedFile)
  }

  async function convertVideoToAudio(video: File) {
    console.log('Convert Started.')

    const ffmpeg = await loadFFmpeg()

    await ffmpeg.writeFile('input.mp4', await fetchFile(video))

    // ffmpeg.on('log', log => console.log(log))
    ffmpeg.on('progress', (progress) => {
      console.log('Convert progress: ' + Math.round(progress.progress * 100))
    })

    await ffmpeg.exec([
      '-i',
      'input.mp4',
      '-map',
      '0:a',
      '-b:a',
      '20k',
      '-acodec',
      'libmp3lame',
      'output.mp3',
    ])

    const data = await ffmpeg.readFile('output.mp3')

    const type = 'audio/mpeg'

    const audioFileBlob = new Blob([data], { type })
    const audioFile = new File([audioFileBlob], 'audio.mp3', { type })

    console.log('Convert Finished.')
    return audioFile
  }

  async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const prompt = promptInputRef.current?.value

    if (!videoFile) {
      return null
    }

    const audioFile = await convertVideoToAudio(videoFile)
    console.log(audioFile)
  }

  const previewURL = useMemo(() => {
    if (!videoFile) {
      return null
    }

    return URL.createObjectURL(videoFile)
  }, [videoFile])

  return (
    <form onSubmit={handleUploadVideo} className="space-y-6 block">
      <label
        htmlFor="video"
        className="border relative flex aspect-video rounded cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5"
      >
        {videoFile ? (
          <video
            src={previewURL ?? ''}
            controls={false}
            className="pointer-events-none absolute inset-0"
          />
        ) : (
          <>
            <FileVideo className="h-4 w-4" />
            Selecione um vídeo
          </>
        )}
      </label>
      <input
        type="file"
        id="video"
        accept="video/mp4"
        className="sr-only"
        onChange={handleFileSelector}
      />

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="transcription_prompt">Prompt de transcrição</Label>
        <Textarea
          id="transcription_prompt"
          className="min-h-20 leading-relaxed rounded h-20 resize-none"
          placeholder="Inclua palavras chaves mensionadas no vídeo separadas por vírgula (,)"
          ref={promptInputRef}
        />
      </div>

      <Button
        className="flex items-center justify-center w-full  rounded text-zinc-50"
        type="submit"
      >
        Carregar vídeo
        <Upload className="w-4 h-4 ml-2" />
      </Button>
    </form>
  )
}
