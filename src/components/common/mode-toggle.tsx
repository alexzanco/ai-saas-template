'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ModeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const t = useTranslations('locale')
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="header-button">
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="header-button">
          <Sun
            className={`icon-sun h-5 w-5 transition-all duration-300 ${
              resolvedTheme === 'dark'
                ? 'rotate-90 scale-0'
                : 'rotate-0 scale-100'
            }`}
          />
          <Moon
            className={`icon-moon absolute h-5 w-5 transition-all duration-300 ${
              resolvedTheme === 'dark'
                ? 'rotate-0 scale-100'
                : '-rotate-90 scale-0'
            }`}
          />
          <span className="sr-only">{t('switchTheme')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="dropdown-enhanced">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="dropdown-item-enhanced"
        >
          <Sun className="h-5 w-5 text-yellow-500" />
          <span className="flex-1">{t('light')}</span>
          {theme === 'light' && <div className="status-indicator" />}
        </DropdownMenuItem>
        <div className="dropdown-separator" />
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className="dropdown-item-enhanced"
        >
          <Moon className="h-5 w-5 text-blue-400" />
          <span className="flex-1">{t('dark')}</span>
          {theme === 'dark' && <div className="status-indicator" />}
        </DropdownMenuItem>
        <div className="dropdown-separator" />
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className="dropdown-item-enhanced"
        >
          <Monitor className="h-5 w-5 text-emerald-500" />
          <span className="flex-1">{t('system')}</span>
          {theme === 'system' && <div className="status-indicator" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ModeToggle
