import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanySettings } from "@/hooks/use-company-settings";
import { cn } from "@/lib/utils";

interface RecentOrdersProps {
  limit?: number;
}

const RecentOrders = ({ limit = 5 }: RecentOrdersProps) => {
  const { companySettings } = useCompanySettings();
  const primaryColor = companySettings?.primaryColor || "#0078D4";

  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return {
          bg: "bg-success bg-opacity-10",
          text: "text-success"
        };
      case "processing":
        return {
          bg: "bg-primary bg-opacity-10",
          text: "text-primary"
        };
      case "pending":
        return {
          bg: "bg-warning bg-opacity-10",
          text: "text-warning"
        };
      default:
        return {
          bg: "bg-muted bg-opacity-10",
          text: "text-muted-foreground"
        };
    }
  };

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const limitedOrders = orders ? orders.slice(0, limit) : [];

  return (
    <Card className="shadow-sm border border-neutral-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Recent Orders</CardTitle>
          <Link href="/sales">
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-300">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-300">
              {isLoading ? (
                Array(limit).fill(0).map((_, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-5 w-20" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-5 w-32" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-5 w-20" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-5 w-24" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-5 w-28" />
                    </td>
                  </tr>
                ))
              ) : limitedOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    No orders found
                  </td>
                </tr>
              ) : (
                limitedOrders.map((order: any) => {
                  const statusStyle = getStatusStyles(order.status);
                  return (
                    <tr key={order.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                        {order.customerName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                        ${parseFloat(order.total).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "px-2 text-xs font-semibold rounded-full",
                            statusStyle.bg,
                            statusStyle.text
                          )}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(order.created)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
