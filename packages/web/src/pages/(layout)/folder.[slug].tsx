import { isNil } from '@web-archive/shared/utils'
import { useParams } from '~/router'
import PageListContainer from '~/components/page-list-container'
import NotFound from '~/components/not-found'

function FolderPage() {
  const { slug } = useParams('/folder/:slug')

  if (isNil(slug))
    return <NotFound />

  return (
    <div className="flex flex-col flex-1">
      <PageListContainer folderId={Number(slug)} />
    </div>
  )
}

export default FolderPage
