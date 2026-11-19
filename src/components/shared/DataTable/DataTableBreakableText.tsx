import { Fragment } from 'react'
import { cn } from '@/utils'

const BREAK_AFTER = /([._:/@-])/
const LONG_RUN = 10

/** Identifiers (codes, emails, paths) have no spaces, so tables cannot shrink their
 *  column; this adds line-break opportunities after separators without altering the text. */
const chunk = (part: string) =>
  part.length > LONG_RUN ? (part.match(new RegExp(`.{1,${LONG_RUN}}`, 'g')) ?? [part]) : [part]

export const DataTableBreakableText = ({ text, className }: DataTableBreakableTextProps) => {
  const parts = text.split(BREAK_AFTER)

  return (
    <span className={cn('break-words', className)} title={text}>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {chunk(part).map((piece, pieceIndex) => (
            <Fragment key={pieceIndex}>
              {pieceIndex ? <wbr /> : null}
              {piece}
            </Fragment>
          ))}
          {BREAK_AFTER.test(part) ? <wbr /> : null}
        </Fragment>
      ))}
    </span>
  )
}

export interface DataTableBreakableTextProps {
  text: string
  className?: string
}
