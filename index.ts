/**
 * A `Signal` is used for communication between producers and consumers.
 *
 * - `START` is used during the handshake phase
 * - `DATA` is used to request or send data
 * - `END` indicates if the producer / consumer has finished, or has aborted
 */
export enum Signal {
  START = 0,
  DATA = 1,
  END = 2,
}

type TalkbackArgsWithError<E> =
  | [signal: Signal.DATA, data?: never]
  | [signal: Signal.END, error?: E]

type TalkbackArgsNoError = [signal: Signal.DATA] | [signal: Signal.END]

type TalkbackArgs<E> = [E] extends [never]
  ? TalkbackArgsNoError
  : TalkbackArgsWithError<E>

/**
 * A `Talkback` is sent from a sink to a producer to:
 *
 * - Request more data
 * - Abort the stream, optionally with an error
 */
export type Talkback<E = never> = (...op: TalkbackArgs<E>) => void

type SinkArgs<A, EI, EO> =
  | [signal: Signal.START, talkback: Talkback<EO>]
  | [signal: Signal.DATA, data: A]
  | [signal: Signal.END, error: EI | undefined]

/**
 * A `Sink` consumes data from a producer.
 *
 * - It can recieve data of the `A` type
 * - It can recieve errors of the `EI` type
 * - It can abort with errors of the `EO` type
 */
export type Sink<A, EI = unknown, EO = never> = (
  ...op: SinkArgs<A, EI, EO>
) => void

type SourceArgs<A, EO = unknown> = [
  signal: Signal.START,
  sink: Sink<A, EO, any>,
]

/**
 * A `Source` produces data
 *
 * - It can send data of the `A` type
 * - It can send errors of the `EO` type
 */
export type Source<A, EO = unknown> = (...op: SourceArgs<A, EO>) => void