import { FC, useState, ReactElement, ChangeEvent } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import FormError from "@/core/auth/page/partials/FormError";
import { ErrorType } from "@/core/types/errors";

interface SecretFieldProps {
  label: string;
  value: string;
  error?: string;
  errorType?: ErrorType;
  disabled: boolean;
  placeholder: string;
  startIcon: ReactElement;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const SecretField: FC<SecretFieldProps> = ({
  label,
  error,
  errorType,
  value,
  disabled,
  onChange,
  startIcon,
  placeholder,
}) => {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[0.95rem] text-gray-500">{label}</span>
      <div
        className={`flex items-center gap-3 px-4 py-3 border-1 
        ${error ? "border-[#ed3135]" : "border-gray-200"} rounded-lg 
        ${disabled ? "bg-gray-100" : "bg-[#fcfcfc]"}
        ${error ? "focus-within:border-[#ed3135]" : "focus-within:border-[#333]"}
        transition-colors duration-200
      `}
      >
        {startIcon}
        <input
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          type={show && !disabled ? "text" : "password"}
          className={`w-full text-[0.95rem] focus:outline-none bg-transparent 
            ${disabled ? "text-gray-400" : "text-[#333]"}
            placeholder:text-gray-400
          `}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => setShow(!show)}
          className={`mt-[0.15rem] flex-none 
            ${disabled ? "text-gray-400" : "text-[#a19c9c] cursor-pointer"}`}
        >
          {show && !disabled ? <FiEye size={16} /> : <FiEyeOff size={16} />}
        </button>
      </div>
      {error && <FormError message={error} type={errorType} />}
    </div>
  );
};

export default SecretField;
