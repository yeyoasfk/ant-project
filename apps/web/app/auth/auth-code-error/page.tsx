import Link from 'next/link'

const AuthCodeError = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="max-w-md space-y-4 rounded-xl bg-white p-8 shadow-md">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100">
          ⚠️
        </div>
        <h1 className="text-xl font-bold text-gray-900">Link Inválido o Expirado</h1>
        <p className="text-gray-500">
          No pudimos verificar tu correo. Esto suele pasar si el enlace ya fue utilizado o si pasaron muchas horas desde que se envió.
        </p>
        <Link 
          href="/sign-in"
          className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Volver a Iniciar Sesión
        </Link>
      </div>
    </div>
  )
}

export default AuthCodeError