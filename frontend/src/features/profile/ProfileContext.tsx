import { createContext, useContext, useState, ReactNode } from 'react';
import type { User } from '../../services/messageApi';

interface ProfileContextType {
  isPanelOpen: boolean;
  isEditModalOpen: boolean;
  isUserProfileModalOpen: boolean;
  selectedUser: User | null;
  openPanel: () => void;
  closePanel: () => void;
  openEditModal: () => void;
  closeEditModal: () => void;
  openUserProfile: (user: User) => void;
  closeUserProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

  const openUserProfile = (user: User) => {
    setSelectedUser(user);
    setIsUserProfileModalOpen(true);
  };

  const closeUserProfile = () => {
    setIsUserProfileModalOpen(false);
    setSelectedUser(null);
  };

  const value: ProfileContextType = {
    isPanelOpen,
    isEditModalOpen,
    isUserProfileModalOpen,
    selectedUser,
    openPanel,
    closePanel,
    openEditModal,
    closeEditModal,
    openUserProfile,
    closeUserProfile,
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

