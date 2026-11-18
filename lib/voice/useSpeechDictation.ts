'use client'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

interface RecognitionAlternative {
    transcript: string
}

interface RecognitionResult {
    isFinal: boolean
    0: RecognitionAlternative
}

interface RecognitionEvent {
    resultIndex: number
    results: { length: number; [index: number]: RecognitionResult }
}

interface RecognitionErrorEvent {
    error: string
}

interface Recognition {
    lang: string
    continuous: boolean
    interimResults: boolean
    maxAlternatives: number
    onresult: ((event: RecognitionEvent) => void) | null
    onerror: ((event: RecognitionErrorEvent) => void) | null
    onend: (() => void) | null
    start: () => void
    stop: () => void
    abort: () => void
}

type RecognitionCtor = new () => Recognition

const LANGUAGES = ['es-BO', 'es-419', 'es-ES']

const ERRORS: Record<string, string> = {
    'not-allowed': 'Permite el acceso al micrófono para usar la voz.',
    'service-not-allowed': 'El navegador bloqueó el reconocimiento de voz.',
    'no-speech': 'No te escuché. Intenta de nuevo.',
    'audio-capture': 'No se encontró un micrófono.',
    network: 'No hay conexión con el servicio de reconocimiento.',
}

function getConstructor(): RecognitionCtor | null {
    if (typeof window === 'undefined') return null
    const scope = window as unknown as {
        SpeechRecognition?: RecognitionCtor
        webkitSpeechRecognition?: RecognitionCtor
    }
    return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null
}

export type DictationStatus = 'idle' | 'listening'

const subscribeNothing = () => () => undefined

export function useSpeechDictation(onFinal: (text: string) => void) {
    const supported = useSyncExternalStore(
        subscribeNothing,
        () => getConstructor() !== null,
        () => false,
    )
    const [status, setStatus] = useState<DictationStatus>('idle')
    const [interim, setInterim] = useState('')
    const [error, setError] = useState<string | null>(null)
    const recognition = useRef<Recognition | null>(null)
    const finalText = useRef('')
    const languageIndex = useRef(0)
    const launchRef = useRef<() => void>(() => undefined)
    const onFinalRef = useRef(onFinal)

    useEffect(() => {
        onFinalRef.current = onFinal
    }, [onFinal])

    useEffect(() => () => recognition.current?.abort(), [])

    const launch = useCallback(() => {
        const Ctor = getConstructor()
        if (!Ctor) return
        const instance = new Ctor()
        instance.lang = LANGUAGES[languageIndex.current]
        instance.continuous = false
        instance.interimResults = true
        instance.maxAlternatives = 1
        let retry = false

        instance.onresult = (event) => {
            let interimText = ''
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i]
                if (result.isFinal) finalText.current += `${result[0].transcript} `
                else interimText += result[0].transcript
            }
            setInterim(interimText)
        }
        instance.onerror = (event) => {
            if (event.error === 'language-not-supported' && languageIndex.current < LANGUAGES.length - 1) {
                languageIndex.current += 1
                retry = true
                return
            }
            if (event.error !== 'aborted') setError(ERRORS[event.error] ?? 'No se pudo usar la voz.')
        }
        instance.onend = () => {
            if (retry) {
                launchRef.current()
                return
            }
            recognition.current = null
            setStatus('idle')
            setInterim('')
            const text = finalText.current.trim()
            if (text) onFinalRef.current(text)
        }

        recognition.current = instance
        try {
            instance.start()
            setStatus('listening')
        } catch {
            setError('No se pudo iniciar el micrófono.')
            setStatus('idle')
        }
    }, [])

    useEffect(() => {
        launchRef.current = launch
    }, [launch])

    const start = useCallback(() => {
        if (recognition.current) return
        finalText.current = ''
        setError(null)
        setInterim('')
        languageIndex.current = 0
        launch()
    }, [launch])

    const stop = useCallback(() => recognition.current?.stop(), [])
    const cancel = useCallback(() => {
        finalText.current = ''
        recognition.current?.abort()
    }, [])

    return { supported, status, interim, error, start, stop, cancel }
}
