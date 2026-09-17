'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home, Share2, Calendar, PenLine, BookOpen,
  LogOut, Menu, X, Users, MonitorPlay, HelpCircle, GraduationCap, ChevronRight, LayoutTemplate
} from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'

const navSections = [
  {
    label: 'Planification',
    items: [
      { href: '/dashboard', icon: Home, label: 'Accueil' },
      { href: '/planificateur', icon: Calendar, label: 'Planificateur' },
      { href: '/creer', icon: PenLine, label: 'Créer' },
      { href: '/bibliotheque', icon: BookOpen, label: 'Bibliothèque' },
    ],
  },
  {
    label: 'Classe',
    items: [
      { href: '/ma-classe', icon: GraduationCap, label: 'Ma classe' },
      { href: '/classe', icon: MonitorPlay, label: 'Outils de classe' },
      { href: '/tableau-blanc', icon: LayoutTemplate, label: 'Tableau blanc' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { href: '/communaute', icon: Share2, label: 'Communauté' },
      { href: '/portail-parents', icon: Users, label: 'Portail parents' },
    ],
  },
  {
    label: 'Aide',
    items: [
      { href: '/aide', icon: HelpCircle, label: "Guide d'utilisation" },
    ],
  },
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
    <div className="flex h-full flex-col bg-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="relative h-8 w-8 overflow-hidden rounded-lg flex-shrink-0 shadow-sm">
          <Image src="/logo-icon.jpeg" alt="Méthodo" fill className="object-cover object-center scale-[1.15]" priority />
        </div>
        <span className="text-[17px] font-bold tracking-tight text-stone-900">Méthodo</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-4 space-y-5 overflow-y-auto">
        {navSections.map(section => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-stone-400/80">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
                    )}
                  >
                    <span className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-md transition-all',
                      isActive
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-stone-400 group-hover:text-stone-600'
                    )}>
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 text-blue-400" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer — profil */}
      <div className="px-3 pb-3 pt-2 border-t border-stone-100">
        <Link
          href="/parametres"
          onClick={() => setMobileOpen(false)}
          className={cn(
            'group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all',
            pathname === '/parametres'
              ? 'bg-blue-50'
              : 'hover:bg-stone-50'
          )}
        >
          {profile.avatarUrl ? (
            <div className="relative h-8 w-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm">
              <Image src={profile.avatarUrl} alt="Profil" fill className="object-cover" unoptimized />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-stone-800 truncate">{displayName || 'Mon profil'}</p>
            <p className="text-xs text-stone-400">Mon profil</p>
          </div>
        </Link>
        <button
          onClick={handleSignOut}
          className="mt-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-stone-400 hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 border-r border-stone-200/80 flex-col h-screen sticky top-0 shadow-[1px_0_0_0_rgba(0,0,0,0.04)]">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-stone-200 shadow-md"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 h-full shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
