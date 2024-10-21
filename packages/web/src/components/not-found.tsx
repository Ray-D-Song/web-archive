function NotFound({ className }: { className?: string }) {
  return (
    <div className={`${className} flex flex-col items-center justify-center flex-1`}>
      <svg xmlns="http://www.w3.org/2000/svg" width="80px" height="80px" viewBox="0 0 128 128">
        <path fill="#fcc21b" d="M64 9.62C1.59 9.62.12 79.58.12 93.42c0 13.86 28.59 25.08 63.88 25.08c35.28 0 63.88-11.22 63.88-25.08c0-13.84-1.48-83.8-63.88-83.8"></path>
        <path fill="#2f2f2f" d="M41.99 65.5c-4.49.04-8.17-4.27-8.22-9.62c-.05-5.37 3.55-9.75 8.04-9.79c4.48-.04 8.17 4.27 8.22 9.64c.05 5.36-3.56 9.73-8.04 9.77m44.11 0c4.48-.01 8.11-4.36 8.1-9.71c-.01-5.37-3.66-9.7-8.14-9.69c-4.49.01-8.13 4.36-8.12 9.73c.01 5.35 3.67 9.68 8.16 9.67"></path>
        <path fill="#ed6c30" d="M43.08 97.67c1.99 1.34 4.5.46 6.71 0c6.18-1.28 11.6-1.33 14.2-1.33s8.03.05 14.2 1.33c2.21.46 4.72 1.34 6.71 0c2.52-1.71.66-7.83-3.31-11.97c-2.4-2.5-8.13-7.35-17.61-7.35s-15.2 4.85-17.61 7.35c-3.95 4.15-5.81 10.27-3.29 11.97"></path>
      </svg>
      <div className="text-xl font-bold">Not Found</div>
    </div>
  )
}

export default NotFound
