import { ScrollArea } from '@web-archive/shared/components/scroll-area'
import { ThemeToggle } from '@web-archive/shared/components/theme-toggle'
import { Button } from '@web-archive/shared/components/button'
import { LogOut, Plus, Settings, Trash } from 'lucide-react'
import type { Folder as FolderType, Page } from '@web-archive/shared/types'
import Folder from '@web-archive/shared/components/folder'
import { useRequest } from 'ahooks'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import NewFolderDialog from './new-folder-dialog'
import { useNavigate, useParams } from '~/router'
import fetcher from '~/utils/fetcher'
import emitter from '~/utils/emitter'

function SideBar() {
  const navigate = useNavigate()
  const fetchFolders = fetcher<FolderType[]>('/folders/all', { method: 'GET' })
  const { data: folders, refresh } = useRequest(fetchFolders)

  const [openedFolder, setOpenedFolder] = useState<number | null>(null)
  const handleFolderClick = (id: number) => {
    setOpenedFolder(id)
  }

  useEffect(() => {
    if (openedFolder !== null) {
      navigate('/folder/:slug', { params: { slug: openedFolder.toString() } })
    }
  }, [openedFolder])

  const { slug } = useParams('/folder/:slug')
  useEffect(() => {
    setOpenedFolder(Number(slug))
  }, [slug])

  emitter.on('refreshSideBar', refresh)

  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const handleDropPage = async (folderId: number, page: Page) => {
    if (!page || page.folderId === folderId)
      return

    emitter.emit('movePage', { pageId: page.id, folderId })
    await fetcher('/pages/update_page', {
      method: 'PUT',
      body: JSON.stringify({ id: page.id, folderId }),
    })()
    toast.success('Page moved successfully')
  }

  return (
    <div className="w-64 h-screen shadow-lg dark:shadow-zinc-600 dark:shadow-sm">
      <NewFolderDialog afterSubmit={refresh} open={newFolderDialogOpen} setOpen={setNewFolderDialogOpen} />
      <ScrollArea className="h-full">
        <div className="p-4 min-h-full flex flex-col">
          <div className="flex space-x-2">
            <ThemeToggle></ThemeToggle>
            <Button variant="ghost" className="flex-1 text-sm justify-center bg-green-600 hover:bg-green-700 text-white hover:text-white" onClick={() => setNewFolderDialogOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              New Directory
            </Button>
          </div>
          <nav className="flex-1">
            <ul className="flex flex-col gap-2 justify-center items-center py-4">
              {folders?.map(folder => (
                <Folder
                  key={folder.id}
                  name={folder.name}
                  id={folder.id}
                  isOpen={openedFolder === folder.id}
                  onClick={handleFolderClick}
                  onDropPage={(page) => { handleDropPage(folder.id, page) }}
                />
              ))}
            </ul>
          </nav>
          <Button variant="ghost" className="w-full text-sm justify-start">
            <Settings className="w-5 h-5 mr-2" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full text-sm justify-start">
            <Trash className="w-5 h-5 mr-2" />
            Deleted
          </Button>
          <Button
            variant="ghost"
            className="w-full text-sm justify-start"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </ScrollArea>
    </div>
  )
}

export default SideBar
