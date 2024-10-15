import { Button } from '@web-archive/shared/components/button'
import { Input } from '@web-archive/shared/components/input'
import { Search } from 'lucide-react'
import { useState } from 'react'

function SearchBar({ className }: { className?: string }) {
  const [keyword, setKeyword] = useState('')

  const handleSerach = () => {
    console.log('searching', keyword)
  }

  return (
    <div className={`${className} flex space-x-2`}>
      <div className="flex items-center border rounded-md px-3" cmdk-input-wrapper="">
        <Search className="h-4 w-4 shrink-0 opacity-50" />
        <Input
          className="border-none outline-none focus-visible:ring-offset-0 focus-visible:ring-ring"
          placeholder="Search"
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
