import { Button } from '@web-archive/shared/components/button'
import { Dialog, DialogContent, DialogTitle } from '@web-archive/shared/components/dialog'
import { Input } from '@web-archive/shared/components/input'
import { isNil } from '@web-archive/shared/utils'
import { useRequest } from 'ahooks'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import fetcher from '~/utils/fetcher'

interface EditFolderProps {
  afterSubmit: () => void
  open: boolean
  setOpen: (open: boolean) => void
  editFolder?: {
    id: number
    name: string
  }
}

function EditFolderDialog({ afterSubmit, open, setOpen, editFolder }: EditFolderProps) {
  const [folderName, setFolderName] = useState(editFolder?.name ?? '')
  useEffect(() => {
    setFolderName(editFolder?.name ?? '')
  }, [editFolder])
  const { run } = useRequest(
    fetcher('/folders/update', { method: 'PUT', body: { id: editFolder?.id, name: folderName } }),
    {
      manual: true,
      onSuccess: () => {
        setOpen(false)
        toast.success('Folder updated successfully')
        afterSubmit()
      },
      onError: (error) => {
        toast.error(error.message)
      },
    },
  )
  const handleSubmit = () => {
    if (folderName.length === 0) {
      toast.error('Folder name is required')
      return
    }
    if (folderName === editFolder?.name) {
      setOpen(false)
      toast.success('Folder updated successfully')
      return
    }
    if (isNil(editFolder?.id)) {
      toast.error('Folder id is required')
      return
    }
    run()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Edit Folder</DialogTitle>
        <Input value={folderName} onChange={e => setFolderName(e.target.value)} placeholder="Folder Name" />
        <Button onClick={handleSubmit}>Update</Button>
      </DialogContent>
    </Dialog>
  )
}

export default EditFolderDialog
