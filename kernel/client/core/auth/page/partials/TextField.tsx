import { FC, ReactElement, ChangeEvent } from "react";
import FormError from "@/core/auth/page/partials/FormError";
import { ErrorType } from "@/core/types/errors";

interface TextFieldProps {
  label: string;
  error?: string;
  errorType?: ErrorType;
  value: string;
  disabled: boolean;
  placeholder: string;
  startIcon: ReactElement;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const TextField: FC<TextFieldProps> = ({
  label,
  error,
  errorType,
  value,
  disabled,
  onChange,
  startIcon,
  placeholder,
}) => (
  <div className="flex flex-col gap-2">
    <span className="text-[0.95rem] text-gray-500">{label}</span>
    <div
      className={`
        flex items-center gap-3 px-4 py-3 border-1 
        ${error ? "border-[#ed3135]" : "border-gray-200"}
        rounded-lg ${disabled ? "bg-gray-100" : "bg-[#fcfcfc]"}
        ${error ? "focus-within:border-[#ed3135]" : "focus-within:border-[#333]"}
        transition-colors duration-200
      `}
    >
      {startIcon}
      <input
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full text-[0.95rem] focus:outline-none bg-transparent
          ${disabled ? "text-gray-400" : "text-[#333]"}
          placeholder:text-gray-400
        `}
      />
    </div>
    {error && <FormError message={error} type={errorType} />}
  </div>
);

export default TextField;
