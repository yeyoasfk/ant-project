import Link from 'next/link'
import Image from 'next/image'
import { cn } from '../lib/utils'
import { Home, CreditCard, PieChart, History, Settings } from 'lucide-react'
import Footer from './Footer'

// Definimos los links de navegación
const sidebarLinks = [
  { imgURL: Home, route: '/', label: 'Inicio' },
  { imgURL: CreditCard, route: '/my-banks', label: 'Mis Bancos' },
  { imgURL: History, route: '/transaction-history', label: 'Historial' },
]

const Sidebar = ({ user }: { user: any }) => {
  return (
    <section className="sticky left-0 top-0 flex h-screen w-fit flex-col justify-between border-r border-gray-200 bg-white text-gray-900 pt-6 sm:pt-8 px-3 sm:px-4 xl:p-6 xl:w-72 2xl:w-80">
      <nav className="flex flex-col gap-3 sm:gap-4">
        {/* LOGO */}
        <Link href="/" className="mb-8 sm:mb-12 cursor-pointer flex items-center gap-2">
          <Image 
            src="/icons/logo.png"
            width={36}
            height={36}
            alt="Hormiga logo"
            className="size-8 sm:size-10 xl:size-10"
          />
          <h1 className="hidden xl:block text-22 sm:text-24 xl:text-26 font-ibm-plex-serif font-bold text-black-1">
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
                "flex gap-3 items-center py-2.5 sm:py-3 px-2 sm:px-3 xl:px-4 rounded-lg",
                "justify-center xl:justify-start transition-all duration-200",
                "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <div className="relative size-5 sm:size-6">
                <item.imgURL className="size-5 sm:size-6" />
              </div>
              <p className={cn("hidden xl:block text-15 sm:text-16 font-semibold text-black-2")}>
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