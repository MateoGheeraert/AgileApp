import React from "react";

interface InputFieldProps {
  label: string;
  type?: "text" | "date" | "number" | "email" | "password";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  step?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  min,
  max,
  step,
}) => {
  return (
    <div>
      <label className='block text-sm font-medium text-gray-700'>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='w-full p-2 border border-gray-300 rounded-lg mt-1 text-black'
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
};

export default InputField;
