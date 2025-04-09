import { Link, useLocation } from "wouter";
import { useCompanySettings } from "@/hooks/use-company-settings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart, 
  Users, 
  Settings, 
  LogOut
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type SidebarProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

const Sidebar = ({ mobile = false, onNavigate }: SidebarProps) => {
  const [location] = useLocation();
  const { companySettings } = useCompanySettings();

  // Fetch current user info - in a real app would be enabled
  const { data: currentUser } = useQuery({
    queryKey: ["/api/users/1"],
    enabled: false,
  });

  // For demo purposes, use a mock user
  const user = currentUser || {
    id: 1,
    fullName: "John Smith",
    role: "Administrator",
    username: "admin",
  };

  const navigationItems = [
    { label: "Dashboard", href: "/", icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
    { label: "Inventory", href: "/inventory", icon: <Package className="w-5 h-5 mr-3" /> },
    { label: "Sales & Orders", href: "/sales", icon: <ShoppingCart className="w-5 h-5 mr-3" /> },
    { label: "Reports", href: "/reports", icon: <BarChart className="w-5 h-5 mr-3" /> },
  ];

  const adminItems = [
    { label: "User Management", href: "/users", icon: <Users className="w-5 h-5 mr-3" /> },
    { label: "Settings", href: "/settings", icon: <Settings className="w-5 h-5 mr-3" /> },
  ];

  const handleNavigation = (href: string) => {
    if (onNavigate) {
      onNavigate();
    }
  };

  // Get primary color from company settings
  const primaryColor = companySettings?.primaryColor || "#0078D4";

  return (
    <div className="flex flex-col w-64 border-r border-neutral-300 h-full">
      {/* Company Logo Area */}
      <div 
        className="px-4 py-6 bg-white flex flex-col items-center border-b border-neutral-300"
        style={{ backgroundColor: mobile ? "#fff" : "#fff" }}
      >
        {companySettings?.logo ? (
          <img 
            src={companySettings.logo} 
            alt={`${companySettings.name} Logo`} 
            className="h-10 mb-2" 
          />
        ) : (
          <div 
            className="h-10 w-28 mb-2 flex items-center justify-center text-white font-semibold rounded"
            style={{ backgroundColor: primaryColor }}
          >
            {companySettings?.name?.substring(0, 1) || "A"}
          </div>
        )}
        <h1 className="text-lg font-semibold text-center">{companySettings?.name}</h1>
      </div>

      {/* Navigation Menu */}
      <div className="flex-grow flex flex-col justify-between bg-white">
        <nav className="pt-4 pb-4 space-y-1 overflow-y-auto">
          <div className="px-4 py-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Main</span>
          </div>

          {navigationItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={() => handleNavigation(item.href)}
            >
              <a 
                className={cn(
                  "flex items-center px-6 py-3", 
                  location === item.href 
                    ? "bg-primary text-primary-foreground" 
                    : "text-foreground hover:bg-neutral-100"
                )}
                style={
                  location === item.href 
                    ? { backgroundColor: primaryColor } 
                    : undefined
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            </Link>
          ))}

          <div className="px-4 py-2 mt-6">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Administration</span>
          </div>

          {adminItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={() => handleNavigation(item.href)}
            >
              <a 
                className={cn(
                  "flex items-center px-6 py-3", 
                  location === item.href 
                    ? "bg-primary text-primary-foreground" 
                    : "text-foreground hover:bg-neutral-100"
                )}
                style={
                  location === item.href 
                    ? { backgroundColor: primaryColor } 
                    : undefined
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="border-t border-neutral-300 p-4">
          <div className="flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
              <AvatarFallback>{user.fullName.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-foreground">{user.fullName}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
            <div className="ml-auto">
              <button className="text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
