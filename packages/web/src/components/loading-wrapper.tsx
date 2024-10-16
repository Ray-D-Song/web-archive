import React from 'react'

function Loading() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="m-b-xl h-8 w-8 animate-spin border-4 border-t-transparent rounded-full border-primary"></div>
      <div>Loading...</div>
    </div>
  )
}

function LoadingWrapper({ children, loading }: { children: React.ReactNode, loading: boolean }) {
  return loading ? <Loading /> : children
}

export default LoadingWrapper
