import { useContext } from 'react';
import CompanyContext from '@/contexts/CompanyContext';

export const useCompanySettings = () => {
  const context = useContext(CompanyContext);
  
  if (context === undefined) {
    throw new Error('useCompanySettings must be used within a CompanyProvider');
  }
  
  return context;
};
