import { FC } from "react";
import { FiAlertCircle, FiInfo } from "react-icons/fi";
import { ErrorType } from "@/core/types/errors";

interface FormErrorProps {
  message: string;
  type?: ErrorType;
}

const FormError: FC<FormErrorProps> = ({ 
  message, 
  type = 'validation'
}) => {
  const getErrorStyles = () => {
    const styles = {
      validation: {
        icon: <FiAlertCircle className="flex-shrink-0 text-red-500" size={14} />,
        text: 'text-red-600'
      },
      authentication: {
        icon: <FiAlertCircle className="flex-shrink-0 text-orange-500" size={14} />,
        text: 'text-orange-600'
      },
      network: {
        icon: <FiInfo className="flex-shrink-0 text-yellow-500" size={14} />,
        text: 'text-yellow-600'
      },
      server: {
        icon: <FiAlertCircle className="flex-shrink-0 text-red-600" size={14} />,
        text: 'text-red-700'
      },
      timeout: {
        icon: <FiAlertCircle className="flex-shrink-0 text-yellow-500" size={14} />,
        text: 'text-yellow-600'
      }
    };
    return styles[type] || styles.validation;
  };

  const styles = getErrorStyles();

  return (
    <div 
      className="flex items-center gap-2 mt-1"
      role="alert"
      aria-live="polite"
    >
      {styles.icon}
      <span className={`text-sm ${styles.text} leading-tight`}>
        {message}
      </span>
    </div>
  );
};

export default FormError;
