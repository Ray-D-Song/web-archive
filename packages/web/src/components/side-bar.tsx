import { ScrollArea } from '@web-archive/shared/components/scroll-area'
import { Button } from '@web-archive/shared/components/button'
import { LogOut, Plus, Settings, Trash } from 'lucide-react'
import type { Folder as FolderType, Page } from '@web-archive/shared/types'
import Folder from '@web-archive/shared/components/folder'
import { useRequest } from 'ahooks'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { isNil, isNumberString } from '@web-archive/shared/utils'
import { useLocation } from 'react-router-dom'
import NewFolderDialog from './new-folder-dialog'
import EditFolderDialog from './edit-folder-dialog'
import SettingDialog from './setting-dialog'
import { useNavigate, useParams } from '~/router'
import emitter from '~/utils/emitter'
import { deleteFolder, getAllFolder } from '~/data/folder'
import { updatePage } from '~/data/page'

function getNextFolderId(folders: Array<FolderType>, index: number) {
  if (index === 0 && folders.length === 1) {
    return null
  }
  if (index === 0) {
    return folders[index + 1].id
  }
  return folders[index - 1].id
}

function SideBar() {
  const navigate = useNavigate()
  const { data: folders, refresh, mutate: setFolders } = useRequest(getAllFolder)

  const [openedFolder, setOpenedFolder] = useState<number | null>(null)
  const handleFolderClick = (id: number) => {
    setOpenedFolder(id)
  }

  const handleDeleteFolder = async (folderId: number) => {
    if (isNil(folders) || !confirm('Are you sure you want to delete this folder?'))
      return

    try {
      await deleteFolder(folderId)
      const oldFolderIndex = folders.findIndex(folder => folder.id === folderId)
      const nextFolderId = getNextFolderId(folders, oldFolderIndex)
      setFolders(folders.filter((_, index) => index !== oldFolderIndex))
      if (nextFolderId !== null)
        setOpenedFolder(nextFolderId)
      else
        navigate('/')
      toast.success('Folder deleted successfully')
    }
    catch (error) {
      toast.error('Failed to delete folder')
    }
  }

  const [editFolderDialogOpen, setEditFolderDialogOpen] = useState(false)
  const [editFolder, setEditFolder] = useState<FolderType>()
  const handleEditFolder = (folderId: number) => {
    setEditFolder(folders?.find(folder => folder.id === folderId))
    setEditFolderDialogOpen(true)
  }

  useEffect(() => {
    if (openedFolder !== null) {
      navigate('/folder/:slug', { params: { slug: openedFolder.toString() } })
    }
  }, [openedFolder])

  const { slug } = useParams('/folder/:slug')
  const { pathname } = useLocation()
  useEffect(() => {
    if (pathname.startsWith('/folder/') && isNumberString(slug))
      setOpenedFolder(Number(slug))
  }, [slug, pathname])

  emitter.on('refreshSideBar', refresh)

  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const handleDropPage = async (folderId: number, page: Page) => {
    if (!page || page.folderId === folderId)
      return

    await updatePage({
      id: page.id,
      folderId,
    })
    toast.success('Page moved successfully')
    emitter.emit('movePage', { pageId: page.id, folderId })
  }

  const [settingDialogOpen, setSettingDialogOpen] = useState(false)

  return (
    <div className="w-64 h-screen shadow-lg dark:shadow-zinc-600 dark:shadow-sm">
      <NewFolderDialog afterSubmit={refresh} open={newFolderDialogOpen} setOpen={setNewFolderDialogOpen} />
      <EditFolderDialog
        afterSubmit={refresh}
        open={editFolderDialogOpen}
        setOpen={setEditFolderDialogOpen}
        editFolder={editFolder}
      />
      <SettingDialog open={settingDialogOpen} setOpen={setSettingDialogOpen} />
      <div className="h-screen">
        <div className="p-4 min-h-full flex flex-col">
          <div className="flex space-x-2">
            <Button className="flex-1 text-sm justify-center opacity-60 hover:opacity-100 transition-opacity duration-300" onClick={() => setNewFolderDialogOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              New Folder
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-210px)]">
            <ul className="flex flex-col gap-2 justify-center items-center py-4">
              {folders?.map(folder => (
                <Folder
                  key={folder.id}
                  name={folder.name}
                  id={folder.id}
                  isOpen={openedFolder === folder.id}
                  onClick={handleFolderClick}
                  onDropPage={(page) => { handleDropPage(folder.id, page) }}
                  onDelete={handleDeleteFolder}
                  onEdit={handleEditFolder}
                />
              ))}
            </ul>
          </ScrollArea>
          <div className="border-b border-gray-200 dark:border-gray-800 my-2" />
          <Button
            variant="ghost"
            className="w-full text-sm justify-start gap-4"
            onClick={() => {
              setSettingDialogOpen(true)
              setOpenedFolder(null)
            }}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full text-sm justify-start gap-4"
            onClick={() => {
              setOpenedFolder(null)
              navigate('/trash')
            }}
          >
            <Trash className="w-4 h-4 mr-2" />
            Deleted
          </Button>
          <Button
            variant="ghost"
            className="w-full text-sm justify-start gap-4"
            onClick={() => {
              setOpenedFolder(null)
              handleLogout()
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SideBar
