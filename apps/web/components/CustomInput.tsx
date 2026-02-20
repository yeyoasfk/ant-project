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
    let value = e.target.value.replace(/\D/g, '');

    if (value.length > 8) value = value.slice(0, 8);

    if (value.length > 4) {
      value = `${value.slice(0, 4)}/${value.slice(4)}`;
    }
    if (value.length > 7) {
      value = `${value.slice(0, 7)}/${value.slice(7)}`;
    }

    onChange(value);
  };

  const sharedClass = cn(
    "rounded-xl border border-white/10 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5",
    "text-12 sm:text-13 md:text-14 text-gray-100",
    "bg-[#2d183b]/60 backdrop-blur-sm",
    "placeholder:text-gray-600",
    "focus:border-[#572371] focus:outline-none focus:ring-1 focus:ring-[#572371]/60",
    "transition-colors w-full"
  );

  return (
    <div className="flex flex-col gap-1 sm:gap-1.5 w-full">
      <label className="text-12 sm:text-13 md:text-14 font-medium text-gray-400">
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
                  className={cn(sharedClass, "appearance-none cursor-pointer")}
                >
                  <option value="" disabled className="bg-[#1f1019] text-gray-400">Seleccionar...</option>
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#1f1019] text-gray-100">
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
                  onChange={(e) => {
                    if (name === 'dateOfBirth') {
                      handleDateChange(e, onChange);
                    } else {
                      onChange(e);
                    }
                  }}
                  className={sharedClass}
                />
              )}

              {error && (
                <span className="text-11 sm:text-12 text-red-400 mt-1 font-medium animate-pulse">
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