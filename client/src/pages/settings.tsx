import { useState } from "react";
import { useCompanySettings } from "@/hooks/use-company-settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, Upload } from "lucide-react";

const Settings = () => {
  const { companySettings, isLoading, updateCompanySettings } = useCompanySettings();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [companyName, setCompanyName] = useState(companySettings?.name || "");
  const [primaryColor, setPrimaryColor] = useState(companySettings?.primaryColor || "#0078D4");
  const [secondaryColor, setSecondaryColor] = useState(companySettings?.secondaryColor || "#106EBE");
  const [logoUrl, setLogoUrl] = useState(companySettings?.logo || "");

  // Update local state when companySettings are loaded
  if (companySettings && companyName === "" && !isLoading) {
    setCompanyName(companySettings.name);
    setPrimaryColor(companySettings.primaryColor);
    setSecondaryColor(companySettings.secondaryColor);
    setLogoUrl(companySettings.logo);
  }

  const handleBrandingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      await updateCompanySettings({
        name: companyName,
        primaryColor,
        secondaryColor,
        logo: logoUrl
      });
      
      toast({
        title: "Branding Updated",
        description: "Your branding settings have been saved successfully."
      });
    } catch (error) {
      console.error("Failed to update branding:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // In a real app, this would handle file upload to a storage service
  const handleLogoUpload = () => {
    toast({
      title: "Logo Upload",
      description: "In a real app, this would open a file dialog to upload a logo.",
    });
  };

  // Color picker preview component
  const ColorPreview = ({ color }: { color: string }) => (
    <div 
      className="w-8 h-8 rounded-full border border-neutral-300 mr-2 flex-shrink-0"
      style={{ backgroundColor: color }}
    />
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      
      <Tabs defaultValue="branding">
        <TabsList className="mb-4">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        
        {/* Branding Settings */}
        <TabsContent value="branding">
          <Card className="shadow-sm border border-neutral-300">
            <CardHeader>
              <CardTitle>Branding Settings</CardTitle>
              <CardDescription>
                Customize your company's branding across the entire system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBrandingSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      disabled={isLoading || isSaving}
                      placeholder="Enter your company name"
                      className="max-w-md"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Company Logo</Label>
                    <div className="flex items-center gap-4 max-w-md">
                      <div className="w-36 h-20 flex items-center justify-center border border-dashed border-neutral-300 rounded-md overflow-hidden bg-neutral-50">
                        {logoUrl ? (
                          <img 
                            src={logoUrl} 
                            alt="Company logo" 
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground">No logo set</span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Input
                          id="logoUrl"
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          disabled={isLoading || isSaving}
                          placeholder="Logo URL"
                          className="w-full"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={handleLogoUpload}
                          disabled={isLoading || isSaving}
                        >
                          <Upload className="h-4 w-4 mr-2" /> Upload Logo
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      For best results, use a transparent PNG logo with dimensions of 120x50 pixels.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center max-w-md">
                      <ColorPreview color={primaryColor} />
                      <Input
                        id="primaryColor"
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        disabled={isLoading || isSaving}
                        className="flex-1"
                      />
                      <Input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        disabled={isLoading || isSaving}
                        className="w-12 h-10 p-0 ml-2"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Used for main actions, highlighted items, and navigation.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex items-center max-w-md">
                      <ColorPreview color={secondaryColor} />
                      <Input
                        id="secondaryColor"
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        disabled={isLoading || isSaving}
                        className="flex-1"
                      />
                      <Input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        disabled={isLoading || isSaving}
                        className="w-12 h-10 p-0 ml-2"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Used for supporting elements, secondary buttons, and accents.
                    </p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={isLoading || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border border-neutral-300 mt-6">
            <CardHeader>
              <CardTitle>Branding Preview</CardTitle>
              <CardDescription>
                See how your branding changes will look across the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <div 
                  className="h-12 flex items-center px-4 font-semibold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {companyName || "Company Name"}
                </div>
                <div className="p-4 flex flex-col gap-4">
                  <h3 className="text-lg font-semibold">Interface Preview</h3>
                  <div className="flex space-x-4">
                    <Button 
                      style={{ backgroundColor: primaryColor }}
                      className="hover:opacity-90 transition"
                    >
                      Primary Button
                    </Button>
                    <Button 
                      variant="outline" 
                      style={{ color: primaryColor, borderColor: primaryColor }}
                      className="hover:opacity-90 transition"
                    >
                      Secondary Button
                    </Button>
                  </div>
                  <div className="flex items-center mt-2">
                    <div 
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <span className="text-sm">Primary Color Element</span>
                  </div>
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: secondaryColor }}
                    />
                    <span className="text-sm">Secondary Color Element</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Modules Settings */}
        <TabsContent value="modules">
          <Card className="shadow-sm border border-neutral-300">
            <CardHeader>
              <CardTitle>Module Configuration</CardTitle>
              <CardDescription>
                Enable or disable specific modules based on your organization's needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Module configuration will be available in a future update
                </h3>
                <p className="text-sm text-muted-foreground">
                  This feature allows you to customize which modules are available to users.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* System Settings */}
        <TabsContent value="system">
          <Card className="shadow-sm border border-neutral-300">
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system-wide settings and defaults.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  System settings will be available in a future update
                </h3>
                <p className="text-sm text-muted-foreground">
                  This feature allows you to configure system-wide defaults and behaviors.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
