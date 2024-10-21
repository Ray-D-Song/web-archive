import mitt from 'mitt'

type Events = {
  movePage: { pageId: number, folderId: number }
  refreshSideBar: void
}

export default mitt<Events>()
