import { useState } from "react";
import { useLocation } from "wouter";
import { useCompanySettings } from "@/hooks/use-company-settings";
import Sidebar from "@/components/ui/sidebar";
import { Menu, Bell, HelpCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const { companySettings } = useCompanySettings();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get current page title based on location
  const getPageTitle = () => {
    const path = location.split("/")[1] || "dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  // Fetch current user info
  const { data: currentUser } = useQuery({
    queryKey: ["/api/users/1"],
    enabled: false, // In a real app, this would be enabled and fetch the logged-in user
  });

  // For demo purposes, use a mock user
  const user: {
    id: number;
    fullName: string;
    role: string;
    username: string;
  } = currentUser as any || {
    id: 1,
    fullName: "John Smith",
    role: "Administrator",
    username: "admin",
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              {/* Mobile Sidebar */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-muted-foreground"
                    onClick={() => setIsMobileMenuOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 max-w-[280px]">
                  <Sidebar mobile onNavigate={() => setIsMobileMenuOpen(false)} />
                </SheetContent>
              </Sheet>
              <h1 className="ml-4 md:ml-0 text-xl font-semibold text-foreground">
                {getPageTitle()}
              </h1>
            </div>

            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="ml-3 text-muted-foreground">
                <HelpCircle className="h-5 w-5" />
              </Button>
              <div className="ml-3 md:hidden">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                  <AvatarFallback>{user.fullName.substring(0, 2)}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-neutral-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
