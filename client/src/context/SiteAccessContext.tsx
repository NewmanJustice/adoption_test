import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SiteAccessContextValue {
  required: boolean;
  granted: boolean;
  loading: boolean;
  checkAccess: () => Promise<void>;
}

const SiteAccessContext = createContext<SiteAccessContextValue | undefined>(undefined);

export const useSiteAccess = (): SiteAccessContextValue => {
  const context = useContext(SiteAccessContext);
  if (!context) {
    throw new Error('useSiteAccess must be used within a SiteAccessProvider');
  }
  return context;
};

interface SiteAccessProviderProps {
  children: ReactNode;
}

export const SiteAccessProvider: React.FC<SiteAccessProviderProps> = ({ children }) => {
  const [required, setRequired] = useState(false);
  const [granted, setGranted] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAccess = async () => {
    try {
      const response = await fetch('/api/site-access/status', {
        credentials: 'include',
      });
      const data = await response.json();
      setRequired(data.required);
      setGranted(data.granted);
    } catch {
      // If we can't check, assume no access required
      setRequired(false);
      setGranted(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAccess();
  }, []);

  const value: SiteAccessContextValue = {
    required,
    granted,
    loading,
    checkAccess,
  };

  return (
    <SiteAccessContext.Provider value={value}>
      {children}
    </SiteAccessContext.Provider>
  );
};
