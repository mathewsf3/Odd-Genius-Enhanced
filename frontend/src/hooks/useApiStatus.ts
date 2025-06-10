import { useApiStatus as useContextApiStatus } from '../context/ApiStatusContext';

export const useApiStatus = () => {
  const context = useContextApiStatus();
  return context;
};