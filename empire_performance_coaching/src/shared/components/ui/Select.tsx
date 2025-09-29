import React, { useState } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "../../utils/cn";
import Button from "./Button";
import Input from "./Input";
import { SelectOption } from "../../types";

export interface SelectProps {
  className?: string;
  options?: SelectOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  placeholder?: string;
  multiple?: boolean;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  description?: string;
  error?: string;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  id?: string;
  name?: string;
  onChange?: (value: string | string[]) => void;
  onOpenChange?: (open: boolean) => void;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(({
  className,
  options = [],
  value,
  defaultValue,
  placeholder = "Select an option",
  multiple = false,
  disabled = false,
  required = false,
  label,
  description,
  error,
  searchable = false,
  clearable = false,
  loading = false,
  id,
  name,
  onChange,
  onOpenChange,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Generate unique ID if not provided
  const selectId = id || `select-${Math.random()?.toString(36)?.substr(2, 9)}`;

  // Filter options based on search
  const filteredOptions = searchable && searchTerm
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (option.value && option.value.toString().toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : options;

  // Get selected option(s) for display
  const getSelectedDisplay = (): string => {
    if (!value) return placeholder;

    if (multiple && Array.isArray(value)) {
      const selectedOptions = options.filter(opt => value.includes(opt.value));
      if (selectedOptions.length === 0) return placeholder;
      if (selectedOptions.length === 1) return selectedOptions[0]!.label;
      return `${selectedOptions.length} items selected`;
    }

    if (!multiple && typeof value === 'string') {
      const selectedOption = options.find(opt => opt.value === value);
      return selectedOption ? selectedOption.label : placeholder;
    }

    return placeholder;
  };

  const handleToggle = (): void => {
    if (!disabled) {
      const newIsOpen = !isOpen;
      setIsOpen(newIsOpen);
      onOpenChange?.(newIsOpen);
      if (!newIsOpen) {
        setSearchTerm("");
      }
    }
  };

  const handleOptionSelect = (option: SelectOption): void => {
    if (multiple && Array.isArray(value)) {
      const newValue = value || [];
      const updatedValue = newValue.includes(option.value)
        ? newValue.filter(v => v !== option.value)
        : [...newValue, option.value];
      onChange?.(updatedValue);
    } else {
      onChange?.(option.value);
      setIsOpen(false);
      onOpenChange?.(false);
    }
  };

  const handleClear = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onChange?.(multiple ? [] : '');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const isSelected = (optionValue: string): boolean => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };

  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : value !== undefined && value !== '';

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label
          htmlFor={selectId}
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block",
            error ? "text-red-500" : "text-[#F5F5F5]"
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          ref={ref}
          id={selectId}
          type="button"
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-[#2A2A2E] bg-gradient-to-br from-[#1A1A1D] to-[#141416] text-[#F5F5F5] px-3 py-2 text-sm placeholder:text-[#CFCFCF] focus:outline-none focus:ring-2 focus:ring-[#C9A43B] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus:ring-red-500",
            !hasValue && "text-[#CFCFCF]"
          )}
          onClick={handleToggle}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          {...props}
        >
          <span className="truncate">{getSelectedDisplay()}</span>

          <div className="flex items-center gap-1">
            {loading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}

            {clearable && hasValue && !loading && (
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4"
                onClick={handleClear}
              >
                <X className="h-3 w-3" />
              </Button>
            )}

            <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
          </div>
        </button>

        {/* Hidden native select for form submission */}
        <select
          name={name}
          value={Array.isArray(value) ? value : (value || '')}
          onChange={() => { }} // Controlled by our custom logic
          className="sr-only"
          tabIndex={-1}
          multiple={multiple}
          required={required}
        >
          <option value="">Select...</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-gradient-to-br from-[#1A1A1D] to-[#141416] text-[#F5F5F5] border border-[#2A2A2E] rounded-md shadow-md">
            {searchable && (
              <div className="p-2 border-b border-[#2A2A2E]">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#CFCFCF]" />
                  <Input
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-8"
                  />
                </div>
              </div>
            )}

            <div className="py-1 max-h-60 overflow-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-[#CFCFCF]">
                  {searchTerm ? 'No options found' : 'No options available'}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-[#C9A43B]/20 hover:text-[#C9A43B]",
                      isSelected(option.value) && "bg-[#C9A43B] text-black",
                      option.disabled && "pointer-events-none opacity-50"
                    )}
                    onClick={() => !option.disabled && handleOptionSelect(option)}
                  >
                    <span className="flex-1">{option.label}</span>
                    {multiple && isSelected(option.value) && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {description && !error && (
        <p className="text-sm text-[#CFCFCF] mt-1">
          {description}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = "Select";

export default Select;