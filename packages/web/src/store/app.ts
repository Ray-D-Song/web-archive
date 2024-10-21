import { createContext } from 'react'

const AppContext = createContext<{
  view: 'card' | 'list'
  setView: (view: 'card' | 'list') => void
}>({
      view: 'card',
      setView: () => {},
    })

export default AppContext
