import Link from 'next/link'
import Image from 'next/image'
import { cn } from '../lib/utils'
import { Home, CreditCard, History } from 'lucide-react'
import Footer from './Footer'

// Definimos los links de navegación - exportado para ser reutilizado en MobileNav
export const sidebarLinks = [
  { icon: Home, route: '/', label: 'Inicio' },
  { icon: CreditCard, route: '/my-banks', label: 'Mis Bancos' },
  { icon: History, route: '/transaction-history', label: 'Historial' },
]

const Sidebar = ({ user }: { user: any }) => {
  return (
    <section className={cn(
      "sticky left-0 top-0 flex h-screen flex-col justify-between pt-6 sm:pt-8",
      "bg-[#1f1019]/60 backdrop-blur-xl border-r border-white/10",
      "px-3 sm:px-4 xl:p-6",
      "w-fit xl:w-72 2xl:w-80",
      // Subtle inner glow on the right border
      "shadow-[inset_-1px_0_0_rgba(101,53,132,0.3)]"
    )}>
      <nav className="flex flex-col gap-2 sm:gap-3">
        {/* LOGO */}
        <Link href="/" className="mb-8 sm:mb-12 cursor-pointer flex items-center gap-3">
          <Image
            src="/icons/logo.png"
            width={36}
            height={36}
            alt="Hormiga logo"
            className="size-8 sm:size-10 xl:size-10 drop-shadow-[0_0_8px_rgba(101,53,132,0.8)]"
          />
          <h1 className="hidden xl:block text-22 sm:text-24 xl:text-26 font-ibm-plex-serif font-bold text-white">
            Hormiga
          </h1>
        </Link>

        {/* LINKS DE NAVEGACIÓN */}
        {sidebarLinks.map((item) => {
          return (
            <Link
              href={item.route}
              key={item.label}
              className={cn(
                "group relative flex gap-3 items-center py-3 px-3 xl:px-4 rounded-xl",
                "justify-center xl:justify-start transition-all duration-300",
                // Default dark state
                "text-gray-400 hover:text-white",
                // Glow background on hover
                "hover:bg-[#572371]/30 hover:shadow-[0_0_16px_rgba(101,53,132,0.4)]",
                "hover:border hover:border-[#572371]/60",
                "border border-transparent"
              )}
            >
              {/* Purple glow dot on hover */}
              <div className="relative size-5 sm:size-6 flex-shrink-0">
                <item.icon
                  className={cn(
                    "size-5 sm:size-6 transition-all duration-300",
                    "group-hover:drop-shadow-[0_0_8px_rgba(101,53,132,1)]"
                  )}
                />
              </div>
              <p className={cn("hidden xl:block text-15 sm:text-16 font-semibold transition-colors duration-300")}>
                {item.label}
              </p>
            </Link>
          )
        })}
      </nav>

      {/* FOOTER (Botón de Cerrar Sesión) */}
      <Footer user={user} />
    </section>
  )
}

export default Sidebar