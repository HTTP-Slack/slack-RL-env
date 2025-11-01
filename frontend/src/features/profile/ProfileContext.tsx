import { createContext, useContext, useState, ReactNode } from 'react';

interface ProfileContextType {
  isPanelOpen: boolean;
  isEditModalOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  openEditModal: () => void;
  closeEditModal: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const openPanel = () => {
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
  };

  const openEditModal = () => {
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const value: ProfileContextType = {
    isPanelOpen,
    isEditModalOpen,
    openPanel,
    closePanel,
    openEditModal,
    closeEditModal,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

