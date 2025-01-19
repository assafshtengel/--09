import React from "react";
import { Input } from "@/components/ui/input";

interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  accept?: string;
  required?: boolean;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FormField = ({ 
  id, 
  label, 
  value, 
  onChange, 
  type = "text",
  placeholder,
  accept,
  required,
  onFileChange
}: FormFieldProps) => {
  return (
    <div>
      <label htmlFor={id} className="block text-right mb-2">{label}</label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onFileChange ? onFileChange : (e) => onChange(e.target.value)}
        className="text-right"
        placeholder={placeholder}
        accept={accept}
        required={required}
      />
    </div>
  );
};