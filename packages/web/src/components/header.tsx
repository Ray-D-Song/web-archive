import { Button } from '@web-archive/shared/components/button'
import { Input } from '@web-archive/shared/components/input'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'

function SearchBar({ className }: { className?: string }) {
  const [keyword, setKeyword] = useState('')

  const handleSerach = () => {
    console.log('searching', keyword)
  }

  const location = useLocation()
  const match = location.pathname.startsWith('/folder')

  return (
    <div className={`${className ?? ''} flex space-x-2 ml-auto m-2 ${match ? '' : 'hidden'}`}>
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
              handleSerach()
            }
          }}
        >
        </Input>
      </div>
      <Button onClick={handleSerach}>Search</Button>
    </div>
  )
}

export default SearchBar
