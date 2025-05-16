
import { useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  error?: string;
  autoFocus?: boolean;
  className?: string;
}

export const InputField = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  showPassword,
  onTogglePassword,
  error,
  autoFocus,
  className = ''
}: InputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const isPassword = name.toLowerCase().includes('password');
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  
  return (
    <div className={`relative ${className}`}>
      <label 
        htmlFor={name}
        className="block text-sm font-medium leading-6 text-gray-300 mb-2"
      >
        {label}
      </label>
      
      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            block w-full rounded-md border-0 py-2.5 px-3
            text-white bg-white/5 shadow-sm 
            transition-all duration-200
            focus:ring-2 
            ${error ? 'ring-1 ring-red-500 focus:ring-red-500' : 'focus:ring-sky-500'}
            outline-none 
            placeholder:text-gray-600
            ${isFocused ? 'bg-white/10' : ''}
          `}
        />
        
        {isPassword && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
          >
            {showPassword ? (
              <AiOutlineEyeInvisible className="text-xl" />
            ) : (
              <AiOutlineEye className="text-xl" />
            )}
          </button>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};