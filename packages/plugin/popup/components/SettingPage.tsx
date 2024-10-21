import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Checkbox } from '@web-archive/shared/components/checkbox'
import { Label } from '@web-archive/shared/components/label'
import { getSingleFileSetting, setSingleFileSetting } from '../utils/singleFile'
import type { PageType } from '~/popup/PopupPage'
import type { SingleFileSetting } from '~/utils/singleFile'

function SettingPage({ setActivePage }: { setActivePage: (tab: PageType) => void }) {
  return (
    <div className="w-64 space-y-1.5 p-4">
      <div className="mb-4 flex space-x-3">
        <ArrowLeft
          className="cursor-pointer"
          size={16}
          onClick={() => { setActivePage('home') }}
        >
        </ArrowLeft>
      </div>
      <div>
        <SingleFileSettings></SingleFileSettings>
      </div>
    </div>
  )
}

function SingleFileSettings() {
  const [settings, setSettings] = useState<SingleFileSetting>(getSingleFileSetting())

  function handleChange(checked: boolean | string, key: keyof SingleFileSetting) {
    if (typeof checked === 'string') {
      return
    }
    setSettings((prev) => {
      const newSettings = {
        ...prev,
        [key]: checked,
      }
      setSingleFileSetting(newSettings)
      return newSettings
    })
  }

  return (
    <div>
      <div className="text-lg font-semibold mb-3">Single File Settings</div>
      <div className="flex flex-col space-y-3">
        <SettingCheckBox
          id="removeHiddenElements"
          checked={settings.removeHiddenElements}
          onCheckedChange={checked => handleChange(checked, 'removeHiddenElements')}
          label="Remove Hidden Elements"
        >
        </SettingCheckBox>
        <SettingCheckBox
          id="removeUnusedStyles"
          checked={settings.removeUnusedStyles}
          onCheckedChange={checked => handleChange(checked, 'removeUnusedStyles')}
          label="Remove Unused Styles"
        >
        </SettingCheckBox>
        <SettingCheckBox
          id="removeUnusedFonts"
          checked={settings.removeUnusedFonts}
          onCheckedChange={checked => handleChange(checked, 'removeUnusedFonts')}
          label="Remove Unused Fonts"
        >
        </SettingCheckBox>
        <SettingCheckBox
          id="removeImports"
          checked={settings.removeImports}
          onCheckedChange={checked => handleChange(checked, 'removeImports')}
          label="Remove Imports"
        >
        </SettingCheckBox>
        <SettingCheckBox
          id="blockScripts"
          checked={settings.blockScripts}
          onCheckedChange={checked => handleChange(checked, 'blockScripts')}
          label="Block Scripts"
        >
        </SettingCheckBox>
        <SettingCheckBox
          id="blockAudios"
          checked={settings.blockAudios}
          onCheckedChange={checked => handleChange(checked, 'blockAudios')}
          label="Block Audios"
        >
        </SettingCheckBox>
        <SettingCheckBox
          id="blockVideos"
          checked={settings.blockVideos}
          onCheckedChange={checked => handleChange(checked, 'blockVideos')}
          label="Block Videos"
        >
        </SettingCheckBox>
        <SettingCheckBox
          id="compressHTML"
          checked={settings.compressHTML}
          onCheckedChange={checked => handleChange(checked, 'compressHTML')}
          label="Compress HTML"
        >
        </SettingCheckBox>
        <SettingCheckBox
          id="removeAlternativeFonts"
          checked={settings.removeAlternativeFonts}
          onCheckedChange={checked => handleChange(checked, 'removeAlternativeFonts')}
          label="Remove Alternative Fonts"
        >
        </SettingCheckBox>
        <SettingCheckBox
          id="removeAlternativeMedias"
          checked={settings.removeAlternativeMedias}
          onCheckedChange={checked => handleChange(checked, 'removeAlternativeMedias')}
          label="Remove Alternative Medias"
        >
        </SettingCheckBox>
        <SettingCheckBox
          id="removeAlternativeImages"
          checked={settings.removeAlternativeImages}
          onCheckedChange={checked => handleChange(checked, 'removeAlternativeImages')}
          label="Remove Alternative Images"
        >
        </SettingCheckBox>
        <SettingCheckBox
          id="groupDuplicateImages"
          checked={settings.groupDuplicateImages}
          onCheckedChange={checked => handleChange(checked, 'groupDuplicateImages')}
          label="Group Duplicate Images"
        >
        </SettingCheckBox>
      </div>
    </div>
  )
}

interface SettingCheckBoxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
  id: string
}

function SettingCheckBox({ checked, onCheckedChange, label, id }: SettingCheckBoxProps) {
  function handleChange(checked: boolean | string) {
    if (typeof checked === 'string') {
      return
    }
    onCheckedChange(checked)
  }

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={handleChange}
      >
      </Checkbox>
      <Label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </Label>
    </div>
  )
}

export default SettingPage
