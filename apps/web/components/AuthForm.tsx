"use client"

import Link from 'next/link'
import { useState } from 'react'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { authFormSchema } from '../lib/utils'
import CustomInput from './CustomInput'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {REGIONES , COMUNAS_SANTIAGO} from '../app/constants/index' // Importamos las listas

const AuthForm = ({ type }: { type: 'sign-in' | 'sign-up' }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    },
  })
 
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
       console.log("Datos validados:", data);
       await new Promise(resolve => setTimeout(resolve, 2000));
       
       if (type === 'sign-up') router.push('/connect-bank');
       else router.push('/');

    } catch (error) {
       console.log(error);
    } finally {
       setIsLoading(false);
    }
  }

  // Preparamos las opciones para los Selects
  const regionOptions = REGIONES.map(r => ({ label: r.name, value: r.name })); // Guardamos el nombre por simplicidad
  const comunaOptions = COMUNAS_SANTIAGO.map(c => ({ label: c, value: c }));

  return (
    <section className="flex min-h-screen w-full max-w-[420px] flex-col justify-center gap-5 py-6 md:gap-8">
        <header className="flex flex-col gap-5 md:gap-8">
            <div className="flex flex-col gap-1 md:gap-3">
                <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
                    {type === 'sign-in' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    <p className="text-16 font-normal text-gray-600">
                        {type === 'sign-in' ? 'Bienvenido de nuevo' : 'Únete a Hormiga hoy'}
                    </p>
                </h1>
            </div>
        </header>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {type === 'sign-up' && (
                <>
                    <div className="flex gap-4">
                        <CustomInput control={form.control} name="firstName" label="Nombre" placeholder="Ej: Diego" />
                        <CustomInput control={form.control} name="lastName" label="Apellido" placeholder="Ej: Hormiga" />
                    </div>
                    
                    <CustomInput control={form.control} name="address1" label="Dirección" placeholder="Ej: Av. Providencia 1234" />
                    
                    <div className="flex gap-4">
                        {/* SELECT DE REGIÓN */}
                        <CustomInput 
                            control={form.control} 
                            name="state" 
                            label="Región" 
                            inputType="select" 
                            options={regionOptions}
                        />
                        {/* SELECT DE COMUNA */}
                        <CustomInput 
                            control={form.control} 
                            name="city" 
                            label="Comuna" 
                            inputType="select" 
                            options={comunaOptions}
                        />
                    </div>
                    
                    <div className="flex gap-4">
                        {/* Fecha Inteligente */}
                        <CustomInput 
                            control={form.control} 
                            name="dateOfBirth" 
                            label="Fecha Nacimiento" 
                            placeholder="YYYY/MM/DD (Ej: 1999/01/01)" 
                        />
                        {/* RUT Chileno */}
                        <CustomInput 
                            control={form.control} 
                            name="rut" 
                            label="RUT" 
                            placeholder="11111111-1" 
                        />
                    </div>
                    
                    {/* Código Postal (Opcional) */}
                    <CustomInput control={form.control} name="postalCode" label="Código Postal (Opcional)" placeholder="Ej: 7500000" />
                </>
            )}

            <CustomInput control={form.control} name="email" label="Email" placeholder="Ingresa tu correo" />
            <CustomInput control={form.control} name="password" label="Contraseña" placeholder="********" type="password" />

            <div className="flex flex-col gap-4 pt-4">
                <button type="submit" disabled={isLoading} className="bg-bankGradient text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-form">
                    {isLoading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" /> Procesando...
                        </>
                    ) : type === 'sign-in' ? 'Ingresar' : 'Registrarse'}
                </button>
            </div>
        </form>

        <footer className="flex justify-center gap-1">
            <p className="text-14 font-normal text-gray-600">
                {type === 'sign-in' ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
            </p>
            <Link href={type === 'sign-in' ? '/sign-up' : '/sign-in'} className="text-14 cursor-pointer font-medium text-blue-600 hover:underline">
                {type === 'sign-in' ? "Regístrate" : "Inicia sesión"}
            </Link>
        </footer>
    </section>
  )
}

export default AuthForm