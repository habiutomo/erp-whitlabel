import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertCompanySettingsSchema } from "@shared/schema";
import { z } from "zod";

export type CompanySettings = {
  id: number;
  name: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  modules: string[];
};

interface CompanyContextType {
  companySettings: CompanySettings | null;
  isLoading: boolean;
  error: string | null;
  updateCompanySettings: (settings: Partial<CompanySettings>) => Promise<void>;
}

const defaultSettings: CompanySettings = {
  id: 1,
  name: "Acme Corporation",
  logo: "",
  primaryColor: "#0078D4",
  secondaryColor: "#106EBE",
  modules: ["dashboard", "inventory", "sales", "reports", "users", "settings"]
};

const CompanyContext = createContext<CompanyContextType>({
  companySettings: defaultSettings,
  isLoading: false,
  error: null,
  updateCompanySettings: async () => {},
});

export const CompanyProvider = ({ children }: { children: ReactNode }) => {
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCompanySettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/company");
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setCompanySettings(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch company settings:", err);
        setError("Failed to load company settings");
        
        // Use default settings if we can't fetch from API
        setCompanySettings(defaultSettings);
        
        toast({
          title: "Error",
          description: "Failed to load company settings. Using defaults.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanySettings();
  }, [toast]);

  const updateCompanySettings = async (settings: Partial<CompanySettings>) => {
    if (!companySettings) return;
    
    try {
      setIsLoading(true);
      
      // Validate settings with the schema
      const updateData = insertCompanySettingsSchema.parse({
        ...companySettings,
        ...settings
      });
      
      await apiRequest("POST", "/api/company", updateData);
      
      // Update local state
      setCompanySettings(prev => prev ? { ...prev, ...settings } : null);
      
      toast({
        title: "Settings Updated",
        description: "Company settings have been updated successfully.",
      });
      
      setError(null);
    } catch (err) {
      console.error("Failed to update company settings:", err);
      
      let errorMessage = "Failed to update company settings";
      if (err instanceof z.ZodError) {
        errorMessage = `Validation error: ${err.errors[0]?.message || "Invalid data"}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CompanyContext.Provider
      value={{
        companySettings,
        isLoading,
        error,
        updateCompanySettings,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export default CompanyContext;
