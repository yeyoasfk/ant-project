'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '../lib/utils'
import { Home, CreditCard, Receipt, Building2 } from 'lucide-react' // Íconos

const sidebarLinks = [
  {
    imgURL: Home,
    route: '/',
    label: 'Inicio',
  },
  {
    imgURL: Building2,
    route: '/my-banks',
    label: 'Mis Bancos',
  },
  {
    imgURL: Receipt,
    route: '/transaction-history',
    label: 'Historial',
  },
  {
    imgURL: CreditCard,
    route: '/connect-bank', // Temporal, luego lo ocultaremos si ya tiene banco
    label: 'Conectar Banco',
  },
];

const Sidebar = ({ user }: { user: any }) => {
  const pathname = usePathname();

  return (
    <section className="sticky left-0 top-0 flex h-screen w-fit flex-col justify-between border-r border-gray-200 bg-white pt-8 max-md:hidden sm:p-4 xl:p-6 2xl:w-[355px]">
      <nav className="flex flex-col gap-4">
        <Link href="/" className="mb-12 cursor-pointer flex items-center gap-2">
          <div className="relative size-10">
             {/* Asegúrate de tener logo.svg en public/icons/ */}
             <Image 
               src="/icons/logo.png" 
               width={40} 
               height={40} 
               alt="Hormiga Logo" 
               className="size-[40px] max-xl:size-14"
             />
          </div>
          <h1 className="sidebar-logo text-2xl font-ibm-plex-serif font-bold text-black-1 max-xl:hidden">
            HORMIGA
          </h1>
        </Link>

        {sidebarLinks.map((item) => {
          const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`)

          return (
            <Link href={item.route} key={item.label}
              className={cn('sidebar-link flex gap-3 items-center py-3 px-4 rounded-lg justify-start', { 'bg-bank-gradient': isActive })}
            >
              <div className="relative size-6">
                <item.imgURL className={cn("size-6", { "text-white": isActive, "text-gray-500": !isActive })} />
              </div>
              <p className={cn('text-16 font-semibold text-black-2 max-xl:hidden', { '!text-white': isActive })}>
                {item.label}
              </p>
            </Link>
          )
        })}
      </nav>

      {/* Footer del Sidebar (Usuario) */}
      <div className="flex items-center gap-2 p-4 rounded-lg bg-gray-50 border border-gray-200">
          <div className="size-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-700">
              {/* Iniciales temporales */}
              {user?.firstName?.[0] || 'U'}
          </div>
          <div className="flex flex-col max-xl:hidden">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.firstName || 'Usuario'}</p>
              <p className="text-xs text-gray-600 truncate">{user?.email || 'user@hormiga.cl'}</p>
          </div>
      </div>
    </section>
  )
}

export default Sidebar