import { Button } from '@web-archive/shared/components/button'
import { Input } from '@web-archive/shared/components/input'
import { Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import ViewToggle from './view-toggle'

interface SearchBarProps {
  className?: string
  keyword: string
  setKeyword: (keyword: string) => void
  handleSearch: () => void
}

function SearchBar({ className, keyword, setKeyword, handleSearch }: SearchBarProps) {
  const location = useLocation()
  const match = location.pathname.startsWith('/folder')

  return (
    <div className={`${className ?? ''} flex justify-between items-center m-2 ${match ? '' : 'hidden'}`}>
      <ViewToggle />
      <div className="flex items-center space-x-2">
        <div className="flex items-center border rounded-md px-3" cmdk-input-wrapper="">
          <Search className="h-4 w-4 shrink-0 opacity-50" />
          <Input
            className="border-none outline-none focus-visible:ring-offset-0 focus-visible:ring-ring w-52"
            placeholder="Search in current folder"
            value={keyword}
            showRing={false}
            onChange={e => setKeyword(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          >
          </Input>
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>
    </div>
  )
}

export default SearchBar
