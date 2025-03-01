import React from "react";

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { label: string; value: T }[];
}

const SelectField = <T extends string>({
  label,
  value,
  onChange,
  options,
}: SelectFieldProps<T>) => {
  return (
    <div>
      <label className='block text-sm font-medium text-gray-700'>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className='mt-1 w-full p-2 border border-gray-300 rounded-lg text-black'
      >
        {options.map((option) => (
          <option
            className='text-black'
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
