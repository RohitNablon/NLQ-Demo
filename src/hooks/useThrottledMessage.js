import { useState, useEffect, useRef } from 'react'

export function useThrottledMessage(message: string, delay: number = 500) {
    const [throttledMessage, setThrottledMessage] = useState(message)
    const lastRan = useRef(Date.now())

    useEffect(() => {
        const handler = setTimeout(() => {
            if (Date.now() - lastRan.current >= delay) {
                setThrottledMessage(message)
                lastRan.current = Date.now()
            }
        }, delay - (Date.now() - lastRan.current))

        return () => {
            clearTimeout(handler)
        }
    }, [message, delay])

    return throttledMessage
}
