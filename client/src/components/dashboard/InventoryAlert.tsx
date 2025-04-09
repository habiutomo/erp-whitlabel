import { AlertTriangle, Clock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompanySettings } from "@/hooks/use-company-settings";

type AlertType = 'low_stock' | 'expiration' | 'reorder';

interface InventoryAlertProps {
  type: AlertType;
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}

const InventoryAlert = ({
  type,
  title,
  message,
  actionLabel,
  onAction
}: InventoryAlertProps) => {
  const { companySettings } = useCompanySettings();
  const primaryColor = companySettings?.primaryColor || "#0078D4";

  // Determine styles based on alert type
  const getStyles = () => {
    switch (type) {
      case 'low_stock':
        return {
          bg: 'bg-destructive bg-opacity-5',
          border: 'border-destructive border-opacity-20',
          iconBg: 'bg-destructive bg-opacity-10',
          iconColor: 'text-destructive',
          Icon: AlertTriangle
        };
      case 'expiration':
        return {
          bg: 'bg-warning bg-opacity-5',
          border: 'border-warning border-opacity-20',
          iconBg: 'bg-warning bg-opacity-10',
          iconColor: 'text-warning',
          Icon: Clock
        };
      case 'reorder':
        return {
          bg: 'bg-primary bg-opacity-5',
          border: 'border-primary border-opacity-20',
          iconBg: 'bg-primary bg-opacity-10',
          iconColor: 'text-primary',
          Icon: Info
        };
    }
  };

  const styles = getStyles();
  const { Icon } = styles;

  return (
    <div className={`flex items-center p-3 ${styles.bg} border ${styles.border} rounded-lg`}>
      <div className={`flex-shrink-0 h-10 w-10 rounded-full ${styles.iconBg} flex items-center justify-center ${styles.iconColor}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
      <Button 
        variant="link" 
        className="text-sm"
        style={{ color: primaryColor }}
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </div>
  );
};

export default InventoryAlert;
