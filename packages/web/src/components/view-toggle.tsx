import { Button } from '@web-archive/shared/components/button'
import { Grid2X2, List } from 'lucide-react'
import { useContext } from 'react'
import AppContext from '../store/app'

function ViewToggle() {
  const { view, setView } = useContext(AppContext)
  return (
    <div className="flex">
      <Button variant={view === 'card' ? 'default' : 'outline'} size="icon" className="rounded-br-none rounded-tr-none border-r-0" onClick={() => setView('card')}>
        <Grid2X2 className="h-4 w-4" />
      </Button>
      <Button variant={view === 'list' ? 'default' : 'outline'} size="icon" className="rounded-bl-none rounded-tl-none border-l-0" onClick={() => setView('list')}>
        <List className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default ViewToggle
