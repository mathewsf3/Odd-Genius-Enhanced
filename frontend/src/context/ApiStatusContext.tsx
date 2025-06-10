import React, { createContext, useState, useContext } from 'react';

interface ApiStatusContextType {
  isConnected: boolean;
  setConnected: () => void;
  setDisconnected: () => void;
}

const ApiStatusContext = createContext<ApiStatusContextType>({
  isConnected: true,
  setConnected: () => {},
  setDisconnected: () => {},
});

interface ApiStatusProviderProps {
  children: React.ReactNode;
}

export const ApiStatusProvider: React.FC<ApiStatusProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  
  const setConnected = () => {
    setIsConnected(true);
  };
  
  const setDisconnected = () => {
    setIsConnected(false);
  };
  
  return (
    <ApiStatusContext.Provider value={{ isConnected, setConnected, setDisconnected }}>
      {children}
    </ApiStatusContext.Provider>
  );
};

export const useApiStatus = () => useContext(ApiStatusContext);