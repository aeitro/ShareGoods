'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from "@/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Languages } from "lucide-react"

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'ta', name: 'தமிழ்' },
  ]

  const handleLanguageChange = (newLocale: string) => {
    router.push(pathname, {locale: newLocale})
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 h-9 text-gray-600 hover:text-[#A7D129]">
          <Languages className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={locale === lang.code ? "bg-gray-100 font-bold" : ""}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
