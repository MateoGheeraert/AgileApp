import React from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: "button" | "a"; // Allow button or link behavior
  href?: string; // URL for anchor links
  variant?: "primary" | "secondary" | "danger" | "outline";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  as = "button",
  href = "#",
  children,
  variant = "primary",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  ...props
}) => {
  const baseStyles =
    "px-6 py-3 text-lg rounded-lg font-semibold transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center";

  const variants = {
    primary:
      "bg-primaryBlue-500 text-white hover:bg-primaryBlue-600 focus:ring-primaryBlue-500",
    secondary: "bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
    outline:
      "border border-primaryBlue-500 text-primaryBlue-500 hover:bg-primaryBlue-100 focus:ring-primaryBlue-500",
  };

  if (as === "a") {
    return (
      <Link
        href={href}
        className={`${baseStyles} ${variants[variant]} ${className}`}
      >
        {isLoading && <span className='mr-2 animate-spin'>⏳</span>}
        {leftIcon && <span className='mr-2'>{leftIcon}</span>}
        {children}
        {rightIcon && <span className='ml-2'>{rightIcon}</span>}
      </Link>
    );
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
      disabled={isLoading || props.disabled}
    >
      {isLoading && <span className='mr-2 animate-spin'>⏳</span>}
      {leftIcon && <span className='mr-2'>{leftIcon}</span>}
      {children}
      {rightIcon && <span className='ml-2'>{rightIcon}</span>}
    </button>
  );
};

export default Button;
