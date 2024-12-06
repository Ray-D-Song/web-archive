import { HomeIcon, LogOut, Settings, SquareLibrary, Trash2 } from 'lucide-react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@web-archive/shared/components/side-bar'
import { useEffect, useState } from 'react'
import { isNumberString } from '@web-archive/shared/utils'
import { useLocation } from 'react-router-dom'
import { ScrollArea } from '@web-archive/shared/components/scroll-area'
import SettingDialog from './setting-dialog'
import SidebarFolderMenu from './side-bar-folder-menu'
import SidebarTagMenu from './side-bar-tag-menu'
import { Link, useNavigate, useParams } from '~/router'

interface SidebarProps {
  selectedTag: number | null
  setSelectedTag: (tag: number | null) => void
}

function Component({ selectedTag, setSelectedTag }: SidebarProps) {
  const navigate = useNavigate()

  const [openedFolder, setOpenedFolder] = useState<number | null>(null)
  const { slug } = useParams('/folder/:slug')
  const { pathname } = useLocation()
  useEffect(() => {
    if (pathname.startsWith('/folder/') && isNumberString(slug))
      setOpenedFolder(Number(slug))
    else
      setOpenedFolder(null)
  }, [slug, pathname])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const [settingDialogOpen, setSettingDialogOpen] = useState(false)

  return (
    <Sidebar>
      <SettingDialog open={settingDialogOpen} setOpen={setSettingDialogOpen} />

      <SidebarHeader>
        <div className="flex justify-center items-center">
          <img src="/static/logo.svg" className="w-10 scale-x-[-1]" />
          <h2 className="mt-2 pr-4 pl-2 text-lg font-semibold tracking-tight leading-5">
            Web
            <br />
            {' '}
            Archive
          </h2>
        </div>
      </SidebarHeader>

      <SidebarContent className="mt-4 h-64 overflow-hidden">
        <ScrollArea className="h-full overflow-auto">
          <SidebarMenu>
            <SidebarMenuButton
              className="w-full justify-between"
              asChild
            >
              <Link to="/">
                <div className="flex items-center">
                  <HomeIcon className="mr-2 h-4 w-4" />
                  Home
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenu>
          <SidebarFolderMenu
            openedFolder={openedFolder}
            setOpenedFolder={setOpenedFolder}
          />
          <SidebarTagMenu
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
          >
          </SidebarTagMenu>
        </ScrollArea>

      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/showcase/folder">
                <SquareLibrary className="mr-2 h-4 w-4" />
                Showcase
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => {
              setSettingDialogOpen(true)
            }}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/trash">
                <Trash2 className="mr-2 h-4 w-4" />
                Trash
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => {
              setOpenedFolder(null)
              handleLogout()
            }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

    </Sidebar>
  )
}

export default Component
