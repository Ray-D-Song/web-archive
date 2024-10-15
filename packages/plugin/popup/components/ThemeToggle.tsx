import { Moon, Sun, SunMoon } from 'lucide-react'

import { useTheme } from '@web-archive/shared/components/theme-provider'

function getNextTheme(current: 'light' | 'dark' | 'system') {
  switch (current) {
    case 'light':
      return 'dark'
    case 'dark':
      return 'system'
    case 'system':
      return 'light'
  }
}

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  function toggleTheme() {
    setTheme(getNextTheme(theme))
  }

  const className = 'cursor-pointer'

  if (theme === 'light') {
    return (
      <Sun className={className} size={16} onClick={toggleTheme} />
    )
  }
  else if (theme === 'dark') {
    return (
      <Moon className={className} size={16} onClick={toggleTheme} />
    )
  }
  else {
    return (
      <SunMoon className={className} size={16} onClick={toggleTheme} />
    )
  }
}
