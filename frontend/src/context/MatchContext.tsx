import React, { createContext, useContext, useState } from 'react';

// This is a placeholder interface - you'll need to update this when you create the fixture type
interface Fixture {
  event_key: string;
  event_home_team: string;
  event_away_team: string;
  [key: string]: any;
}

interface MatchContextType {
  selectedMatch: Fixture | null;
  setSelectedMatch: (match: Fixture | null) => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const MatchContext = createContext<MatchContextType>({
  selectedMatch: null,
  setSelectedMatch: () => {},
  isModalOpen: false,
  openModal: () => {},
  closeModal: () => {},
});

interface MatchProviderProps {
  children: React.ReactNode;
}

export const MatchProvider: React.FC<MatchProviderProps> = ({ children }) => {
  const [selectedMatch, setSelectedMatch] = useState<Fixture | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  const openModal = () => {
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  return (
    <MatchContext.Provider 
      value={{ 
        selectedMatch, 
        setSelectedMatch, 
        isModalOpen, 
        openModal, 
        closeModal 
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};

export const useMatch = () => useContext(MatchContext);