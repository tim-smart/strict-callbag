import { Signal, Sink, Source, Talkback } from "."
import { subscribe } from "./subscribe"

interface Callbacks<A, EI, EO> {
  onStart: (talkback: Talkback<any>) => void
  onData: (talkback: Talkback<any>, data: A) => void
  onEnd: (talkback: Talkback<any>, err?: EI) => void

  onRequest: (talkback: Talkback<any>) => void
  onAbort: (err?: EO) => void

  talkbackOverride?: (original: Talkback<any>) => Talkback<any>
}

/**
 * Helper for reducing boilerplate when creating operators
 */
export const createPipe = <A, EI, EO = never>(
  source: Source<A, EI>,
  sink: Sink<any, EI, EO>,
  {
    onStart,
    onData,
    onEnd,

    onRequest,
    onAbort,

    talkbackOverride,
  }: Callbacks<A, EI, EO>,
) => {
  let talkback: Talkback<any>
  let cancel: () => void

  sink(Signal.START, (signal, err) => {
    if (signal === Signal.DATA) {
      if (!cancel) {
        cancel = subscribe(source, {
          onStart(tb) {
            talkback = tb
            onStart(talkback)
          },
          onData,
          onEnd,
          talkbackOverride,
        })
      } else if (talkback) {
        onRequest(talkback)
      }
    } else if (Signal.END) {
      cancel?.()
      onAbort(err)
    }
  })
}
