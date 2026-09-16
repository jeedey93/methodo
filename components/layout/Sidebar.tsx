'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home, Share2, Calendar, PenLine, BookOpen,
  LogOut, Menu, X, Users, MonitorPlay, HelpCircle, UserCircle
} from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Accueil' },
  { href: '/communaute', icon: Share2, label: 'Communauté' },
  { href: '/planificateur', icon: Calendar, label: 'Planificateur' },
  { href: '/creer', icon: PenLine, label: 'Créer' },
  { href: '/bibliotheque', icon: BookOpen, label: 'Bibliothèque' },
  { href: '/classe', icon: MonitorPlay, label: 'Outils de classe' },
  { href: '/portail-parents', icon: Users, label: 'Portail parents' },
  { href: '/aide', icon: HelpCircle, label: 'Guide d\'utilisation' },
]

interface ProfileData {
  firstName?: string
  lastName?: string
  avatarUrl?: string | null
}

export default function Sidebar({ firstName }: { firstName?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profile, setProfile] = useState<ProfileData>({ firstName })

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        if (data.profile) {
          setProfile({
            firstName: data.profile.firstName,
            lastName: data.profile.lastName,
            avatarUrl: data.profile.avatarUrl,
          })
        }
      })
      .catch(() => {})
  }, [pathname])

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/connexion')
    router.refresh()
  }

  const initials = profile.firstName && profile.lastName
    ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()
    : profile.firstName?.charAt(0).toUpperCase() ?? '?'

  const displayName = profile.firstName
    ? profile.lastName ? `${profile.firstName} ${profile.lastName}` : profile.firstName
    : firstName ?? ''

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-stone-100">
        <div className="relative h-9 w-9 overflow-hidden rounded-xl flex-shrink-0">
          <Image src="/logo-icon.jpeg" alt="Méthodo" fill className="object-cover object-center scale-[1.15]" priority />
        </div>
        <span className="text-lg font-bold tracking-tight text-stone-900">Méthodo</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              )}
            >
              <item.icon className={cn('h-4 w-4', isActive ? 'text-blue-600' : 'text-stone-400')} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer — profil */}
      <div className="border-t border-stone-100 px-3 py-3 space-y-1">
        <Link
          href="/parametres"
          onClick={() => setMobileOpen(false)}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            pathname === '/parametres'
              ? 'bg-blue-50 text-blue-700'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          )}
        >
          {profile.avatarUrl ? (
            <div className="relative h-6 w-6 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-stone-200">
              <Image src={profile.avatarUrl} alt="Profil" fill className="object-cover" unoptimized />
            </div>
          ) : (
            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-blue-600">{initials}</span>
            </div>
          )}
          <span className="truncate">{displayName || 'Mon profil'}</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4 text-stone-400" />
          Se déconnecter
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 border-r border-stone-200 bg-white flex-col h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-stone-200 shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 h-full bg-white">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
