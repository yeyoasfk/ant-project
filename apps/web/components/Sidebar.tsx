import Link from 'next/link'
import Image from 'next/image'
import { cn } from '../lib/utils'
import { Home, CreditCard, PieChart, History, Settings } from 'lucide-react' // Asegúrate de tener estos iconos o los que uses
import Footer from './Footer' // 👈 Importamos el nuevo componente

// Definimos los links de navegación
const sidebarLinks = [
  { imgURL: Home, route: '/', label: 'Inicio' },
  { imgURL: CreditCard, route: '/my-banks', label: 'Mis Bancos' },
  { imgURL: History, route: '/transaction-history', label: 'Historial' },
  // { imgURL: PieChart, route: '/budgets', label: 'Presupuestos' }, 
]

const Sidebar = ({ user }: { user: any }) => {
  return (
    <section className="sticky left-0 top-0 flex h-screen w-fit flex-col justify-between border-r border-gray-200 bg-white pt-8 text-white max-md:hidden sm:p-4 xl:p-6 2xl:w-[355px]">
      <nav className="flex flex-col gap-4">
        {/* LOGO */}
        <Link href="/" className="mb-12 cursor-pointer flex items-center gap-2 px-4">
          <Image 
            src="/icons/logo.png" // 👈 Cambiado de emoji a tu archivo PNG real
            width={40}
            height={40}
            alt="Hormiga logo"
            className="size-[40px]"
          />
          <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1 max-xl:hidden">
            Hormiga
          </h1>
        </Link>

        {/* LINKS DE NAVEGACIÓN */}
        {sidebarLinks.map((item) => {
          // Podemos agregar lógica para saber si está activo (pathname) si la necesitamos luego
          return (
            <Link href={item.route} key={item.label} className={cn("flex gap-3 items-center py-3 md:p-3 2xl:p-4 rounded-lg justify-center xl:justify-start hover:bg-gray-100 transition-colors text-gray-700")}>
              <div className="relative size-6">
                <item.imgURL className="size-6" />
              </div>
              <p className={cn("text-16 font-semibold text-black-2 max-xl:hidden")}>
                {item.label}
              </p>
            </Link>
          )
        })}
      </nav>

      {/* FOOTER (Aquí va el botón de Cerrar Sesión) */}
      <Footer user={user} />
    </section>
  )
}

export default Sidebar