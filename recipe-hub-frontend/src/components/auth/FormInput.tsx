// recipe-hub-frontend\src\components\auth\FormInput.tsx

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  id: string;
}

const FormInput: React.FC<FormInputProps> = ({ 
  label, 
  error, 
  id,
  type = 'text',
  ...props 
}) => {
  return (
    <div className="space-y-1">
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-brown"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        className={`block w-full px-3 py-2 bg-cream border rounded-md
                   text-brown placeholder-tan/60 
                   focus:outline-none focus:ring-2 focus:ring-brown/50
                   ${error ? 'border-red-500' : 'border-tan'}`}
        {...props}
      />
      {error && (
        <div className="flex items-center mt-1 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormInput;