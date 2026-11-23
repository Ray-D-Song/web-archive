import { cn } from '@web-archive/shared/utils'
import { memo } from 'react'
import { GithubIcon } from './github'

interface PoweredByProps {
  className?: string
}

function Comp({ className }: PoweredByProps) {
  return (
    <a
      href="https://github.com/ray-d-song/web-archive"
      target="_blank"
      rel="noreferrer"
      className={cn(
        'flex items-center gap-1.5 h-9 px-3 py-1 text-white bg-blue-600 rounded-md text-xs shrink-0',
        className,
      )}
    >
      <span className="opacity-90 hidden sm:inline">powered by</span>
      <span className="font-bold text-sm">
        Web Archive
      </span>
      <GithubIcon className="inline-block h-5 w-5" />
    </a>
  )
}

const PoweredBy = memo(Comp)

export default PoweredBy
