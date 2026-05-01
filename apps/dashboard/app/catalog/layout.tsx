'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Tag, Package } from 'lucide-react'

const tabs = [
  { href: '/catalog/categories', label: 'Categories', icon: Tag },
  { href: '/catalog/products', label: 'Products', icon: Package },
]

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-[#283c50]">Catalogue</h1>
        <p className="text-xs text-[#9ca3af] mt-0.5">Manage product categories and items</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#f3f4f6] rounded w-fit">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 text-xs font-medium px-4 py-1.5 rounded transition-all"
              style={
                isActive
                  ? { backgroundColor: '#fff', color: '#3454d1', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }
                  : { color: '#6b7885' }
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          )
        })}
      </div>

      {children}
    </div>
  )
}
