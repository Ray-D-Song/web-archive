import Empty from './empty'

function EmptyWrapper({ children, empty }: { children: React.ReactNode, empty: boolean }) {
  return empty ? <Empty className="h-full" /> : children
}

export default EmptyWrapper
