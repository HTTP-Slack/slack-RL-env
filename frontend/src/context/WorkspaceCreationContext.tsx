import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface WorkspaceCreationContextType {
  userName: string;
  setUserName: (name: string) => void;
  userPhoto: string | null;
  setUserPhoto: (photo: string | null) => void;
  workspaceName: string;
  setWorkspaceName: (name: string) => void;
  workspaceId: string | null;
  setWorkspaceId: (id: string | null) => void;
  inviteEmails: string[];
  setInviteEmails: (emails: string[]) => void;
  selectedPlan: 'free' | 'pro' | null;
  setSelectedPlan: (plan: 'free' | 'pro' | null) => void;
  resetWorkspaceCreation: () => void;
}

const WorkspaceCreationContext = createContext<WorkspaceCreationContextType | undefined>(undefined);

export const WorkspaceCreationProvider = ({ children }: { children: ReactNode }) => {
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | null>(null);

  const resetWorkspaceCreation = () => {
    setUserName('');
    setUserPhoto(null);
    setWorkspaceName('');
    setWorkspaceId(null);
    setInviteEmails([]);
    setSelectedPlan(null);
  };

  return (
    <WorkspaceCreationContext.Provider
      value={{
        userName,
        setUserName,
        userPhoto,
        setUserPhoto,
        workspaceName,
        setWorkspaceName,
        workspaceId,
        setWorkspaceId,
        inviteEmails,
        setInviteEmails,
        selectedPlan,
        setSelectedPlan,
        resetWorkspaceCreation,
      }}
    >
      {children}
    </WorkspaceCreationContext.Provider>
  );
};

export const useWorkspaceCreation = () => {
  const context = useContext(WorkspaceCreationContext);
  if (!context) {
    throw new Error('useWorkspaceCreation must be used within WorkspaceCreationProvider');
  }
  return context;
};
