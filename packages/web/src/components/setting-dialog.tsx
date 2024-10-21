import { Label } from '@radix-ui/react-context-menu'
import { DialogDescription } from '@radix-ui/react-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@web-archive/shared/components/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@web-archive/shared/components/select'
import { useTheme } from '@web-archive/shared/components/theme-provider'
import { Settings } from 'lucide-react'

function SettingDialog({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  const { theme, setTheme } = useTheme()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            Setting
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
        </DialogDescription>
        <div>
          <div className="flex items-center space-x-6">
            <Label className="font-bold">Color theme: </Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SettingDialog
