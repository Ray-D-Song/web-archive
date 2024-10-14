import { Folder as FolderIcon, FolderOpen as FolderOpenIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { useDrop } from 'ahooks'
import { Page } from 'types'

interface FolderProps {
  id: number
  name: string
  isOpen: boolean
  onClick?: (id: number) => void
  onDropPage?: (page: Page) => void
}

function Folder({ id, name, isOpen, onClick, onDropPage }: FolderProps) {
  function handleClick() {
    onClick?.(id)
  }

  const folderRef = useRef(null)
  const [isHover, setIsHover] = useState(false)
  useDrop(folderRef, {
    onDom: (content) => {
      setIsHover(false)
      onDropPage?.(content)
    },
    onDragEnter: () => {
      setIsHover(true)
    },
    onDragLeave: () => {
      setIsHover(false)
    }
  })

  return (
    <li ref={folderRef} className={`flex flex-col justify-center cursor-pointer hover:bg-accent w-full p-2 rounded-md ${isOpen || isHover ? 'bg-accent' : ''}`}>
      <div onClick={handleClick} className="flex items-center ">
        {isOpen ? <FolderOpenIcon className="w-5 h-5 mr-5 ml-2" /> : <FolderIcon className="w-5 h-5 mr-5 ml-2" />}
        <div className='flex-1 overflow-hidden text-ellipsis whitespace-nowrap'>
          {name}
        </div>
      </div>
    </li>
  )
}

export default Folder
