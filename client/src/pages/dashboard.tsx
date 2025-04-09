import { useQuery } from "@tanstack/react-query";
import MetricCard from "@/components/dashboard/MetricCard";
import RecentOrders from "@/components/dashboard/RecentOrders";
import InventoryAlert from "@/components/dashboard/InventoryAlert";
import SalesChart from "@/components/dashboard/SalesChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, ShoppingBag, Package, Users } from "lucide-react";
import { Link } from "wouter";
import { useCompanySettings } from "@/hooks/use-company-settings";

const Dashboard = () => {
  const { toast } = useToast();
  const { companySettings } = useCompanySettings();
  const primaryColor = companySettings?.primaryColor || "#0078D4";

  // Fetch dashboard metrics
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ["/api/metrics/dashboard"],
  });

  // Fetch inventory alerts
  const { data: inventoryAlerts, isLoading: isLoadingAlerts } = useQuery({
    queryKey: ["/api/inventory/alerts"],
  });

  // Handle alert actions
  const handleAlertAction = (alertType: string, productId: number) => {
    // In a real app, this would handle the specific action
    switch (alertType) {
      case "low_stock":
        toast({
          title: "Order Initiated",
          description: "Product order has been initiated",
        });
        break;
      case "expiration":
        toast({
          title: "Details Viewed",
          description: "Viewing expiration details",
        });
        break;
      case "reorder":
        toast({
          title: "Reorder Initiated",
          description: "Product reorder has been initiated",
        });
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Company Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoadingMetrics ? (
            Array(4).fill(0).map((_, index) => (
              <Card key={index} className="p-6">
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-10 w-28 mb-4" />
                <Skeleton className="h-6 w-36" />
              </Card>
            ))
          ) : (
            <>
              <MetricCard
                title="Total Sales"
                value={metrics?.totalSales.value || "$0"}
                change={metrics?.totalSales.change || "0%"}
                trend={metrics?.totalSales.trend || "up"}
                icon={DollarSign}
                iconColor={primaryColor}
              />
              <MetricCard
                title="Orders"
                value={metrics?.orders.value || 0}
                change={metrics?.orders.change || "0%"}
                trend={metrics?.orders.trend || "up"}
                icon={ShoppingBag}
                iconColor="#2B88D8"
              />
              <MetricCard
                title="Inventory Items"
                value={metrics?.inventory.value || 0}
                change={metrics?.inventory.change || "0%"}
                trend={metrics?.inventory.trend || "down"}
                icon={Package}
                iconColor="#106EBE"
              />
              <MetricCard
                title="Active Users"
                value={metrics?.users.value || 0}
                change={metrics?.users.change || "0%"}
                trend={metrics?.users.trend || "up"}
                icon={Users}
                iconColor="#107C10"
              />
            </>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Section */}
        <RecentOrders limit={4} />

        {/* Inventory Alerts Section */}
        <Card className="shadow-sm border border-neutral-300">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Inventory Alerts</CardTitle>
              <Link href="/inventory">
                <a 
                  className="text-sm hover:underline" 
                  style={{ color: primaryColor }}
                >
                  View All
                </a>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingAlerts ? (
                Array(3).fill(0).map((_, index) => (
                  <Skeleton key={index} className="h-20 w-full" />
                ))
              ) : !inventoryAlerts || inventoryAlerts.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No inventory alerts
                </div>
              ) : (
                inventoryAlerts.map((alert: any) => (
                  <InventoryAlert
                    key={alert.id}
                    type={alert.type}
                    title={alert.type === 'low_stock' 
                      ? 'Low Stock Alert' 
                      : alert.type === 'expiration' 
                        ? 'Expiration Alert' 
                        : 'Reorder Reminder'
                    }
                    message={alert.message}
                    actionLabel={
                      alert.type === 'low_stock' 
                        ? 'Order' 
                        : alert.type === 'expiration' 
                          ? 'Details' 
                          : 'Reorder'
                    }
                    onAction={() => handleAlertAction(alert.type, alert.productId)}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart Section */}
      <SalesChart />
    </div>
  );
};

export default Dashboard;
