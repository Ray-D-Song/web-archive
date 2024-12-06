import { Button } from '@web-archive/shared/components/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@web-archive/shared/components/collapsible'
import Folder from '@web-archive/shared/components/folder'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub } from '@web-archive/shared/components/side-bar'
import { Skeleton } from '@web-archive/shared/components/skeleton'
import { cn, isNil } from '@web-archive/shared/utils'
import { ChevronDown, FolderIcon, Plus } from 'lucide-react'
import { useState } from 'react'
import type { Folder as FolderType } from '@web-archive/shared/types'
import { useRequest } from 'ahooks'
import toast from 'react-hot-toast'
import NewFolderDialog from './new-folder-dialog'
import EditFolderDialog from './edit-folder-dialog'
import { deleteFolder, getAllFolder } from '~/data/folder'
import emitter from '~/utils/emitter'
import { Link, useNavigate } from '~/router'

function getNextFolderId(folders: Array<FolderType>, index: number) {
  if (index === 0 && folders.length === 1) {
    return null
  }
  if (index === 0) {
    return folders[index + 1].id
  }
  return folders[index - 1].id
}

interface SidebarFolderCollapseProps {
  openedFolder: number | null
  setOpenedFolder: (id: number) => void
  className?: string
}

function SidebarFolderMenu({ openedFolder, setOpenedFolder, className }: SidebarFolderCollapseProps) {
  const navigate = useNavigate()

  const [isFoldersCollapseOpen, setIsFoldersCollapseOpen] = useState(true)

  const { data: folders, refresh, mutate: setFolders, loading: foldersLoading } = useRequest(getAllFolder)

  emitter.on('refreshSideBar', refresh)

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

  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false)
  return (
    <SidebarMenu className={className}>
      <NewFolderDialog afterSubmit={refresh} open={newFolderDialogOpen} setOpen={setNewFolderDialogOpen} />
      <EditFolderDialog
        afterSubmit={refresh}
        open={editFolderDialogOpen}
        setOpen={setEditFolderDialogOpen}
        editFolder={editFolder}
      />
      <Collapsible
        open={isFoldersCollapseOpen}
        onOpenChange={setIsFoldersCollapseOpen}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="w-full justify-between">
            <div className="flex items-center">
              <FolderIcon className="mr-2 h-4 w-4" />
              Folders
            </div>
            <ChevronDown className={cn('h-4 w-4 transition-transform', isFoldersCollapseOpen && 'rotate-180')} />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {foldersLoading
              ? (
                <>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="w-full h-10" />
                  ))}
                </>
                )
              : (
                  folders?.map(folder => (
                    <SidebarMenuItem key={folder.id}>
                      <Link to="/folder/:slug" params={{ slug: folder.id.toString() }}>
                        <SidebarMenuButton>
                          <Folder
                            name={folder.name}
                            id={folder.id}
                            isOpen={openedFolder === folder.id}
                            onDelete={handleDeleteFolder}
                            onEdit={handleEditFolder}
                          />

                        </SidebarMenuButton>
                      </Link>

                    </SidebarMenuItem>
                  ))
                )}
            <SidebarMenuItem>
              <Button variant="ghost" className="w-full justify-start" onClick={() => setNewFolderDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Folder
              </Button>
            </SidebarMenuItem>
          </SidebarMenuSub>

        </CollapsibleContent>
      </Collapsible>
    </SidebarMenu>
  )
}

export default SidebarFolderMenu
