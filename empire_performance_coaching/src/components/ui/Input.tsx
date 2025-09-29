import React from "react";
import { cn } from "../../utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className,
  type = "text",
  label,
  description,
  error,
  required = false,
  id,
  ...props
}, ref) => {
  // Generate unique ID if not provided
  const inputId = id || `input-${Math.random()?.toString(36)?.substr(2, 9)}`;

  // Base input classes
  const baseInputClasses = "flex h-10 w-full rounded-md border border-[#2A2A2E] bg-gradient-to-br from-[#1A1A1D] to-[#141416] px-3 py-2 text-sm text-[#F5F5F5] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#CFCFCF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A43B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  // Checkbox-specific styles
  if (type === "checkbox") {
    return (
      <input
        type="checkbox"
        className={cn(
          "h-4 w-4 rounded border border-[#2A2A2E] bg-gradient-to-br from-[#1A1A1D] to-[#141416] text-[#C9A43B] focus:ring-2 focus:ring-[#C9A43B] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        id={inputId}
        {...props}
      />
    );
  }

  // Radio button-specific styles
  if (type === "radio") {
    return (
      <input
        type="radio"
        className={cn(
          "h-4 w-4 rounded-full border border-[#2A2A2E] bg-gradient-to-br from-[#1A1A1D] to-[#141416] text-[#C9A43B] focus:ring-2 focus:ring-[#C9A43B] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        id={inputId}
        {...props}
      />
    );
  }

  // For regular inputs with wrapper structure
  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            error ? "text-red-500" : "text-[#F5F5F5]"
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <input
        type={type}
        className={cn(
          baseInputClasses,
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        ref={ref}
        id={inputId}
        {...props}
      />

      {description && !error && (
        <p className="text-sm text-[#CFCFCF]">
          {description}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;