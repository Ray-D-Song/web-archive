import type { ReactNode } from 'react'

interface LoadingPageProps {
  loadingText: string | ReactNode
}

function LoadingPage({ loadingText }: LoadingPageProps) {
  return (
    <div
      className="w-64 h-32 flex flex-col items-center justify-center text-sm font-medium"
    >
      <div className="m-b-xl h-8 w-8 animate-spin border-4 border-t-transparent rounded-full border-primary"></div>
      <div>
        {loadingText}
      </div>
    </div>
  )
}

export default LoadingPage
