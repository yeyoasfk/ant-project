import { Control, Controller } from 'react-hook-form'
import { cn } from '../lib/utils'

interface CustomInputProps {
  control: Control<any>,
  name: string,
  label: string,
  placeholder?: string,
  type?: string,
  inputType?: 'input' | 'select', 
  options?: { label: string, value: string }[] 
}

const CustomInput = ({ 
  control, 
  name, 
  label, 
  placeholder, 
  type = "text", 
  inputType = 'input',
  options = []
}: CustomInputProps) => {

  // 🧠 Lógica de Formato de Fecha (YYYY/MM/DD)
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    let value = e.target.value.replace(/\D/g, ''); // 1. Eliminar todo lo que no sea número
    
    if (value.length > 8) value = value.slice(0, 8); // Máximo 8 dígitos (YYYYMMDD)

    // 2. Aplicar la máscara YYYY/MM/DD
    if (value.length > 4) {
      value = `${value.slice(0, 4)}/${value.slice(4)}`;
    }
    if (value.length > 7) {
      value = `${value.slice(0, 7)}/${value.slice(7)}`;
    }

    onChange(value); // Enviar el valor formateado al formulario
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-14 font-medium text-gray-700">
        {label}
      </label>
      <div className="flex w-full flex-col">
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, value, ...fieldProps }, fieldState: { error } }) => (
            <>
                {inputType === 'select' ? (
                  <select
                    {...fieldProps}
                    value={value || ''}
                    onChange={onChange}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-14 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="" disabled>Seleccionar...</option>
                    {options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input 
                    {...fieldProps}
                    value={value || ''}
                    type={type}
                    placeholder={placeholder}
                    // AQUÍ ESTÁ EL TRUCO 👇
                    onChange={(e) => {
                        if (name === 'dateOfBirth') {
                            handleDateChange(e, onChange);
                        } else {
                            onChange(e);
                        }
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-14 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                )}
                
                {error && (
                    <span className="text-12 text-red-500 mt-1 font-medium animate-pulse">
                        {error.message}
                    </span>
                )}
            </>
          )}
        />
      </div>
    </div>
  )
}

export default CustomInput