import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { UserPreferences } from './types';
import { DEFAULT_PREFERENCES } from './defaults';
import { PreferencesStorage } from './storage';

interface PreferencesState {
  preferences: UserPreferences;
  isModalOpen: boolean;
}

type PreferencesAction =
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'RESET_PREFERENCES' }
  | { type: 'LOAD_PREFERENCES'; payload: UserPreferences }
  | { type: 'OPEN_MODAL' }
  | { type: 'CLOSE_MODAL' };

interface PreferencesContextType {
  preferences: UserPreferences;
  isModalOpen: boolean;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  openModal: () => void;
  closeModal: () => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

function preferencesReducer(state: PreferencesState, action: PreferencesAction): PreferencesState {
  switch (action.type) {
    case 'UPDATE_PREFERENCES': {
      const updated = deepMerge(state.preferences, action.payload);
      PreferencesStorage.save(updated);
      return {
        ...state,
        preferences: updated,
      };
    }
    case 'RESET_PREFERENCES':
      PreferencesStorage.save(DEFAULT_PREFERENCES);
      return {
        ...state,
        preferences: DEFAULT_PREFERENCES,
      };
    case 'LOAD_PREFERENCES':
      return {
        ...state,
        preferences: action.payload,
      };
    case 'OPEN_MODAL':
      return {
        ...state,
        isModalOpen: true,
      };
    case 'CLOSE_MODAL':
      return {
        ...state,
        isModalOpen: false,
      };
    default:
      return state;
  }
}

function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  
  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = result[key];
    
    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(targetValue, sourceValue);
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as any;
    }
  }
  
  return result;
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(preferencesReducer, {
    preferences: DEFAULT_PREFERENCES,
    isModalOpen: false,
  });

  // Load preferences on mount
  useEffect(() => {
    const loaded = PreferencesStorage.load();
    dispatch({ type: 'LOAD_PREFERENCES', payload: loaded });
  }, []);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: updates });
  };

  const resetPreferences = () => {
    dispatch({ type: 'RESET_PREFERENCES' });
  };

  const openModal = () => {
    dispatch({ type: 'OPEN_MODAL' });
  };

  const closeModal = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };

  const value: PreferencesContextType = {
    preferences: state.preferences,
    isModalOpen: state.isModalOpen,
    updatePreferences,
    resetPreferences,
    openModal,
    closeModal,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context.preferences;
}

export function usePreferencesModal() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferencesModal must be used within a PreferencesProvider');
  }
  return {
    isModalOpen: context.isModalOpen,
    openModal: context.openModal,
    closeModal: context.closeModal,
  };
}

export function useUpdatePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('useUpdatePreferences must be used within a PreferencesProvider');
  }
  return context.updatePreferences;
}

export function useResetPreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('useResetPreferences must be used within a PreferencesProvider');
  }
  return context.resetPreferences;
}

