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
  let pendingPulls = 0
  let talkback: Talkback<any>
  let onCancel: (() => void) | undefined

  source(Signal.START, (signal, data) => {
    if (aborted) {
      if (signal === Signal.START) {
        data(Signal.END)
        onCancel?.()
      }
      return
    }

    if (signal === Signal.START) {
      talkback = talkbackOverride ? talkbackOverride(data) : data
      onStart(talkback)

      while (--pendingPulls > 0) {
        talkback(Signal.DATA)
      }
    } else if (signal === Signal.DATA) {
      onData(talkback, data)
    } else if (signal === Signal.END) {
      onEnd(talkback, data)
    }
  })

  const cancel = (cb?: () => void) => {
    aborted = true
    onCancel = cb

    if (talkback) {
      talkback(Signal.END)
      onCancel?.()
    }
  }
  const pull = () => {
    if (talkback) {
      talkback(Signal.DATA)
    } else {
      pendingPulls++
    }
  }

  return { cancel, pull }
}

export type Subscription = ReturnType<typeof subscribe>
