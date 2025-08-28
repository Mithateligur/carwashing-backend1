import { toast } from 'react-toastify';

export const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'warning':
      toast.warning(message);
      break;
    default:
      toast.info(message);
  }
};

export const Toast: React.FC = () => {
  return null; // This component is just for the showToast function
};
