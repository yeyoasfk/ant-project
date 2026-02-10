"use client"

import Link from 'next/link'
import { useState } from 'react'
import { z } from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form"
import { authFormSchema } from '../lib/utils'
import CustomInput from './CustomInput'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase/client'
import { REGIONES, COMUNAS_SANTIAGO } from '../app/constants'

const AuthForm = ({ type }: { type: 'sign-in' | 'sign-up' }) => {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // 1. Esquema de validación (El que ya tiene RUT estricto, fecha inteligente y pass fuerte)
  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    },
  })
 
  // 2. Manejo del Envío
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
       if (type === 'sign-up') {
           // --- REGISTRO ---
           const { data: newUser, error } = await supabase.auth.signUp({
               email: data.email,
               password: data.password,
               options: {
                   emailRedirectTo: `${location.origin}/auth/callback`,
                   data: {
                       first_name: data.firstName,
                       last_name: data.lastName,
                       rut: data.rut,
                       address: data.address1,
                       city: data.city,
                       state: data.state,
                       dob: data.dateOfBirth
                   }
               }
           });

           if (error) throw error;

           setSuccessMessage("¡Cuenta creada! Revisa tu correo (o Mailtrap) para activar tu cuenta.");
       
       } else {
           // --- LOGIN ---
           const { error } = await supabase.auth.signInWithPassword({
               email: data.email,
               password: data.password,
           });

           if (error) throw error;

           router.push('/');
           router.refresh();
       }

    } catch (error: any) {
       console.error(error);
       setErrorMessage(error.message === "Email not confirmed" 
         ? "Debes confirmar tu correo electrónico antes de ingresar."
         : error.message || "Error de autenticación."
       );
    } finally {
       setIsLoading(false);
    }
  }

  // Preparamos las opciones para los Selects
  const regionOptions = REGIONES.map(r => ({ label: r.name, value: r.name }));
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
        
        {/* ALERTAS */}
        {successMessage && (
            <div className="p-4 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                ✅ {successMessage}
            </div>
        )}

        {errorMessage && (
            <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                ⚠️ {errorMessage}
            </div>
        )}

        {!successMessage && (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {type === 'sign-up' && (
                    <>
                        <div className="flex gap-4">
                            <CustomInput control={form.control} name="firstName" label="Nombre" placeholder="Ej: Diego" />
                            <CustomInput control={form.control} name="lastName" label="Apellido" placeholder="Ej: Hormiga" />
                        </div>
                        
                        <CustomInput control={form.control} name="address1" label="Dirección" placeholder="Ej: Av. Providencia 1234" />
                        
                        <div className="flex gap-4">
                            {/* ✅ SELECT DE REGIÓN */}
                            <CustomInput 
                                control={form.control} 
                                name="state" 
                                label="Región" 
                                inputType="select" 
                                options={regionOptions}
                            />
                            {/* ✅ SELECT DE COMUNA */}
                            <CustomInput 
                                control={form.control} 
                                name="city" 
                                label="Comuna" 
                                inputType="select" 
                                options={comunaOptions}
                            />
                        </div>
                        
                        <div className="flex gap-4">
                            {/* ✅ FECHA CON MÁSCARA AUTOMÁTICA (CustomInput maneja el /) */}
                            <CustomInput 
                                control={form.control} 
                                name="dateOfBirth" 
                                label="Fecha Nacimiento" 
                                placeholder="YYYY/MM/DD" 
                            />
                            {/* ✅ RUT (Validación estricta en utils) */}
                            <CustomInput 
                                control={form.control} 
                                name="rut" 
                                label="RUT" 
                                placeholder="11111111-1" 
                            />
                        </div>
                        
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
        )}

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