
import React from 'react';
import { CgSpinner } from 'react-icons/cg';

interface AuthButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'google';
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  fullWidth?: boolean;
  className?: string;
}

export const AuthButton = ({
  children,
  loading = false,
  variant = 'primary',
  type = 'button',
  onClick,
  fullWidth = false,
  className = ''
}: AuthButtonProps) => {
  const baseClasses = `
    relative flex items-center justify-center
    px-4 py-3 rounded-md font-medium
    transition-all duration-200
    disabled:opacity-70 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;
  
  const variantClasses = {
    primary: `
      bg-sky-600 hover:bg-sky-700 text-white
      shadow-md hover:shadow-lg
    `,
    google: `
      bg-white hover:bg-gray-100 text-gray-800
      border border-gray-300
      shadow-md hover:shadow-lg
    `
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {loading ? (
        <>
          <CgSpinner className="absolute left-4 animate-spin text-xl" />
          <span>Procesando...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};