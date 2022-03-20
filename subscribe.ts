import { Signal, Source, Talkback } from "."

interface Callbacks<A, E> {
  onStart: (talkback: Talkback<any>) => void
  onData: (talkback: Talkback<any>, data: A) => void
  onEnd: (talkback: Talkback<any>, err?: E) => void

  talkbackOverride?: (original: Talkback<any>) => Talkback<any>
}

export const subscribe = <A, E>(
  source: Source<A, E>,
  { onStart, onData, onEnd, talkbackOverride }: Callbacks<A, E>,
) => {
  let aborted = false
  let talkback: Talkback<any>

  source(Signal.START, (signal, data) => {
    if (aborted) {
      if (signal === Signal.START) {
        data(Signal.END)
      }
      return
    }

    if (signal === Signal.START) {
      talkback = talkbackOverride ? talkbackOverride(data) : data
      onStart(talkback)
    } else if (signal === Signal.DATA) {
      onData(talkback, data)
    } else if (signal === Signal.END) {
      onEnd(talkback, data)
    }
  })

  return () => {
    aborted = true
    talkback?.(Signal.END)
  }
}
