import Image from "next/image";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative flex flex-col lg:flex-row min-h-screen w-full justify-between font-inter bg-[#110916] overflow-hidden">

      {/* ── Mesh Gradient blobs (decorativo, igual que el dashboard) ── */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#3b174d]/60 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full bg-[#572371]/40 blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 w-[350px] h-[350px] rounded-full bg-[#2d183b]/70 blur-[90px]" />
      </div>

      {/* ── Lado Izquierdo: Formulario ─────────────────────────────── */}
      <div className="relative z-10 flex flex-col justify-center items-center w-full lg:w-1/2 px-4 sm:px-6 md:px-10 py-8 sm:py-10 md:py-0">

        {/* Panel glassmorphism centrado en mobile, sin panel en desktop (el fondo ya tiene blobs) */}
        <div className="w-full max-w-md md:max-w-lg bg-[#1f1019]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">

          {/* Logo */}
          <div className="mb-6 sm:mb-8 flex items-center gap-2.5">
            <div className="flex size-10 sm:size-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b174d] to-[#653584] shadow-glow-purple">
              <Image
                src="/icons/logo.png"
                width={28}
                height={28}
                alt="Hormiga Logo"
                className="sm:w-8 sm:h-8"
              />
            </div>
            <h1 className="text-22 sm:text-26 md:text-28 lg:text-32 font-bold font-ibm-plex-serif text-white tracking-wide">
              HORMIGA
            </h1>
          </div>

          {children}
        </div>
      </div>

      {/* ── Lado Derecho: Panel decorativo (Solo Desktop) ─────────── */}
      <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden z-10">
        {/* Glassmorphism panel for the right side content */}
        <div className="m-10 xl:m-16 w-full h-full max-h-[85vh] rounded-3xl bg-gradient-to-br from-[#3b174d]/80 via-[#572371]/60 to-[#2d183b]/80 backdrop-blur-sm border border-white/10 flex items-center justify-center relative overflow-hidden shadow-2xl">

          {/* Inner glow overlay */}
          <div className="absolute inset-0 bg-[url('/icons/gradient-mesh.svg')] opacity-10 bg-cover" />

          {/* Purple decorative circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#653584]/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#3b174d]/40 blur-3xl" />

          {/* Content */}
          <div className="text-white text-center p-8 lg:p-10 z-10 max-w-xl relative">
            {/* Decorative icon */}
            <div className="flex justify-center mb-6">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-white/10 border border-white/20 shadow-glow-purple">
                <Image src="/icons/logo.png" width={40} height={40} alt="Hormiga" />
              </div>
            </div>
            <h2 className="text-28 lg:text-32 xl:text-36 font-bold mb-4 leading-tight">
              Gestiona tus<br />
              <span className="text-[#9d6dc0]">gastos hormiga</span>
            </h2>
            <p className="text-14 lg:text-16 text-white/60 leading-relaxed">
              La forma más inteligente de detectar y eliminar pequeños gastos que se acumulan sin que te des cuenta.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {['📊 Análisis', '🏦 Open Banking', '🐜 Gastos Hormiga', '📅 Historial'].map(text => (
                <span key={text} className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-13 font-medium backdrop-blur-sm">
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}