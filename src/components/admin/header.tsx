'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Package2 } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/components', label: 'Components' },
  { href: '/admin/incidents', label: 'Incidents' },
  { href: '/admin/maintenance', label: 'Maintenance' },
  // Add other admin pages here
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="flex h-16 items-center gap-4 bg-muted/40 rounded-b-xl shadow-sm px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Package2 className="h-6 w-6" />
          <span className="sr-only">Status Page</span>
        </Link>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-muted-foreground transition-colors hover:text-foreground',
              {
                'text-foreground': pathname === item.href,
              }
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
