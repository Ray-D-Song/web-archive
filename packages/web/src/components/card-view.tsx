import type { Page } from '@web-archive/shared/types'
import PageCard from './page-card'

function CardView({ pages, onPageDelete }: { pages?: Page[], onPageDelete: (page: Page) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <PageCardList pages={pages?.filter((_, index) => index % 3 === 0)} onPageDelete={onPageDelete} />
      <PageCardList pages={pages?.filter((_, index) => index % 3 === 1)} onPageDelete={onPageDelete} />
      <PageCardList pages={pages?.filter((_, index) => index % 3 === 2)} onPageDelete={onPageDelete} />
    </div>
  )
}

function PageCardList({ pages, onPageDelete }: { pages?: Page[], onPageDelete: (page: Page) => void }) {
  return (
    <div className="flex flex-col space-y-4">
      {pages && pages.map(page => (
        <PageCard key={page.id} page={page} onPageDelete={onPageDelete} />
      ))}
    </div>
  )
}

export default CardView
