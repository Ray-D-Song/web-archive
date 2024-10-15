import { Button } from '@web-archive/shared/components/button'
import { Trash } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@web-archive/shared/components/tooltip'
import { useRequest } from 'ahooks'
import { useEffect, useState } from 'react'
import { isNotNil } from '@web-archive/shared/utils'
import { useNavigate, useParams } from '~/router'
import fetcher from '~/utils/fetcher'
import emitter from '~/utils/emitter'
import PageListContainer from '~/components/page-list-container'
import SearchBar from '~/components/serach-bar'

function FolderPage() {
  const { slug } = useParams('/folder/:slug')
  const [folderId, setFolderId] = useState<number>()

  useEffect(() => {
    if (isNotNil(slug))
      setFolderId(Number(slug))
  }, [slug])

  const navigate = useNavigate()
  const { run: deleteFolder } = useRequest(
    fetcher<boolean>('/folders/delete', {
      method: 'DELETE',
      query: {
        id: slug,
      },
    }),
    {
      manual: true,
      onSuccess: (data) => {
        if (data) {
          emitter.emit('refreshSideBar')
          navigate('/')
        }
      },
    },
  )

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this folder?')) {
      deleteFolder()
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="p-2 flex justify-between items-center">
        <SearchBar className="ml-2"></SearchBar>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Delete current folder
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      { folderId && <PageListContainer folderId={folderId}></PageListContainer>}
    </div>
  )
}

export default FolderPage
