import { Toaster } from 'react-hot-toast'
import { Outlet } from 'react-router-dom'
import { ThemeProvider } from '@web-archive/shared/components/theme-provider'
import SideBar from '~/components/side-bar'
import Header from '~/components/header'

function Layout() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <main className="flex min-h-screen">
        <Toaster
          position="top-center"
          reverseOrder={false}
        />
        <div className="w-64">
          <SideBar />
        </div>
        <div className="flex-1 flex flex-col">
          <Header />
          <Outlet />
        </div>
      </main>
    </ThemeProvider>
  )
}

export default Layout
